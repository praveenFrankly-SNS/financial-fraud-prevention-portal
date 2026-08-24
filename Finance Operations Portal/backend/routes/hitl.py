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

    # 1. Include live CHALLENGE / HITL transactions from Bank Portal / Simulator
    for t in LIVE_TRANSACTIONS:
        if t["decision"] == "CHALLENGE" or t["status"] == "HITL Pending":
            clean_id = t["id"].replace("TXN-", "").replace("SIM-", "").replace("TX-", "")
            c_id = f"CASE-2026-{clean_id}"
            if c_id not in _resolved_cases and t["id"] not in _resolved_cases:
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
                    "assignedTo": "Fraud Analyst",
                    "slaRemaining": "59m",
                    "slaStatus": "warning",
                    "status": "Pending",
                    "timestamp": t["timestamp"],
                    "submittedAt": t["timestamp"],
                })

    # 2. Query high risk / pending transactions from Databricks SQL silver.transactions
    try:
        sql = """
        SELECT * FROM fraud_prevention_dev.silver.transactions
        WHERE transaction_status = 'Blocked' OR amount > 2500
        ORDER BY transaction_timestamp DESC
        LIMIT 15
        """
        rows = sql_service.execute_statement(sql, schema="silver")
        for idx, r in enumerate(rows):
            tx_id = r.get('transaction_id', f'{idx}')
            case_id = f"CASE-2026-{tx_id}"
            if case_id in _resolved_cases or tx_id in _resolved_cases:
                continue
            
            amount = float(r.get('amount') or 1500.0)
            risk_score = round(min(0.98, 0.70 + (amount % 300) / 1000.0), 2)
            cust_id = r.get('customer_id', '100')
            
            cases.append({
                "id": case_id,
                "transactionId": f"TXN-{tx_id}",
                "customerId": f"CUST-{cust_id}",
                "customerName": f"Customer #{cust_id}",
                "amount": amount,
                "riskScore": risk_score,
                "riskLevel": "High" if risk_score >= 0.85 else "Medium",
                "rulesTriggered": ["High Velocity", "Amount Deviation"] if risk_score >= 0.85 else ["New Device"],
                "ruleCount": 2 if risk_score >= 0.85 else 1,
                "waitTime": f"{15 + idx * 5}m",
                "waitMinutes": 15 + idx * 5,
                "assignedTo": "Fraud Analyst",
                "slaRemaining": "45m" if idx < 3 else "1h 15m",
                "slaStatus": "warning" if idx < 2 else "ok",
                "status": "Pending",
                "timestamp": str(r.get('transaction_timestamp', '')),
                "submittedAt": str(r.get('transaction_timestamp', '')),
            })
    except Exception as e:
        pass

    return {
        "cases": cases,
        "kpis": {
            "totalPending": len(cases),
            "highRisk": sum(1 for c in cases if c["riskLevel"] == "High"),
            "mediumRisk": sum(1 for c in cases if c["riskLevel"] == "Medium"),
            "lowRisk": 0,
            "avgWaitTime": "12m",
            "highTrend": 5,
            "mediumTrend": 3,
            "lowTrend": -1,
            "waitTimeTrend": 18,
        },
        "slaStatus": {
            "breached": 0,
            "atRisk": sum(1 for c in cases if c.get("slaStatus") == "warning"),
            "onTrack": sum(1 for c in cases if c.get("slaStatus") == "ok"),
        }
    }

@router.post("/hitl/{case_id}/decision")
def submit_hitl_decision(case_id: str, body: DecisionRequest):
    valid_decisions = ["APPROVE", "BLOCK", "ESCALATE"]
    if body.decision.upper() not in valid_decisions:
        raise HTTPException(status_code=400, detail=f"Invalid decision. Must be one of {valid_decisions}")
    
    clean_id = case_id.replace("CASE-2026-", "").replace("TXN-", "").replace("SIM-", "")
    _resolved_cases.add(case_id)
    _resolved_cases.add(clean_id)
    
    # Update in-memory live transactions status
    new_dec = "ALLOW" if body.decision.upper() == "APPROVE" else "BLOCK" if body.decision.upper() == "BLOCK" else "CHALLENGE"
    new_status = "Approved" if body.decision.upper() == "APPROVE" else "Declined" if body.decision.upper() == "BLOCK" else "Pending"
    
    for t in LIVE_TRANSACTIONS:
        t_clean = t["id"].replace("TXN-", "").replace("SIM-", "").replace("TX-", "")
        if t["id"] == clean_id or t_clean == clean_id:
            t["decision"] = new_dec
            t["status"] = new_status
            if body.decision.upper() == "APPROVE":
                t["riskScore"] = 0.05
                t["riskLevel"] = "Low"
            elif body.decision.upper() == "BLOCK":
                t["riskScore"] = 0.99
                t["riskLevel"] = "High"

    result = fraud_ops_service.record_hitl_decision(
        case_id=case_id,
        transaction_id=clean_id,
        decision=body.decision.upper(),
        reason=body.reason or "Analyst manual review",
        analyst=body.analyst or "analyst@financeops.com"
    )
    return result
