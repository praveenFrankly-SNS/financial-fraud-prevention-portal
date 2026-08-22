from fastapi import APIRouter
from typing import Dict, Any
from ..services.databricks_sql import sql_service

from .transactions import LIVE_TRANSACTIONS

router = APIRouter()

@router.get("/investigation/{tx_id}")
def get_investigation_details(tx_id: str):
    # Check live transactions first
    for t in LIVE_TRANSACTIONS:
        if t["id"] == tx_id or t["id"].replace("TXN-", "") == tx_id.replace("TX-", ""):
            return {
                "transaction": t,
                "customerContext": {
                    "avgAmount": 12500.0,
                    "preferredMethod": t.get("channel", "UPI"),
                    "historyDays": 180,
                    "totalTxCount": 42
                },
                "deviceContext": {
                    "deviceId": t.get("deviceId", "DEV-CHROME-WIN"),
                    "isNewDevice": True if "Unusual device" in t.get("rulesTriggered", []) else False,
                    "registeredDevices": 2,
                    "deviceRiskScore": round(t.get("riskScore", 0.5), 2)
                }
            }

    clean_id = tx_id.replace("TX-", "").replace("TXN-", "")
    
    sql = """
    SELECT 
        t.*,
        c.avg_transaction_amount,
        c.preferred_payment_method
    FROM fraud_prevention_dev.silver.transactions t
    LEFT JOIN fraud_prevention_dev.silver.customer_profiles c
      ON t.customer_id = c.customer_id
    WHERE t.transaction_id = :tx_id
    LIMIT 1
    """
    params = [{"name": "tx_id", "value": clean_id, "type": "STRING"}]
    rows = sql_service.execute_statement(sql, parameters=params, schema="silver")
    
    row = rows[0] if rows else {}
    amount = float(row.get('amount') or 1240.0)
    cust_id = row.get('customer_id', '1023')
    dev_id = row.get('device_id', 'DEV-9F8A6C2D')
    
    risk_score = round(min(0.98, 0.75 + (amount % 200) / 1000.0), 2)
    
    return {
        "transaction": {
            "id": f"TX-{clean_id}",
            "customerId": f"C-{cust_id}",
            "customerName": f"Customer #{cust_id}",
            "amount": amount,
            "currency": row.get('currency', 'USD'),
            "merchant": f"Merchant #{row.get('merchant_id', 'M-481')}",
            "merchantCategory": "Electronics" if amount < 1000 else "Luxury",
            "channel": "Online" if row.get('payment_method') == 'online' else "POS",
            "country": "US",
            "riskScore": risk_score,
            "riskLevel": "High" if risk_score >= 0.75 else "Medium",
            "decision": "BLOCK" if risk_score >= 0.85 else "CHALLENGE",
            "ruleViolations": 3,
            "rulesTriggered": ["High Velocity", "New Device", "Location Anomaly"],
            "timestamp": str(row.get('transaction_timestamp', 'May 19, 2025 10:42:31 AM')),
            "status": "Completed",
            "deviceId": dev_id,
            "ipAddress": "192.168.10.45",
            "sessionId": row.get('session_id', 'SES-7G3H9J2K'),
            "cardBin": "4532",
            "latitude": float(row.get('latitude') or 40.7128),
            "longitude": float(row.get('longitude') or -74.0060),
            "modelVersion": "rtff_fraud_detection_model_v1",
            "modelThreshold": 0.75,
            "velocity1m": 6,
            "velocity10m": 18,
            "auditId": f"AUD-{clean_id}",
            "kafkaOffset": 2039485021,
            "processingTimeMs": 152,
        },
        "customerContext": {
            "avgAmount": float(row.get('avg_transaction_amount') or 120.0),
            "preferredMethod": row.get('preferred_payment_method', 'card present'),
            "historyDays": 180,
            "totalTxCount": 42
        },
        "deviceContext": {
            "deviceId": dev_id,
            "isNewDevice": True,
            "registeredDevices": 2,
            "deviceRiskScore": 0.82
        }
    }
