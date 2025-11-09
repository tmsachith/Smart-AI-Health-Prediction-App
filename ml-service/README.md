# ML Service - Health Report OCR

## 🔬 Overview
FastAPI-based microservice for extracting health data from medical reports using OCR (Optical Character Recognition).

## 🚀 Quick Start

### 1. Setup Virtual Environment

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** First installation will download EasyOCR models (~100-150MB). This is a one-time download.

### 3. Run the Service

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Service will be available at: **http://localhost:8000**

## 📋 API Documentation

### Endpoints

#### GET /
Health check endpoint
```json
{
  "success": true,
  "message": "🔬 Health Report OCR Service is running!",
  "version": "1.0.0"
}
```

#### GET /health
Detailed health status
```json
{
  "status": "healthy",
  "services": {
    "ocr": "operational",
    "pdf_processing": "operational"
  }
}
```

#### POST /extract-report
Extract health data from medical report

**Request:**
```json
{
  "fileUrl": "https://cloudinary.com/.../report.jpg",
  "reportType": "blood_test"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report processed successfully",
  "data": {
    "bloodTest": {
      "hemoglobin": 13.5,
      "wbc": 7200,
      "rbc": 4.8,
      "platelets": 250000,
      "hematocrit": 42.0,
      "mcv": 88.0,
      "mch": 29.5,
      "mchc": 33.5
    },
    "lipidProfile": {
      "totalCholesterol": 210,
      "ldl": 130,
      "hdl": 45,
      "triglycerides": 180,
      "vldl": 35
    },
    "confidence": 87.5,
    "raw_text": "..."
  },
  "confidence": 87.5,
  "processingTime": 2340.5
}
```

**Supported Report Types:**
- `blood_test` - Complete Blood Count (CBC)
- `lipid_profile` - Cholesterol panel
- `kidney_function` - KFT
- `liver_function` - LFT
- `thyroid` - Thyroid function tests
- `diabetes` - Glucose, HbA1c
- `ecg` - ECG reports
- `urine_test` - Urinalysis
- `other` - General reports

#### POST /test-ocr
Test OCR functionality
```json
{
  "success": true,
  "message": "OCR test completed",
  "status": {
    "status": "operational",
    "message": "EasyOCR is ready",
    "languages": "English"
  }
}
```

### Interactive API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧠 Technologies Used

### EasyOCR
- Deep learning-based OCR
- No Tesseract installation required
- High accuracy with minimal configuration
- Supports 80+ languages (currently using English)

**Why EasyOCR over Tesseract?**
- ✅ Easier installation (pip install)
- ✅ Better accuracy on medical reports
- ✅ No system dependencies
- ✅ GPU support (optional)
- ✅ Built-in text detection

### pdfplumber
- Extracts text from PDF files
- Handles tables and structured data
- Better than PyPDF2 for complex PDFs

### FastAPI
- Modern, fast web framework
- Automatic API documentation
- Type validation with Pydantic
- Async support

## 📁 Project Structure

```
ml-service/
├── main.py                  # FastAPI app entry point
├── requirements.txt         # Python dependencies
├── services/
│   ├── __init__.py
│   ├── ocr_service.py      # EasyOCR implementation
│   └── pdf_service.py      # PDF processing
└── README.md
```

## 🔍 How It Works

### Image Processing Flow

1. **Download Image** from Cloudinary URL
2. **Open Image** using PIL (Pillow)
3. **Convert to RGB** if needed
4. **Run EasyOCR** to extract text with confidence scores
5. **Parse Text** using regex patterns for each report type
6. **Return Structured Data** with confidence score

### PDF Processing Flow

1. **Download PDF** from Cloudinary URL
2. **Extract Text** from all pages using pdfplumber
3. **Parse Text** (same logic as image)
4. **Extract Tables** if report is structured
5. **Return Structured Data**

### Text Parsing Logic

The service uses regex patterns to identify health parameters:

**Example: Hemoglobin**
```python
hb_match = re.search(r'h[be]moglobin.*?(\d+\.?\d*)', text_lower)
```

**Example: Total Cholesterol**
```python
chol_match = re.search(r'total\s*cholesterol.*?(\d+\.?\d*)', text_lower)
```

**Patterns handle variations:**
- "Hemoglobin", "Haemoglobin", "Hb", "HGB"
- "Total Cholesterol", "Cholesterol Total", "CHOL"
- Case-insensitive matching
- Flexible whitespace

## 🎯 Extracted Parameters

### Blood Test (CBC)
- Hemoglobin (Hb/HGB)
- White Blood Cells (WBC)
- Red Blood Cells (RBC)
- Platelets (PLT)
- Hematocrit (HCT)
- Mean Corpuscular Volume (MCV)
- Mean Corpuscular Hemoglobin (MCH)
- Mean Corpuscular Hemoglobin Concentration (MCHC)

### Lipid Profile
- Total Cholesterol
- LDL Cholesterol (Bad)
- HDL Cholesterol (Good)
- Triglycerides
- VLDL Cholesterol

### Kidney Function Tests (KFT)
- Creatinine
- Urea / Blood Urea
- Uric Acid
- BUN (Blood Urea Nitrogen)

