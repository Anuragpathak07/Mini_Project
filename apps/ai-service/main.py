import os
import shutil
import tempfile
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
from dotenv import load_dotenv
import google.generativeai as genai

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Load env variables (Ensure GEMINI_API_KEY is in your apps/ai-service/.env)
load_dotenv()

# Tesseract Configuration (Windows Default)
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

api_key = os.getenv("GEMINI_API_KEY")
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
_tokenizer = None
_biobert_model = None
_ner_pipeline = None

def get_nlp_models():
    global _tokenizer, _biobert_model, _ner_pipeline
    if _ner_pipeline is None:
        print("Loading NLP models lazily...")
        biobert_model_name = "dmis-lab/biobert-v1.1"
        _tokenizer = AutoTokenizer.from_pretrained(biobert_model_name)
        _biobert_model = AutoModel.from_pretrained(biobert_model_name)
        _ner_pipeline = pipeline("ner", model="d4data/biomedical-ner-all", tokenizer="d4data/biomedical-ner-all", aggregation_strategy="simple")
    return _tokenizer, _biobert_model, _ner_pipeline

# ----------------- Core Logic -----------------
def extract_text(file_path: str) -> str:
    print(f"Extracting text from document: {file_path}")
    text = ""
    if file_path.lower().endswith('.pdf'):
        pages = convert_from_path(file_path)
        for page in pages:
            text += pytesseract.image_to_string(page) + "\n"
    elif file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
    else:
        raise ValueError("Unsupported file format. Please provide a PDF or image file (.png, .jpg, .jpeg, etc.).")
    return text

def extract_and_embed_medical_terms(text: str):
    tokenizer, biobert_model, ner_pipeline = get_nlp_models()
    print("Extracting medical terms from text...")
    entities = ner_pipeline(text)
    
    # Extract unique terms longer than 2 characters
    terms = list(set([ent['word'] for ent in entities if len(ent['word']) > 2]))
    print(f"Found {len(terms)} unique medical terms.")
    
    term_embeddings = {}
    print("Generating BioBERT embeddings for terms...")
    for term in terms:
        inputs = tokenizer(term, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = biobert_model(**inputs)
            # Use the CLS token embedding (first token)
            embedding = outputs.last_hidden_state[:, 0, :].squeeze().numpy()
            term_embeddings[term] = embedding.tolist() # Convert to list for JSON serialization if needed later
            
    return terms, term_embeddings

def simplify_medical_report(raw_text: str, medical_terms: list) -> str:
    if not model:
        return "Error: GEMINI_API_KEY is not configured on the server."

    prompt = f"""
You are a helpful, empathetic medical assistant. Your job is to simplify a medical report for a patient who has no medical background.

Here is the raw text extracted from the patient's medical report:
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
    
    # Save uploaded file temporarily for Tesseract to read
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:
        # 1. OCR
        raw_text = extract_text(temp_path)
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the document.")

        # 2. Extract Medical Terms
        terms, embeddings = extract_and_embed_medical_terms(raw_text)

        # 3. LLM Simplification
        simplified_output = simplify_medical_report(raw_text, terms)

        return {
            "success": True,
            "raw_text_length": len(raw_text),
            "terms_extracted": len(terms),
            "simplified_report": simplified_output
        }
    except Exception as e:
        print(f"Error during processing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
