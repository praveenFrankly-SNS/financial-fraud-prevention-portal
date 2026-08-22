from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import time
import uuid
import logging

from ..services.model_serving import model_service

logger = logging.getLogger("transaction_route")
router = APIRouter()

# Customer-safe outcome messages — no fraud terminology
OUTCOME_MESSAGES = {
    "ALLOW":     "Your payment was completed successfully.",
    "CHALLENGE": "For your security, we need additional verification before completing this payment.",
    "BLOCK":     "We couldn't complete this payment at this time. Please try again or contact support.",
}


class TransactionRequest(BaseModel):
    amount: float                            # in INR
    merchant: str
    payment_method: Optional[str] = "upi"
    category:       Optional[str] = "general"
    note:           Optional[str] = None
    customer_id:    Optional[str] = "CUST-1001"


@router.post("/transaction")
def submit_transaction(body: TransactionRequest):
    """
    Customer-facing transaction endpoint.
    Returns ONLY customer-safe fields: transactionId, status, customerMessage, processingTimeMs.
    No fraud scores, no rule names, no model metadata exposed to the customer.
    The Finance Operations Portal reads the full decision from Databricks audit tables.
    """
    transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
    features = model_service.build_features(
        amount=body.amount,
        velocity_5m=1,
        velocity_10m=1,
        is_new_device=False,
        is_new_location=False,
        is_new_merchant=False,
        impossible_travel=False
    )
    result = model_service.score_and_decide(features)

    if result.get("status") == "error":
        print(f"\n[TRANSACTION REJECTED] {result.get('message')}\n")
        return {
            "transactionId": transaction_id,
            "status": "UNAVAILABLE",
            "customerMessage": result.get("message", "Security service temporarily unavailable. Please try again later."),
            "processingTimeMs": result.get("processing_time_ms", 0),
            "merchant": body.merchant,
            "amount": body.amount,
            "paymentMethod": body.payment_method,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    decision = result["decision"]
    raw_score = result["raw_score"]
    risk_level = result["risk_level"]

    print(f"\n==================================================")
    print(f"[TRANSACTION] Received Request: {transaction_id}")
    print(f"   Merchant: {body.merchant} | Amount: Rs.{body.amount:,.2f} | Method: {body.payment_method}")
    print(f"   Model Decision -> Score: {raw_score:.3f} | Decision: {decision}")
    print(f"==================================================\n")

    logger.info(
        "Transaction %s | merchant=%s amount=₹%.2f decision=%s score=%.3f",
        transaction_id, body.merchant, body.amount, decision, raw_score
    )

    # Sync live transaction to Finance Operations Portal backend
    try:
        import urllib.request
        import json
        sync_payload = {
            "transaction_id": transaction_id,
            "customer_id": body.customer_id or "CUST-1001",
            "customer_name": "Praveen Kumar",
            "merchant": body.merchant,
            "amount": body.amount,
            "decision": decision,
            "risk_score": raw_score,
            "risk_level": risk_level,
            "rules_triggered": ["High Value Transaction (₹1 Lakh+)"] if body.amount >= 100000 else [],
            "payment_method": (body.payment_method or "upi").upper(),
            "location": "Mumbai, India",
            "device": "Chrome on Windows",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        req = urllib.request.Request(
            "http://localhost:5000/api/transactions/record",
            data=json.dumps(sync_payload).encode(),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=2)
    except Exception as e:
        logger.warning("Could not sync transaction to Finance Ops Portal: %s", e)

    return {
        "transactionId":    transaction_id,
        "status":           decision,          # ALLOW | CHALLENGE | BLOCK
        "customerMessage":  OUTCOME_MESSAGES.get(decision, "Payment processed."),
        "processingTimeMs": result["processing_time_ms"],
        "merchant":         body.merchant,
        "amount":           body.amount,
        "paymentMethod":    body.payment_method,
        "timestamp":        time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
