import logging
from typing import Dict, Any, Optional
from datetime import datetime
from .databricks_sql import sql_service

logger = logging.getLogger("fraud_operations")

class FraudOperationsService:
    def record_hitl_decision(
        self,
        case_id: str,
        transaction_id: str,
        decision: str,
        reason: str,
        analyst: str
    ) -> Dict[str, Any]:
        """
        Persists analyst decision into Databricks Delta audit table (monitoring.realtime_decisions_audit).
        """
        now_iso = datetime.utcnow().isoformat()
        
        # Insert audit record into monitoring.realtime_decisions_audit if table exists
        insert_sql = """
        INSERT INTO fraud_prevention_dev.monitoring.realtime_decisions_audit (
            audit_id, transaction_id, event_type, decision, analyst_id, notes, timestamp
        ) VALUES (
            :audit_id, :tx_id, 'HITL_ANALYST_DECISION', :decision, :analyst, :notes, :timestamp
        )
        """
        audit_id = f"AUD-{case_id}-{int(datetime.utcnow().timestamp())}"
        params = [
            {"name": "audit_id", "value": audit_id, "type": "STRING"},
            {"name": "tx_id", "value": transaction_id, "type": "STRING"},
            {"name": "decision", "value": decision, "type": "STRING"},
            {"name": "analyst", "value": analyst, "type": "STRING"},
            {"name": "notes", "value": reason, "type": "STRING"},
            {"name": "timestamp", "value": now_iso, "type": "STRING"},
        ]
        
        sql_service.execute_statement(insert_sql, parameters=params, schema="monitoring")
        
        logger.info(f"Persisted HITL Decision for Case {case_id} / Tx {transaction_id}: {decision} by {analyst}")
        return {
            "status": "success",
            "case_id": case_id,
            "transaction_id": transaction_id,
            "decision": decision,
            "analyst": analyst,
            "timestamp": now_iso,
            "audit_id": audit_id
        }

fraud_ops_service = FraudOperationsService()