### Liver Function Tests (LFT)
- SGOT/AST
- SGPT/ALT
- Alkaline Phosphatase (ALP)
- Total Bilirubin
- Direct Bilirubin
- Total Protein
- Albumin
- Globulin

### Diabetes Markers
- Fasting Glucose / FBS
- Random Glucose / RBS
- HbA1c / Glycated Hemoglobin
- Postprandial Glucose (PP)

### Thyroid Function Tests
- TSH (Thyroid Stimulating Hormone)
- T3 (Triiodothyronine)
- T4 (Thyroxine)
- Free T3
- Free T4

### ECG Findings (Text-based)
- Heart Rate
- Rhythm
- PR Interval
- QRS Duration
- QT Interval
- Interpretation/Findings

### Urine Test
- pH
- Specific Gravity
- Protein
- Glucose
- Ketones
- Blood
- Leukocytes
- Nitrites

## ⚙️ Configuration

### Environment Variables (Optional)

Create `.env` file:
```env
# Server Configuration
HOST=0.0.0.0
PORT=8000

# OCR Configuration
OCR_GPU=false
OCR_LANGUAGE=en

# Logging
LOG_LEVEL=INFO
```

### Dependencies

**Core:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `python-multipart` - File upload support
- `pydantic` - Data validation
- `requests` - HTTP client

**OCR:**
- `easyocr` - OCR engine
- `Pillow` - Image processing
- `opencv-python` - Computer vision (required by EasyOCR)
- `numpy` - Array operations

**PDF:**
- `pdfplumber` - PDF text extraction
- `PyPDF2` - PDF utilities

**ML (Optional):**
- `scikit-learn` - For future AI enhancements
- `pandas` - Data manipulation

## 🧪 Testing

### Test OCR Service

```bash
curl -X POST http://localhost:8000/test-ocr
```

### Test Report Extraction

```bash
curl -X POST http://localhost:8000/extract-report \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://res.cloudinary.com/.../report.jpg",
    "reportType": "blood_test"
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/extract-report",
    json={
        "fileUrl": "https://...",
        "reportType": "blood_test"
    }
)

data = response.json()
print(data)
```

## 📊 Performance

**Typical Processing Times:**

| File Type | Size | Processing Time |
|-----------|------|-----------------|
| Image (JPEG) | 500KB | 2-4 seconds |
| Image (PNG) | 1MB | 3-5 seconds |
| PDF (text) | 200KB | 1-2 seconds |
| PDF (scan) | 2MB | 5-8 seconds |

**Factors affecting speed:**
- Image resolution
- Image quality/clarity
- Network speed (download from Cloudinary)
- CPU vs GPU processing
- Number of pages (PDF)

## 🚀 Production Deployment

### Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t ml-service .
docker run -p 8000:8000 ml-service
```

### Cloud Deployment

**Options:**
- Railway.app
- Render.com
- Google Cloud Run
- AWS Lambda (with containers)
- DigitalOcean App Platform

**Requirements:**
- Python 3.9+
- 1GB RAM minimum (2GB recommended)
- CPU: 1 vCPU minimum

## 🐛 Troubleshooting

**Issue: EasyOCR model download fails**
```
Solution: 
1. Check internet connection
2. Manually download models:
   https://github.com/JaidedAI/EasyOCR/releases
3. Place in ~/.EasyOCR/model/
```

**Issue: Low OCR accuracy**
```
Solution:
1. Ensure image is high quality (>300 DPI)
2. Image should be well-lit
3. Text should be clear and legible
4. Avoid handwritten reports
5. Check confidence score in response
```

**Issue: PDF extraction returns no data**
```
Solution:
1. Check if PDF is text-based (not scanned image)
2. For scanned PDFs, convert to images first
3. Check PDF pages are readable
```

**Issue: Memory error during processing**
```
Solution:
1. Increase server memory
2. Reduce image size before upload
3. Process fewer pages at once
```

## 🔒 Security Considerations

- ✅ File type validation (only images and PDFs)
- ✅ File size limit (10MB)
- ✅ URL validation
- ✅ No file storage on server
- ✅ CORS configured
- ⚠️ Add authentication in production
- ⚠️ Add rate limiting
- ⚠️ Sanitize file URLs

## 📈 Monitoring

**Logs:**
```python
import logging
logger = logging.getLogger(__name__)
```

**Metrics to track:**
- Processing time per request
- Success/failure rate
- OCR confidence scores
- Memory usage
- CPU usage

## 🎓 Learning Resources

**EasyOCR:**
- GitHub: https://github.com/JaidedAI/EasyOCR
- Docs: https://www.jaided.ai/easyocr/

**FastAPI:**
- Docs: https://fastapi.tiangolo.com/
- Tutorial: https://fastapi.tiangolo.com/tutorial/

**pdfplumber:**
- GitHub: https://github.com/jsvine/pdfplumber
- Docs: https://github.com/jsvine/pdfplumber/blob/stable/README.md

---

**Built with ❤️ for Smart AI Health Prediction**
**Status: Production Ready ✅**
