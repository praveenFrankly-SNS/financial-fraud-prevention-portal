from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .routes import (
    health,
    dashboard,
    transactions,
    rule_violations,
    hitl,
    investigation,
    analytics,
    fraud,
    model
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("backend_main")

app = FastAPI(
    title="Databricks Real-Time Fraud Prevention API Bridge",
    description="Backend service connecting Finance Operations Portal UI to Databricks Unity Catalog SQL & Model Serving",
    version="1.0.0"
)

# Enable CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(transactions.router, prefix="/api", tags=["Transactions"])
app.include_router(rule_violations.router, prefix="/api", tags=["Rule Violations"])
app.include_router(hitl.router, prefix="/api", tags=["HITL Queue"])
app.include_router(investigation.router, prefix="/api", tags=["Investigation"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(fraud.router, prefix="/api", tags=["Inference"])
app.include_router(model.router, prefix="/api", tags=["Model Metadata"])

@app.get("/")
def root():
    return {
        "service": "Databricks Fraud Prevention Backend API Bridge",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=5000, reload=True)
