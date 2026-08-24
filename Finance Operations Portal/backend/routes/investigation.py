from fastapi import APIRouter
from typing import Dict, Any
import logging
from ..services.databricks_sql import sql_service
from .transactions import LIVE_TRANSACTIONS, _map_transaction

logger = logging.getLogger("investigation_route")
router = APIRouter()

@router.get("/investigation/{tx_id}")
def get_investigation_details(tx_id: str):
    clean_target = tx_id.replace("CASE-2026-", "").replace("TX-", "").replace("TXN-", "").replace("SIM-", "")

    # 1. Check live transactions first (from Bank Portal / Simulation)
    for t in LIVE_TRANSACTIONS:
        t_clean = t["id"].replace("CASE-2026-", "").replace("TX-", "").replace("TXN-", "").replace("SIM-", "")
        if t["id"] == tx_id or t_clean == clean_target:
            rules = t.get("rulesTriggered") or []
            return {
                "transaction": t,
                "customerContext": {
                    "avgAmount": 2500.0,
                    "preferredMethod": t.get("channel", "UPI"),
                    "historyDays": 180,
                    "totalTxCount": 42
                },
                "deviceContext": {
                    "deviceId": t.get("deviceId", "DEV-CHROME-WIN"),
                    "isNewDevice": True if ("New device detected" in rules or "New Device" in rules) else False,
                    "registeredDevices": 2,
                    "deviceRiskScore": round(t.get("riskScore", 0.5), 2)
                }
            }

    # 2. Query Databricks SQL silver.transactions table
    try:
        sql = """
        SELECT 
            t.*,
            c.avg_transaction_amount,
            c.preferred_payment_method
        FROM fraud_prevention_dev.silver.transactions t
        LEFT JOIN fraud_prevention_dev.silver.customer_profiles c
          ON t.customer_id = c.customer_id
        WHERE t.transaction_id = :tx_id OR t.transaction_id = :clean_id
        LIMIT 1
        """
        params = [
            {"name": "tx_id", "value": tx_id, "type": "STRING"},
            {"name": "clean_id", "value": clean_target, "type": "STRING"}
        ]
        rows = sql_service.execute_statement(sql, parameters=params, schema="silver")
        
        if rows:
            row = rows[0]
            mapped_tx = _map_transaction(row)
            return {
                "transaction": mapped_tx,
                "customerContext": {
                    "avgAmount": float(row.get('avg_transaction_amount') or 2500.0),
                    "preferredMethod": row.get('preferred_payment_method', 'contactless'),
                    "historyDays": 180,
                    "totalTxCount": 42
                },
                "deviceContext": {
                    "deviceId": mapped_tx["deviceId"],
                    "isNewDevice": True,
                    "registeredDevices": 2,
                    "deviceRiskScore": round(mapped_tx["riskScore"], 2)
                }
            }
    except Exception as e:
        logger.warning("Databricks SQL detail fetch failed for %s: %s", tx_id, e)

    return {
        "error": f"Transaction {tx_id} not found in Databricks.",
        "transaction": None
    }
