import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import random
from io import BytesIO
import joblib

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Set this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuotationResult(BaseModel):
    premium: float
    risk_score: float
    recommendation: str
    # print(df.columns)


# Load the trained model and vectorizer
try:
    model = joblib.load("risk_analysis_model.pkl")
    vectorizer = joblib.load("tfidf_vectorizer.pkl")
except FileNotFoundError:
    print("Warning: Model or vectorizer not found. Using mock predictions.")
    model = None
    vectorizer = None

def process_financial_statement(file: UploadFile):
    content = file.file.read()
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(content))
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(BytesIO(content))
        elif file.filename.endswith(".pdf"):
            # For simplicity, we'll use random values for PDF
            pass
            # df = pd.DataFrame({"assets": [random.randint(100000, 500000)], "liabilities": [random.randint(50000, 200000)]})
        else:
            raise HTTPException(status_code=400, detail="Unsupported financial statement format")
        # if 'assets' not in df.columns or 'liabilities' not in df.columns:
        #     raise HTTPException(status_code=400, detail="Missing required columns: 'assets' and/or 'liabilities'")
        

        # financial_health = df["assets"].sum() - df["liabilities"].sum()
        # return financial_health
        return {
            "message": "documents uploaded succcessfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing financial statement: {str(e)}")


def analyze_proposal(file: UploadFile):
    content = file.file.read().decode("utf-8")
    if model and vectorizer:
        features = vectorizer.transform([content])
        risk_score = model.predict_proba(features)[0][1]  # Assuming binary classification
    else:
        risk_score = random.uniform(0, 1)
    return risk_score

@app.post("/upload")
async def upload_files(proposal_form: UploadFile = File(...), financial_statement: UploadFile = File(...)):
    if not proposal_form.filename.endswith(('.pdf', '.docx', '.doc')) or not financial_statement.filename.endswith(('.pdf', '.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Supported formats are PDF, CSV, XLSX, XLS, DOC, and DOCX.")
    
    try:
        financial_health = process_financial_statement(financial_statement)
        risk_score = analyze_proposal(proposal_form)
        
        # Calculate premium based on risk score and financial health
        base_premium = 1000
        risk_factor = 1 + risk_score
        financial_factor = 1 - (financial_health / 1000000)  # Adjust this formula as needed
        premium = base_premium * risk_factor * financial_factor

        recommendation = "Approved" if risk_score < 0.5 else "Further Review Required"

        result = QuotationResult(
            premium=round(premium, 2),
            risk_score=round(risk_score, 2),
            recommendation=recommendation
        )

        return result
    except Exception as e:
        logging.error(f"Error processing files: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)