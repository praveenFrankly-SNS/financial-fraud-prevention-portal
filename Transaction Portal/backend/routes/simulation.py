from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import time
import uuid
import logging

from ..services.model_serving import model_service
from ..config import FINANCE_PORTAL_URL

logger = logging.getLogger("simulation_route")
router = APIRouter()

OUTCOME_MESSAGES = {
    "ALLOW":     "Payment would be completed successfully.",
    "CHALLENGE": "Additional verification would be required.",
    "BLOCK":     "Payment would be declined for security reasons.",
}


class SimulationRequest(BaseModel):
    scenario:           Optional[str]  = "normal"
    amount:             float          = 5000.0
    merchant:           Optional[str]  = "Amazon"
    payment_method:     Optional[str]  = "upi"
    customer_id:        Optional[str]  = "CUST-1001"
    location:           Optional[str]  = "Mumbai, India"
    device:             Optional[str]  = "Chrome on Windows"
    ip_address:         Optional[str]  = "203.0.113.45"
    velocity_5m:        Optional[int]  = 1
    velocity_10m:       Optional[int]  = 2
    is_new_device:      Optional[bool] = False
    is_new_location:    Optional[bool] = False
    is_new_merchant:    Optional[bool] = False
    impossible_travel:  Optional[bool] = False
    multiple_rapid_txns: Optional[bool] = False
    high_risk_category: Optional[bool] = False
    new_payee:          Optional[bool] = False
    past_fraud_history: Optional[bool] = False


@router.post("/simulation")
def run_simulation(body: SimulationRequest):
    """
    Developer/Simulation Mode endpoint — never part of the customer journey.
    Returns the full fraud decision including risk score, breakdown, and triggered signals.
    Called only from WF-C05 Simulation Mode.
    """
    transaction_id = f"SIM-{uuid.uuid4().hex[:8].upper()}"

    v5m = body.velocity_5m or (12 if body.multiple_rapid_txns else 1)
    v10m = body.velocity_10m or (24 if body.multiple_rapid_txns else 2)

    features = model_service.build_features(
        amount            = body.amount,
        velocity_5m       = v5m,
        velocity_10m      = v10m,
        is_new_device     = body.is_new_device or False,
        is_new_location   = body.is_new_location or False,
        is_new_merchant   = body.is_new_merchant or False,
        impossible_travel = body.impossible_travel or False,
        high_risk_category = body.high_risk_category or False,
        past_fraud_history = body.past_fraud_history or False,
    )
    result = model_service.score_and_decide(features)

    if result.get("status") == "error":
        print(f"\n[SIMULATION REJECTED] {result.get('message')}\n")
        return {
            "transactionId": transaction_id,
            "scenario": body.scenario,
            "status": "UNAVAILABLE",
            "fraudProbability": 0.0,
            "riskLevel": "UNKNOWN",
            "customerMessage": result.get("message", "Security service temporarily unavailable. Please try again later."),
            "processingTimeMs": result.get("processing_time_ms", 0),
            "triggeredSignals": [],
            "rulesTriggered": 0,
            "riskBreakdown": {},
            "merchant": body.merchant,
            "amount": body.amount,
            "location": body.location,
            "device": body.device,
            "ipAddress": body.ip_address,
            "financePortalUrl": FINANCE_PORTAL_URL,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    # Triggered signals (human-readable for demo display)
    triggered_signals: List[str] = []
    if body.amount > 50000:
        triggered_signals.append("High value transaction")
    if body.is_new_device:
        triggered_signals.append("New device detected")
    if body.is_new_location:
        triggered_signals.append("Unusual location")
    if body.impossible_travel:
        triggered_signals.append("Impossible travel speed")
    if (body.velocity_5m or 1) > 3:
        triggered_signals.append("High transaction velocity")
    if body.multiple_rapid_txns:
        triggered_signals.append("Multiple rapid transactions")
    if body.is_new_merchant:
        triggered_signals.append("New merchant / payee")
    if body.new_payee:
        triggered_signals.append("Unrecognised payee")
    if body.past_fraud_history:
        triggered_signals.append("Past fraud on account")
    if body.high_risk_category:
        triggered_signals.append("High-risk merchant category")

    risk_score = result["raw_score"]
    risk_breakdown = {
        "Behavioural Anomaly": min(1.0, round(risk_score * 0.95, 2)),
        "Location Risk":       min(1.0, round(0.75 if (body.is_new_location or body.impossible_travel) else 0.08, 2)),
        "Device Risk":         min(1.0, round(0.82 if body.is_new_device else 0.05, 2)),
        "Velocity Risk":       min(1.0, round(min(0.9, (body.velocity_5m or 1) * 0.15), 2)),
        "Historical Risk":     min(1.0, round(0.65 if body.past_fraud_history else 0.10, 2)),
    }

    logger.info(
        "Simulation %s | scenario=%s amount=₹%.2f decision=%s score=%.3f signals=%d",
        transaction_id, body.scenario, body.amount, result["decision"],
        risk_score, len(triggered_signals)
    )

    # Sync simulation transaction to Finance Operations Portal backend
    try:
        import urllib.request
        import json
        sync_payload = {
            "transaction_id": transaction_id,
            "customer_id": body.customer_id or "CUST-1001",
            "customer_name": "Praveen Kumar",
            "merchant": body.merchant or "Amazon",
            "amount": body.amount,
            "decision": result["decision"],
            "risk_score": risk_score,
            "risk_level": result["risk_level"],
            "rules_triggered": triggered_signals,
            "payment_method": (body.payment_method or "upi").upper(),
            "location": body.location or "Mumbai, India",
            "device": body.device or "Chrome on Windows",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        req = urllib.request.Request(
            "http://localhost:5000/api/transactions/record",
            data=json.dumps(sync_payload).encode(),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=2)
    except Exception as e:
        logger.warning("Could not sync simulation transaction to Finance Ops Portal: %s", e)

    return {
        "transactionId":      transaction_id,
        "scenario":           body.scenario,
        "status":             result["decision"],        # ALLOW | CHALLENGE | BLOCK
        "fraudProbability":   risk_score,
        "riskLevel":          result["risk_level"],
        "customerMessage":    OUTCOME_MESSAGES[result["decision"]],
        "processingTimeMs":   result["processing_time_ms"],
        "triggeredSignals":   triggered_signals,
        "rulesTriggered":     len(triggered_signals),
        "riskBreakdown":      risk_breakdown,
        "merchant":           body.merchant,
        "amount":             body.amount,
        "location":           body.location,
        "device":             body.device,
        "ipAddress":          body.ip_address,
        "financePortalUrl":   FINANCE_PORTAL_URL,
        "timestamp":          time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
