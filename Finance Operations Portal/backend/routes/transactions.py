from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time
import logging
from ..services.databricks_sql import sql_service

logger = logging.getLogger("finance_ops_transactions")
router = APIRouter()

# In-memory store for live real-time transactions received from Bank Portal / Simulator
LIVE_TRANSACTIONS: List[Dict[str, Any]] = []


class RecordTransactionPayload(BaseModel):
    transaction_id: str
    customer_id: Optional[str] = "CUST-1001"
    customer_name: Optional[str] = "Praveen Kumar"
    merchant: str
    amount: float
    decision: str                            # ALLOW | CHALLENGE | BLOCK
    risk_score: float                        # 0.0 - 1.0
    risk_level: str                          # Low | Medium | High
    rules_triggered: Optional[List[str]] = []
    payment_method: Optional[str] = "UPI"
    location: Optional[str] = "Mumbai, India"
    device: Optional[str] = "Chrome on Windows"
    timestamp: Optional[str] = None


@router.post("/transactions/record")
def record_live_transaction(payload: RecordTransactionPayload):
    """
    Receives live transaction decision from Bank Portal / Simulator
    and appends it immediately to the Finance Operations live stream.
    """
    rules = payload.rules_triggered or []
    if payload.amount >= 100000 and "High Value Transaction (₹1 Lakh+)" not in rules:
        rules.append("High Value Transaction (₹1 Lakh+)")

    record = {
        "id": payload.transaction_id,
        "customerId": payload.customer_id or "C-1001",
        "customerName": payload.customer_name or "Praveen Kumar",
        "amount": payload.amount,
        "currency": "INR",
        "merchant": payload.merchant,
        "merchantCategory": "Shopping" if payload.amount < 10000 else "Electronics",
        "channel": payload.payment_method or "UPI",
        "country": "IN",
        "riskScore": round(payload.risk_score, 2),
        "riskLevel": payload.risk_level,
        "decision": payload.decision,
        "ruleViolations": len(rules),
        "rulesTriggered": rules,
        "timestamp": payload.timestamp or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "status": "HITL Pending" if payload.decision == "CHALLENGE" else "Completed",
        "deviceId": payload.device or "DEV-CHROME-WIN",
        "ipAddress": "203.0.113.45",
        "sessionId": "SES-LIVE-8842",
        "cardBin": "4821",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "modelVersion": "rtff_fraud_detection_model_v1",
        "modelThreshold": 0.75,
        "velocity1m": 1,
        "velocity10m": 2,
        "auditId": f"AUD-{payload.transaction_id}",
        "kafkaOffset": 2039485999,
        "processingTimeMs": 42
    }

    # Avoid duplicate IDs by mutating in place
    i = 0
    while i < len(LIVE_TRANSACTIONS):
        if LIVE_TRANSACTIONS[i]["id"] == record["id"]:
            LIVE_TRANSACTIONS.pop(i)
        else:
            i += 1
    LIVE_TRANSACTIONS.insert(0, record)

    logger.info("Recorded live transaction in Finance Ops Portal: %s | ₹%.2f | %s", record["id"], payload.amount, payload.decision)
    return {"status": "recorded", "transaction": record}


