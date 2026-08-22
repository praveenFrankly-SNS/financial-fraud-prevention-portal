from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .routes import transaction, simulation

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("bank_portal_main")

from fastapi.responses import JSONResponse
import traceback

app = FastAPI(
    title="Bank Portal API",
    description="Customer-facing transaction API for the Bank Portal. Backed by Databricks real-time fraud detection.",
    version="1.0.0"
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print("CRITICAL BACKEND ERROR IN FASTAPI HANDLER:")
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": str(exc)})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Customer-facing: POST /api/transaction
app.include_router(transaction.router, prefix="/api", tags=["Transaction"])

# Developer/simulation mode: POST /api/simulation
app.include_router(simulation.router, prefix="/api", tags=["Simulation"])


@app.get("/")
def root():
    return {
        "service": "Bank Portal API",
        "status": "online",
        "docs": "/docs"
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    from .config import HOST, PORT
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
