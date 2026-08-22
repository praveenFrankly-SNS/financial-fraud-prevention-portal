from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.databricks_sql import sql_service
from ..services.fraud_operations import fraud_ops_service

from .transactions import LIVE_TRANSACTIONS

router = APIRouter()

class DecisionRequest(BaseModel):
    decision: str  # APPROVE | BLOCK | ESCALATE
    reason: Optional[str] = "Analyst manual review decision"
    analyst: Optional[str] = "analyst@financeops.com"

# In-memory session tracking for cases resolved during UI session
_resolved_cases = set()

@router.get("/hitl")
def get_hitl_queue():
    cases = []

    # Include live CHALLENGE / HITL transactions from Bank Portal
    for t in LIVE_TRANSACTIONS:
        if t["decision"] == "CHALLENGE":
            c_id = f"CASE-2026-{t['id'].replace('TXN-', '')}"
            if c_id not in _resolved_cases:
                cases.append({
                    "id": c_id,
                    "transactionId": t["id"],
                    "customerId": t["customerId"],
                    "customerName": t["customerName"],
                    "amount": t["amount"],
                    "riskScore": t["riskScore"],
                    "riskLevel": t["riskLevel"],
                    "rulesTriggered": t["rulesTriggered"],
                    "ruleCount": len(t["rulesTriggered"]),
                    "waitTime": "Just now",
                    "waitMinutes": 0,
                    "assignedTo": None,
                    "slaRemaining": "59m",
                    "slaStatus": "warning",
                    "status": "Pending",
                    "timestamp": t["timestamp"],
                    "submittedAt": t["timestamp"],
                })

    # Query high amount / pending transactions from silver.transactions
    try:
        sql = """
        SELECT * FROM fraud_prevention_dev.silver.transactions
        WHERE amount > 1500 OR payment_method = 'online'
        ORDER BY transaction_timestamp DESC
        LIMIT 15
        """
        rows = sql_service.execute_statement(sql, schema="silver")
    except Exception as e:
        rows = []
    
    cases = []
    for idx, r in enumerate(rows):
        tx_id = r.get('transaction_id', f'{idx}')
        case_id = f"CASE-2026-{tx_id}"
        if case_id in _resolved_cases:
            continue
        
        amount = float(r.get('amount') or 1500.0)
        risk_score = round(min(0.98, 0.70 + (amount % 300) / 1000.0), 2)
        cust_id = r.get('customer_id', '100')
        
        cases.append({
            "id": case_id,
            "transactionId": f"TX-{tx_id}",
            "customerId": f"C-{cust_id}",
            "customerName": f"Customer #{cust_id}",
            "amount": amount,
            "riskScore": risk_score,
            "riskLevel": "High" if risk_score >= 0.85 else "Medium",
            "rulesTriggered": ["High Velocity", "Amount Deviation"] if risk_score >= 0.85 else ["New Device"],
            "ruleCount": 2 if risk_score >= 0.85 else 1,
            "waitTime": f"{15 + idx * 5}m",
            "waitMinutes": 15 + idx * 5,
            "assignedTo": None if idx % 2 == 0 else "Alex Johnson",
            "slaRemaining": "45m" if idx < 3 else "1h 15m",
            "slaStatus": "warning" if idx < 2 else "ok",
            "status": "Pending" if idx % 2 == 0 else "In Review",
            "timestamp": str(r.get('transaction_timestamp', '')),
            "submittedAt": str(r.get('transaction_timestamp', '')),
        })

    return {
        "cases": cases,
        "kpis": {
            "totalPending": len(cases),
            "highRisk": sum(1 for c in cases if c["riskLevel"] == "High"),
            "mediumRisk": sum(1 for c in cases if c["riskLevel"] == "Medium"),
            "lowRisk": 0,
            "avgWaitTime": "32m",
            "highTrend": 5,
            "mediumTrend": 3,
            "lowTrend": -1,
            "waitTimeTrend": 18,
        },
        "slaStatus": {
            "breached": 0,
            "atRisk": sum(1 for c in cases if c["slaStatus"] == "warning"),
            "onTrack": sum(1 for c in cases if c["slaStatus"] == "ok"),
        }
    }

@router.post("/hitl/{case_id}/decision")
def submit_hitl_decision(case_id: str, body: DecisionRequest):
    valid_decisions = ["APPROVE", "BLOCK", "ESCALATE"]
    if body.decision.upper() not in valid_decisions:
        raise HTTPException(status_code=400, detail=f"Invalid decision. Must be one of {valid_decisions}")
    
    tx_id = case_id.replace("CASE-2026-", "")
    _resolved_cases.add(case_id)
    
    result = fraud_ops_service.record_hitl_decision(
        case_id=case_id,
        transaction_id=tx_id,
        decision=body.decision.upper(),
        reason=body.reason,
        analyst=body.analyst
    )
    return result
