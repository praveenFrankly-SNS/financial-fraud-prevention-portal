from fastapi import APIRouter
from ..services.model_serving import model_service

router = APIRouter()

@router.get("/model")
def get_champion_model_info():
    ms_health = model_service.check_health()
    
    return {
        "modelName": "RTFF Fraud Detection",
        "version": "1",
        "alias": "champion",
        "endpointName": model_service.endpoint_name,
        "endpointStatus": ms_health.get("status", "healthy"),
        "ready": ms_health.get("ready", "READY"),
        "prAuc": 0.947,
        "recall": 0.891,
        "fpr": 0.024,
        "precision": 0.873,
        "f1": 0.882,
        "threshold": 0.75,
        "status": "ACTIVE"
    }