def _map_transaction(r: Dict[str, Any]) -> Dict[str, Any]:
    amount = float(r.get('amount') or 0.0)
    tx_status = r.get('transaction_status', 'Approved')

    if tx_status == 'Blocked' or tx_status == 'BLOCK':
        risk_score = round(min(0.99, 0.85 + (amount % 100) / 1000), 2)
        risk_level = 'High'
        decision = 'BLOCK'
        status = 'Declined'
        rules = ['High Velocity', 'Amount Deviation', 'Location Anomaly']
    elif tx_status == 'Pending' or tx_status == 'CHALLENGE':
        risk_score = round(0.50 + (amount % 100) / 400, 2)
        risk_level = 'Medium'
        decision = 'CHALLENGE'
        status = 'HITL Pending'
        rules = ['Amount Deviation', 'New Device']
    else:
        risk_score = round(max(0.01, (amount % 50) / 500), 2)
        risk_level = 'Low'
        decision = 'ALLOW'
        status = 'Completed'
        rules = []

    raw_tx_id = str(r.get('transaction_id', '0'))
    tx_id = f"TXN-{raw_tx_id}" if not raw_tx_id.startswith("TX") else raw_tx_id
    raw_cust_id = str(r.get('customer_id', '1000'))
    cust_id = f"CUST-{raw_cust_id}" if not raw_cust_id.startswith("C") else raw_cust_id

    merchant_raw = str(r.get('merchant_id') or r.get('merchant') or 'M_100')
    merchant_name = merchant_raw if not merchant_raw.startswith("M_") else f"Merchant {merchant_raw}"

    return {
        "id": tx_id,
        "customerId": cust_id,
        "customerName": f"Customer #{raw_cust_id}",
        "amount": amount,
        "currency": r.get('currency', 'INR'),
        "merchant": merchant_name,
        "merchantCategory": "Retail" if amount < 200 else "Electronics" if amount < 1000 else "Luxury",
        "channel": (r.get('payment_method') or 'online').title(),
        "country": "IN",
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "decision": decision,
        "ruleViolations": len(rules),
        "rulesTriggered": rules,
        "timestamp": str(r.get('transaction_timestamp', '')),
        "status": status,
        "deviceId": r.get('device_id', 'DEV-9F8A6C2D'),
        "ipAddress": "192.168.1.10",
        "sessionId": r.get('session_id', 'SES-12345'),
        "cardBin": "4532",
        "latitude": float(r.get('latitude') or 19.0760),
        "longitude": float(r.get('longitude') or 72.8777),
        "modelVersion": "rtff_fraud_detection_model_v1",
        "modelThreshold": 0.75,
        "velocity1m": int(amount % 5) + 1,
        "velocity10m": int(amount % 15) + 2,
        "auditId": f"AUD-{raw_tx_id}",
        "kafkaOffset": 2039485000 + int(raw_tx_id) if raw_tx_id.isdigit() else 2039485000,
        "processingTimeMs": 45 + int(amount % 80)
    }


@router.get("/transactions")
def get_transactions(
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    sql_items = []
    total_count = len(LIVE_TRANSACTIONS)
    try:
        if search:
            sql = """
            SELECT * FROM fraud_prevention_dev.silver.transactions
            WHERE transaction_id = :search OR customer_id = :search OR merchant_id = :search
            ORDER BY transaction_timestamp DESC
            LIMIT :limit OFFSET :offset
            """
            params = [
                {"name": "search", "value": search, "type": "STRING"},
                {"name": "limit", "value": str(limit), "type": "INT"},
                {"name": "offset", "value": str(offset), "type": "INT"}
            ]
        else:
            sql = f"""
            SELECT * FROM fraud_prevention_dev.silver.transactions
            ORDER BY transaction_timestamp DESC
            LIMIT {limit} OFFSET {offset}
            """
            params = None

        rows = sql_service.execute_statement(sql, parameters=params, schema="silver")
        sql_items = [_map_transaction(r) for r in rows]

        count_sql = "SELECT COUNT(*) as count FROM fraud_prevention_dev.silver.transactions"
        count_res = sql_service.execute_statement(count_sql, schema="silver")
        if count_res:
            total_count += int(count_res[0].get('count', 0))
    except Exception as e:
        logger.warning("Databricks SQL fetch error: %s", e)

    # Combine live real-time transactions from Bank Portal with Databricks SQL silver items
    combined = LIVE_TRANSACTIONS + sql_items

    if search:
        s_lower = search.lower()
        combined = [
            t for t in combined
            if s_lower in t["id"].lower() or s_lower in t["customerName"].lower() or s_lower in t["merchant"].lower()
        ]

    return {
        "transactions": combined[offset:offset + limit],
        "total": total_count,
        "kpis": {
            "transactions24h": total_count,
            "allowed": int(total_count * 0.91),
            "challenged": int(total_count * 0.06),
            "blocked": int(total_count * 0.03),
            "fraudValuePrevented": int(total_count * 2.4),
            "avgDecisionLatencyMs": 48,
            "allowedTrend": 14.2,
            "blockedTrend": 7.3,
            "fraudValueTrend": 18.7,
            "latencyTrend": -22.4,
        }
    }


@router.get("/transactions/{tx_id}")
def get_transaction_detail(tx_id: str):
    # Check live transactions first
    for t in LIVE_TRANSACTIONS:
        if t["id"] == tx_id or t["id"].replace("TXN-", "") == tx_id.replace("TX-", ""):
            return t

    clean_id = tx_id.replace("TX-", "").replace("TXN-", "")
    try:
        sql = """
        SELECT * FROM fraud_prevention_dev.silver.transactions
        WHERE transaction_id = :tx_id
        LIMIT 1
        """
        params = [{"name": "tx_id", "value": clean_id, "type": "STRING"}]
        rows = sql_service.execute_statement(sql, parameters=params, schema="silver")
        if rows:
            return _map_transaction(rows[0])
    except Exception as e:
        logger.warning("Databricks SQL detail fetch failed: %s", e)

    return {"error": f"Transaction {tx_id} not found in Databricks."}
