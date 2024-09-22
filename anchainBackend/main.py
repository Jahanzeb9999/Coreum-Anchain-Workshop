from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
import requests
from fastapi.middleware.cors import CORSMiddleware


# Constants
COREUM_NODE_URL = "https://full-node.mainnet-1.coreum.dev:1317"
ANCHAIN_API_URL = "https://bei.anchainai.com/api/address_risk_score"
ANCHAIN_API_KEY = "2vZAbo5_teoA2UIRr96kcRbWwA0IjZlMjlkNmI1LWJjMWMtNDRiZi1hZjg3LTYyNzFmNjZmYzRmMSI.DI9z-rCl10p4G4PaIQPebjgrAh0"

# Initialize FastAPI app
app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model to validate input
class AddressRequest(BaseModel):
    address: str

# Function to check the risk score for a single Coreum address
def check_address_risk(address: str) -> Dict:
    """Check the risk score for a single Coreum address using Anchain API."""
    params = {
        "proto": "COREUM",
        "address": address,
        "apikey": ANCHAIN_API_KEY
    }
    response = requests.get(ANCHAIN_API_URL, params=params)
    response.raise_for_status()
    return response.json()

# Function to extract relevant risk information
def extract_risk_info(risk_data: Dict) -> Dict:
    """Extract relevant risk information from the API response."""
    if 'data' in risk_data and risk_data['data']:
        address_data = list(risk_data['data'].values())[0]
        risk_info = address_data.get('risk', {})
        return {
            'is_address_valid': address_data.get('is_address_valid', False),
            'risk_level': risk_info.get('level', 'N/A'),
            'risk_score': risk_info.get('score', 'N/A'),
            'verdict_time': risk_info.get('verdict_time', 'N/A'),
            'categories': address_data.get('self', {}).get('category', []),
            'details': address_data.get('self', {}).get('detail', [])
        }
    return {
        'is_address_valid': False,
        'risk_level': 'N/A',
        'risk_score': 'N/A',
        'verdict_time': 'N/A',
        'categories': [],
        'details': []
    }

# POST endpoint to fetch and process risk scores for a single address
@app.post("/risk-score", response_model=Dict)
def get_risk_score(request: AddressRequest):
    """Fetch risk score for a single Coreum address."""
    try:
        # Get the single address from the request
        address = request.address
        if not address:
            raise HTTPException(status_code=400, detail="No address provided")
        
        # Check risk score for the address
        risk_data = check_address_risk(address)
        risk_info = extract_risk_info(risk_data)
        
        return {
            "address": address,
            "risk_info": risk_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Root endpoint to confirm the server is running
@app.get("/")
def read_root():
    return {"message": "FastAPI is running!"}
