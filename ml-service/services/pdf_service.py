import pdfplumber
import requests
import io
import re
import logging
from typing import Dict, Any
from services.ocr_service import OCRService

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        """Initialize PDF service"""
        self.ocr_service = OCRService()
        logger.info("PDF Service initialized")
    
    async def extract_from_pdf(self, pdf_url: str, report_type: str) -> Dict[str, Any]:
        """
        Extract health data from PDF report
        
        Args:
            pdf_url: URL of the PDF file
            report_type: Type of report
        
        Returns:
            Dictionary containing extracted health data
        """
        try:
            # Download PDF
            logger.info(f"Downloading PDF from {pdf_url}")
            response = requests.get(pdf_url, timeout=30)
            response.raise_for_status()
            
            # Extract text from PDF
            pdf_file = io.BytesIO(response.content)
            extracted_text = ""
            
            with pdfplumber.open(pdf_file) as pdf:
                logger.info(f"PDF has {len(pdf.pages)} pages")
                
                # Extract text from all pages
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"
                        logger.info(f"Extracted text from page {page_num}")
            
            if not extracted_text.strip():
                logger.warning("No text extracted from PDF - might be image-based")
                # If PDF is image-based, you could convert to images and use OCR
                return {
                    'error': 'PDF appears to be image-based. Please upload as image file.',
                    'confidence': 0
                }
            
            logger.info(f"Total extracted text length: {len(extracted_text)}")
            
            # Use the same parsing logic as OCR service
            parsed_data = self.ocr_service._parse_report_text(extracted_text, report_type)
            
            # Add PDF-specific metadata
            parsed_data['source'] = 'pdf'
            parsed_data['confidence'] = 85.0  # PDFs generally have good text extraction
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error extracting from PDF: {str(e)}")
            raise
    
    def extract_tables_from_pdf(self, pdf_url: str) -> list:
        """
        Extract tables from PDF (useful for structured reports)
        
        Args:
            pdf_url: URL of the PDF file
        
        Returns:
            List of extracted tables
        """
        try:
            response = requests.get(pdf_url, timeout=30)
            response.raise_for_status()
            
            pdf_file = io.BytesIO(response.content)
            tables = []
            
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)
            
            return tables
            
        except Exception as e:
            logger.error(f"Error extracting tables from PDF: {str(e)}")
            return []
