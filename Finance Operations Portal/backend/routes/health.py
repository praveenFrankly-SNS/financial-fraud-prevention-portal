from fastapi import APIRouter
from ..services.model_serving import model_service
from ..services.databricks_sql import sql_service

router = APIRouter()

@router.get("/health")
def get_health():
    ms_health = model_service.check_health()
    sql_check = sql_service.execute_statement("SELECT 1", schema="silver")
    sql_status = "healthy" if len(sql_check) > 0 else "degraded"
    
    return {
        "api": "healthy",
        "databricks": "connected",
        "sql_warehouse": sql_status,
        "model_serving": ms_health.get("status", "unknown"),
        "model_serving_ready": ms_health.get("ready"),
        "details": ms_health
    }
