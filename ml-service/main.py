from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import uvicorn
from typing import Optional, Dict, Any
import logging

from services.ocr_service import OCRService
from services.pdf_service import PDFService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Health Report OCR Service",
    description="ML microservice for extracting health data from medical reports using OCR",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ocr_service = OCRService()
pdf_service = PDFService()

# Request/Response models
class ReportExtractionRequest(BaseModel):
    fileUrl: HttpUrl
    reportType: str = "blood_test"

class ReportExtractionResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    processingTime: Optional[float] = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "success": True,
        "message": "🔬 Health Report OCR Service is running!",
        "version": "1.0.0",
        "endpoints": {
            "extract_report": "/extract-report",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "ocr": "operational",
            "pdf_processing": "operational"
        }
    }

@app.post("/extract-report", response_model=ReportExtractionResponse)
async def extract_report(request: ReportExtractionRequest):
    """
    Extract health data from medical report
    
    Supports:
    - Blood test reports
    - Lipid profile
    - Kidney function tests
    - Liver function tests
    - Thyroid tests
    - Diabetes markers
    - ECG reports
    - Urine analysis
    """
    try:
        logger.info(f"Processing report: {request.fileUrl}, Type: {request.reportType}")
        
        import time
        start_time = time.time()
        
        file_url = str(request.fileUrl)
        report_type = request.reportType
        
        # Determine if it's a PDF or image
        is_pdf = file_url.lower().endswith('.pdf')
        
        if is_pdf:
            # Process PDF
            extracted_data = await pdf_service.extract_from_pdf(file_url, report_type)
        else:
            # Process image
            extracted_data = await ocr_service.extract_from_image(file_url, report_type)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        logger.info(f"Report processed successfully in {processing_time:.2f}ms")
        
        return ReportExtractionResponse(
            success=True,
            message="Report processed successfully",
            data=extracted_data,
            confidence=extracted_data.get('confidence', 0),
            processingTime=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error processing report: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing report: {str(e)}"
        )

@app.post("/test-ocr")
async def test_ocr():
    """Test OCR functionality"""
    try:
        status = ocr_service.test_ocr()
        return {
            "success": True,
            "message": "OCR test completed",
            "status": status
        }
    except Exception as e:
        logger.error(f"OCR test failed: {str(e)}")
        return {
            "success": False,
            "message": "OCR test failed",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
