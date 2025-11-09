import easyocr
import requests
from PIL import Image, ImageEnhance, ImageFilter
import io
import re
import logging
from typing import Dict, Any, Optional
import numpy as np

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        """Initialize EasyOCR reader"""
        try:
            # Initialize with English language with better settings
            self.reader = easyocr.Reader(
                ['en'], 
                gpu=False,
                model_storage_directory='models',
                download_enabled=True,
                verbose=False
            )
            logger.info("EasyOCR initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing EasyOCR: {str(e)}")
            self.reader = None
    
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image to improve OCR accuracy
        
        Techniques:
        - Convert to grayscale
        - Increase contrast
        - Sharpen image
        - Denoise
        - Resize to optimal size
        """
        try:
            # Convert to RGB first
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too small (medical reports should be at least 1500px wide)
            width, height = image.size
            if width < 1500:
                scale = 1500 / width
                new_size = (int(width * scale), int(height * scale))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
                logger.info(f"Resized image from {width}x{height} to {new_size}")
            
            # Convert to grayscale
            gray_image = image.convert('L')
            
            # Increase contrast
            enhancer = ImageEnhance.Contrast(gray_image)
            contrast_image = enhancer.enhance(2.0)  # Increase contrast by 2x
            
            # Increase sharpness
            enhancer = ImageEnhance.Sharpness(contrast_image)
            sharp_image = enhancer.enhance(2.0)  # Increase sharpness by 2x
            
            # Apply median filter to reduce noise
            denoised_image = sharp_image.filter(ImageFilter.MedianFilter(size=3))
            
            # Increase brightness slightly
            enhancer = ImageEnhance.Brightness(denoised_image)
            final_image = enhancer.enhance(1.2)
            
            logger.info("Image preprocessing completed")
            return final_image
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            # Return original image if preprocessing fails
            return image
    
    async def extract_from_image(self, image_url: str, report_type: str) -> Dict[str, Any]:
        """
        Extract health data from image using OCR
        
        Args:
            image_url: URL of the image to process
            report_type: Type of report (blood_test, lipid_profile, etc.)
        
        Returns:
            Dictionary containing extracted health data
        """
        try:
            # Download image
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Open image
            image = Image.open(io.BytesIO(response.content))
            
            # Preprocess image for better OCR
            processed_image = self._preprocess_image(image)
            
            # Perform OCR with better parameters
            logger.info(f"Performing OCR on image for {report_type}")
            results = self.reader.readtext(
                np.array(processed_image),
                detail=1,  # Return detailed results with confidence
                paragraph=False,  # Don't merge into paragraphs
                min_size=10,  # Minimum text size to detect
                text_threshold=0.6,  # Lower threshold for better detection
                low_text=0.3,  # Lower text detection threshold
                link_threshold=0.3,  # Lower link threshold
                canvas_size=2560,  # Larger canvas for better quality
                mag_ratio=1.5  # Magnification ratio
            )
            
            # Extract text with better formatting
            extracted_lines = []
            for bbox, text, conf in results:
                if conf > 0.3:  # Only include text with >30% confidence
                    extracted_lines.append(text)
            
            extracted_text = ' '.join(extracted_lines)
            logger.info(f"Extracted text length: {len(extracted_text)}")
            logger.info(f"Number of text blocks detected: {len(results)}")
            
            # Parse based on report type
            parsed_data = self._parse_report_text(extracted_text, report_type)
            
            # Calculate confidence
            confidence = self._calculate_confidence(results)
            parsed_data['confidence'] = confidence
            
            logger.info(f"OCR confidence: {confidence}%")
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error extracting from image: {str(e)}")
            raise
    
    def _parse_report_text(self, text: str, report_type: str) -> Dict[str, Any]:
        """Parse extracted text based on report type with flexible regex patterns"""
        
        text_lower = text.lower()
        # Remove extra spaces and normalize
        text_lower = re.sub(r'\s+', ' ', text_lower)
        
        result = {
            'raw_text': text[:1000],  # Store first 1000 chars for reference
            'report_type': report_type
        }
        
        # Helper function to extract numeric values with flexible patterns
        def extract_value(patterns, text):
            """Try multiple patterns to extract a numeric value"""
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        value = match.group(1).replace(',', '').replace(' ', '')
                        return float(value)
                    except (ValueError, AttributeError):
                        continue
            return None
        
        # Blood Test Parsing
        if 'blood' in report_type or 'cbc' in text_lower or 'hemoglobin' in text_lower or 'haemoglobin' in text_lower:
            blood_test = {}
            
            # Hemoglobin (Hb, HGB) - Multiple flexible patterns
            hb_value = extract_value([
                r'h[ae]?[eo]?moglobin[\s:]*(\d+\.?\d*)',
                r'h[be][\s:]*(\d+\.?\d*)',
                r'hgb[\s:]*(\d+\.?\d*)',
                r'hb[\s:]+(\d+\.?\d*)',
            ], text_lower)
            if hb_value:
                blood_test['hemoglobin'] = hb_value
            
            # WBC (White Blood Cells)
            wbc_value = extract_value([
                r'wbc[\s:]*(\d+[\.,]?\d*)',
                r'white[\s\w]*cell[\s:]*(\d+[\.,]?\d*)',
                r'w[\s.]?b[\s.]?c[\s:]*(\d+[\.,]?\d*)',
                r'total[\s\w]*wbc[\s:]*(\d+[\.,]?\d*)',
            ], text_lower)
            if wbc_value:
                blood_test['wbc'] = wbc_value
            
            # RBC (Red Blood Cells)
            rbc_value = extract_value([
                r'rbc[\s:]*(\d+\.?\d*)',
                r'red[\s\w]*cell[\s:]*(\d+\.?\d*)',
                r'r[\s.]?b[\s.]?c[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if rbc_value:
                blood_test['rbc'] = rbc_value
            
            # Platelets
            plt_value = extract_value([
                r'platelet[\w\s]*count[\s:]*(\d+[\.,]?\d*)',
                r'platelet[\s:]*(\d+[\.,]?\d*)',
                r'plt[\s:]*(\d+[\.,]?\d*)',
            ], text_lower)
            if plt_value:
                blood_test['platelets'] = plt_value
            
            # Hematocrit (HCT)
            hct_value = extract_value([
                r'h[ae]?matocrit[\s:]*(\d+\.?\d*)',
                r'hct[\s:]*(\d+\.?\d*)',
                r'pcv[\s:]*(\d+\.?\d*)',  # Packed Cell Volume
            ], text_lower)
            if hct_value:
                blood_test['hematocrit'] = hct_value
            
            # MCV
            mcv_value = extract_value([
                r'mcv[\s:]*(\d+\.?\d*)',
                r'mean[\s\w]*corpuscular[\s\w]*volume[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if mcv_value:
                blood_test['mcv'] = mcv_value
            
            # MCH
            mch_value = extract_value([
                r'mch[\s:]+(\d+\.?\d*)',  # Ensure it's not MCHC
                r'mean[\s\w]*corpuscular[\s\w]*hemoglobin[^c][\s:]*(\d+\.?\d*)',
            ], text_lower)
            if mch_value:
                blood_test['mch'] = mch_value
            
            # MCHC
            mchc_value = extract_value([
                r'mchc[\s:]*(\d+\.?\d*)',
                r'mean[\s\w]*corpuscular[\s\w]*hemoglobin[\s\w]*concentration[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if mchc_value:
                blood_test['mchc'] = mchc_value
            
            if blood_test:
                result['bloodTest'] = blood_test
        
        # Lipid Profile Parsing
        if 'lipid' in report_type or 'cholesterol' in text_lower:
            lipid_profile = {}
            
            # Total Cholesterol
            chol_value = extract_value([
                r'total[\s\w]*cholesterol[\s:]*(\d+\.?\d*)',
                r'cholesterol[\s\w]*total[\s:]*(\d+\.?\d*)',
                r'chol[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if chol_value:
                lipid_profile['totalCholesterol'] = chol_value
            
            # LDL
            ldl_value = extract_value([
                r'ldl[\s\w]*cholesterol[\s:]*(\d+\.?\d*)',
                r'low[\s\w]*density[\s\w]*lipoprotein[\s:]*(\d+\.?\d*)',
                r'ldl[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if ldl_value:
                lipid_profile['ldl'] = ldl_value
            
            # HDL
            hdl_value = extract_value([
                r'hdl[\s\w]*cholesterol[\s:]*(\d+\.?\d*)',
                r'high[\s\w]*density[\s\w]*lipoprotein[\s:]*(\d+\.?\d*)',
                r'hdl[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if hdl_value:
                lipid_profile['hdl'] = hdl_value
            
            # Triglycerides
            trig_value = extract_value([
                r'triglyceride[s]?[\s:]*(\d+\.?\d*)',
                r'trig[\s:]*(\d+\.?\d*)',
                r'tg[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if trig_value:
                lipid_profile['triglycerides'] = trig_value
            
            # VLDL
            vldl_value = extract_value([
                r'vldl[\s\w]*cholesterol[\s:]*(\d+\.?\d*)',
                r'very[\s\w]*low[\s\w]*density[\s:]*(\d+\.?\d*)',
                r'vldl[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if vldl_value:
                lipid_profile['vldl'] = vldl_value
            
            if lipid_profile:
                result['lipidProfile'] = lipid_profile
        
        # Kidney Function Tests
        if 'kidney' in text_lower or 'creatinine' in text_lower or 'urea' in text_lower:
            kidney_function = {}
            
            # Creatinine
            creat_value = extract_value([
                r'creatinine[\s:]*(\d+\.?\d*)',
                r'creat[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if creat_value:
                kidney_function['creatinine'] = creat_value
            
            # Urea
            urea_value = extract_value([
                r'blood[\s\w]*urea[\s:]*(\d+\.?\d*)',
                r'urea[\s:]*(\d+\.?\d*)',
                r'bun[\s:]*(\d+\.?\d*)',  # Blood Urea Nitrogen
            ], text_lower)
            if urea_value:
                kidney_function['urea'] = urea_value
            
            # Uric Acid
            uric_value = extract_value([
                r'uric[\s\w]*acid[\s:]*(\d+\.?\d*)',
                r'urate[\s:]*(\d+\.?\d*)',
            ], text_lower)
            if uric_value:
                kidney_function['uricAcid'] = uric_value
            
            # BUN (Blood Urea Nitrogen)
            bun_match = re.search(r'bun.*?(\d+\.?\d*)', text_lower)
            if not bun_match:
                bun_match = re.search(r'blood\s*urea\s*nitrogen.*?(\d+\.?\d*)', text_lower)
            if bun_match:
                kidney_function['bun'] = float(bun_match.group(1))
            
            if kidney_function:
                result['kidneyFunction'] = kidney_function
        
        # Liver Function Tests
        if 'liver' in text_lower or 'sgot' in text_lower or 'sgpt' in text_lower:
            liver_function = {}
            
            # SGOT/AST
            sgot_match = re.search(r'sgot.*?(\d+\.?\d*)', text_lower)
            if not sgot_match:
                sgot_match = re.search(r'ast.*?(\d+\.?\d*)', text_lower)
            if sgot_match:
                liver_function['sgot'] = float(sgot_match.group(1))
            
            # SGPT/ALT
            sgpt_match = re.search(r'sgpt.*?(\d+\.?\d*)', text_lower)
            if not sgpt_match:
                sgpt_match = re.search(r'alt.*?(\d+\.?\d*)', text_lower)
            if sgpt_match:
                liver_function['sgpt'] = float(sgpt_match.group(1))
            
            # Alkaline Phosphatase
            alp_match = re.search(r'alkaline\s*phosphatase.*?(\d+\.?\d*)', text_lower)
            if not alp_match:
                alp_match = re.search(r'alp.*?(\d+\.?\d*)', text_lower)
            if alp_match:
                liver_function['alkalinePhosphatase'] = float(alp_match.group(1))
            
            # Bilirubin
            bili_match = re.search(r'total\s*bilirubin.*?(\d+\.?\d*)', text_lower)
            if bili_match:
                liver_function['totalBilirubin'] = float(bili_match.group(1))
            
            direct_bili_match = re.search(r'direct\s*bilirubin.*?(\d+\.?\d*)', text_lower)
            if direct_bili_match:
                liver_function['directBilirubin'] = float(direct_bili_match.group(1))
            
            # Protein
            protein_match = re.search(r'total\s*protein.*?(\d+\.?\d*)', text_lower)
            if protein_match:
                liver_function['totalProtein'] = float(protein_match.group(1))
            
            albumin_match = re.search(r'albumin.*?(\d+\.?\d*)', text_lower)
            if albumin_match:
                liver_function['albumin'] = float(albumin_match.group(1))
            
            globulin_match = re.search(r'globulin.*?(\d+\.?\d*)', text_lower)
            if globulin_match:
                liver_function['globulin'] = float(globulin_match.group(1))
            
            if liver_function:
                result['liverFunction'] = liver_function
        
        # Diabetes Markers
        if 'diabetes' in text_lower or 'glucose' in text_lower or 'hba1c' in text_lower:
            diabetes_markers = {}
            
            # Fasting Glucose
            fasting_match = re.search(r'fasting\s*glucose.*?(\d+\.?\d*)', text_lower)
            if not fasting_match:
                fasting_match = re.search(r'fasting\s*blood\s*sugar.*?(\d+\.?\d*)', text_lower)
            if fasting_match:
                diabetes_markers['fastingGlucose'] = float(fasting_match.group(1))
            
            # Random Glucose
            random_match = re.search(r'random\s*glucose.*?(\d+\.?\d*)', text_lower)
            if random_match:
                diabetes_markers['randomGlucose'] = float(random_match.group(1))
            
            # HbA1c
            hba1c_match = re.search(r'hba1c.*?(\d+\.?\d*)', text_lower)
            if not hba1c_match:
                hba1c_match = re.search(r'glycated\s*hemoglobin.*?(\d+\.?\d*)', text_lower)
            if hba1c_match:
                diabetes_markers['hba1c'] = float(hba1c_match.group(1))
            
            # Postprandial Glucose
            pp_match = re.search(r'postprandial\s*glucose.*?(\d+\.?\d*)', text_lower)
            if not pp_match:
                pp_match = re.search(r'pp\s*glucose.*?(\d+\.?\d*)', text_lower)
            if pp_match:
                diabetes_markers['postprandialGlucose'] = float(pp_match.group(1))
            
            if diabetes_markers:
                result['diabetesMarkers'] = diabetes_markers
        
        # Thyroid Function
        if 'thyroid' in text_lower or 'tsh' in text_lower:
            thyroid_function = {}
            
            # TSH
            tsh_match = re.search(r'tsh.*?(\d+\.?\d*)', text_lower)
            if tsh_match:
                thyroid_function['tsh'] = float(tsh_match.group(1))
            
            # T3
            t3_match = re.search(r't3.*?(\d+\.?\d*)', text_lower)
            if t3_match:
                thyroid_function['t3'] = float(t3_match.group(1))
            
            # T4
            t4_match = re.search(r't4.*?(\d+\.?\d*)', text_lower)
            if t4_match:
                thyroid_function['t4'] = float(t4_match.group(1))
            
            # Free T3
            ft3_match = re.search(r'free\s*t3.*?(\d+\.?\d*)', text_lower)
            if ft3_match:
                thyroid_function['freeT3'] = float(ft3_match.group(1))
            
            # Free T4
            ft4_match = re.search(r'free\s*t4.*?(\d+\.?\d*)', text_lower)
            if ft4_match:
                thyroid_function['freeT4'] = float(ft4_match.group(1))
            
            if thyroid_function:
                result['thyroidFunction'] = thyroid_function
        
        return result
    
    def _calculate_confidence(self, ocr_results) -> float:
        """Calculate overall confidence score from OCR results"""
        if not ocr_results:
            return 0.0
        
        confidences = [result[2] for result in ocr_results]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        return round(avg_confidence * 100, 2)
    
    def test_ocr(self) -> Dict[str, Any]:
        """Test OCR functionality"""
        if not self.reader:
            return {"status": "error", "message": "EasyOCR not initialized"}
        
        return {
            "status": "operational",
            "message": "EasyOCR is ready",
            "languages": "English"
        }
