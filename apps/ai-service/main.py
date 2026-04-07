import os
import shutil
import tempfile
import requests
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from transformers import pipeline
import torch
from dotenv import load_dotenv
import google.generativeai as genai
from pdf2image.exceptions import PDFInfoNotInstalledError

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Load env variables (Ensure GEMINI_API_KEY and OCR_SPACE_API_KEY are in your apps/ai-service/.env)
load_dotenv()

# Tesseract Configuration (Windows Default)
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
else:
    pytesseract.pytesseract.tesseract_cmd = "tesseract"

api_key = os.getenv("GEMINI_API_KEY")
ocr_space_api_key = os.getenv("OCR_SPACE_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    generation_config = {
        "temperature": 0.3,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=generation_config,
    )
    print("✅ Gemini API Key loaded successfully.")
else:
    print("⚠️ WARNING: GEMINI_API_KEY not found. LLM generation will fail.")
    model = None

# Initialize local HuggingFace NLP pipelines lazily to save startup time if not needed immediately
_ner_pipeline = None

def get_ner_pipeline():
    global _ner_pipeline
    if _ner_pipeline is None:
        print("Loading NER Pipeline (this happens only once)...")
        _ner_pipeline = pipeline("ner", model="d4data/biomedical-ner-all", tokenizer="d4data/biomedical-ner-all", aggregation_strategy="simple")
    return _ner_pipeline

# ----------------- Core Logic -----------------
def extract_text_ocr_space(file_path):
    """Sends file to OCR Space API and parses response."""
    if not ocr_space_api_key:
        raise ValueError("OCR_SPACE_API_KEY not set.")
    
    payload = {
        'apikey': ocr_space_api_key,
        'language': 'eng',
        'isOverlayRequired': False,
        'OCREngine': 2 # Engine 2 is often better for numbers/messy text
    }
    
    with open(file_path, 'rb') as f:
        r = requests.post(
            'https://api.ocr.space/parse/image',
            files={file_path: f},
            data=payload,
        )
    
    result = r.json()
    
    if result.get('IsErroredOnProcessing'):
        error_msg = result.get('ErrorMessage', ['Unknown API error'])[0]
        raise RuntimeError(f"OCR Space Error: {error_msg}")
        
    parsed_text = ""
    for result_dict in result.get('ParsedResults', []):
        parsed_text += result_dict.get('ParsedText', '') + "\n"
        
    return parsed_text

def extract_text(file_path: str) -> str:
    print(f"Extracting text from document: {file_path}")
    
    # 1. Attempt OCR Space if configured
    if ocr_space_api_key:
        try:
            print("Attempting OCR using OCR Space API...")
            text = extract_text_ocr_space(file_path)
            if text.strip():
                print("✅ Successfully used OCR Space API.")
                return text
        except Exception as e:
            print(f"⚠️ OCR Space failed: {e}. Falling back to local Tesseract...")
            
    # 2. Fallback to Local Tesseract
    print("Running local Tesseract OCR...")
    text = ""
    if file_path.lower().endswith('.pdf'):
        try:
            pages = convert_from_path(file_path)
            for page in pages:
                text += pytesseract.image_to_string(page) + "\n"
        except PDFInfoNotInstalledError:
            raise RuntimeError("PDF processing requires Poppler. Please install Poppler and add its binary folder to your system PATH (Windows), or use an image instead.")
    elif file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
    else:
        raise ValueError("Unsupported file format. Please provide a PDF or image file (.png, .jpg, .jpeg, etc.).")
    return text

def extract_medical_terms(text: str):
    """Extracts medical terms using NER with text chunking to avoid max length errors."""
    print("Extracting medical terms from text...")
    
    chunk_size = 1500  
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    
    ner_pipeline = get_ner_pipeline()
    
    terms = set()
    for i, chunk in enumerate(chunks):
        if not chunk.strip():
            continue
        try:
            entities = ner_pipeline(chunk)
            for ent in entities:
                if len(ent['word']) > 2:
                    terms.add(ent['word'])
        except Exception as e:
            print(f"Warning: NER skipped a chunk due to an error: {e}")
            
    terms_list = list(terms)
    print(f"Found {len(terms_list)} unique medical terms.")
    return terms_list

def simplify_medical_report(raw_text: str, medical_terms: list) -> str:
    if not model:
        return "Error: GEMINI_API_KEY is not configured on the server."

    prompt = f"""
You are a helpful, empathetic medical assistant. Your job is to simplify a medical report for a patient who has no medical background.

First, determine if the provided text is actually a medical report, clinical note, or laboratory results document. If the text does NOT appear to be a medical document (e.g., if it's a recipe, receipt, random article, or non-medical text), you MUST immediately abort and return EXACTLY the following error string, and nothing else:
ERROR: NOT_A_MEDICAL_REPORT

If it IS a valid medical document, here is the raw text extracted from it:
\"\"\"
{raw_text}
\"\"\"

Key medical terms we identified in the report:
{', '.join(medical_terms) if medical_terms else 'None specifically identified'}

Please provide a response organized using clear, modern Markdown with the following sections:
### 📝 Summary
A brief, easy-to-understand summary of the report.

### 🔍 Key Findings (What are the problems?)
Explain the abnormal results or main findings in simple terms. Avoid complex jargon. Highlight in bold any findings that require attention.

### 📚 Medical Terms Explained
Briefly define the key medical terms found in the report using bullet points. Focus purely on terms crucial for understanding the report.

### 💡 General Advice
Provide general, non-diagnostic advice (e.g., "Consult your doctor for a detailed diagnosis", "Stay hydrated", etc.).

IMPORTANT: Maintain a supportive and objective tone. Add a small <i>Disclaimer: I am an AI assistant and this is not a substitute for professional medical advice.</i> at the very end in italics.
"""
    print("Sending request to LLM to generate a simplified report...")
    response = model.generate_content(prompt)
    return response.text

# ----------------- FastAPI App -----------------
app = FastAPI(title="HMS AI Service - Medi-Jargon Simplifier")

# Allow requests from Next.js and Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

@app.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    """Receives a patient's medical report and returns a simplified explanation."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Save uploaded file temporarily for OCR processors
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:
        # 1. OCR
        try:
            raw_text = extract_text(temp_path)
            if not raw_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract any text from the document.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

        # 2. Extract Medical Terms
        terms = extract_medical_terms(raw_text)

        # 3. LLM Simplification
        simplified_output = simplify_medical_report(raw_text, terms)

        # Handle the new "Not a Medical Report" rejection logic
        if "ERROR: NOT_A_MEDICAL_REPORT" in simplified_output:
            raise HTTPException(status_code=406, detail="The provided document does not appear to be a medical report.")

        return {
            "success": True,
            "raw_text_length": len(raw_text),
            "terms_extracted": len(terms),
            "simplified_report": simplified_output
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error during processing: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
