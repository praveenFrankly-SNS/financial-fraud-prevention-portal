import urllib.request
import json
import time
import logging
from typing import List, Dict, Any, Optional
from ..config import DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_WAREHOUSE_ID, CATALOG_NAME

logger = logging.getLogger("databricks_sql")
logging.basicConfig(level=logging.INFO)

class DatabricksSQLService:
    def __init__(self):
        self.host = DATABRICKS_HOST
        self.token = DATABRICKS_TOKEN
        self.warehouse_id = DATABRICKS_WAREHOUSE_ID
        self.catalog = CATALOG_NAME

    def _headers(self) -> Dict[str, str]:
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

    def execute_statement(
        self,
        statement: str,
        parameters: Optional[List[Dict[str, Any]]] = None,
        schema: Optional[str] = "silver",
        wait_timeout: str = "30s"
    ) -> List[Dict[str, Any]]:
        url = f"{self.host}/api/2.0/sql/statements"
        payload = {
            "statement": statement,
            "warehouse_id": self.warehouse_id,
            "catalog": self.catalog,
            "schema": schema,
            "wait_timeout": wait_timeout
        }
        if parameters:
            payload["parameters"] = parameters

        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=self._headers())
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode())

            statement_id = res.get('statement_id')
            state = res.get('status', {}).get('state')

            while state in ['PENDING', 'RUNNING']:
                time.sleep(0.5)
                poll_url = f"{self.host}/api/2.0/sql/statements/{statement_id}"
                poll_req = urllib.request.Request(poll_url, headers=self._headers())
                with urllib.request.urlopen(poll_req) as poll_resp:
                    res = json.loads(poll_resp.read().decode())
                state = res.get('status', {}).get('state')

            if state == 'SUCCEEDED':
                columns = [col['name'] for col in res.get('manifest', {}).get('schema', {}).get('columns', [])]
                rows = res.get('result', {}).get('data_array', [])
                
                result = []
                for row in rows:
                    record = {}
                    for idx, col_name in enumerate(columns):
                        val = row[idx] if idx < len(row) else None
                        record[col_name] = val
                    result.append(record)
                return result
            else:
                error_msg = res.get('status', {}).get('error', {}).get('message', f"State: {state}")
                logger.error(f"SQL Execution failed: {error_msg}")
                return []
        except Exception as e:
            logger.error(f"Error executing statement: {e}")
            return []

    def check_connection(self) -> Dict[str, Any]:
        if not self.token or not self.host or not self.warehouse_id:
            return {
                "connected": False,
                "count": 0,
                "table": f"{self.catalog}.silver.transactions",
                "message": "Databricks credentials not configured (DATABRICKS_HOST / DATABRICKS_TOKEN)."
            }
        try:
            res = self.execute_statement("SELECT COUNT(*) as count FROM fraud_prevention_dev.silver.transactions")
            if res and isinstance(res, list) and len(res) > 0:
                count = int(res[0].get("count", 0))
                return {
                    "connected": True,
                    "count": count,
                    "table": "fraud_prevention_dev.silver.transactions",
                    "message": f"Connected to Databricks SQL Warehouse. {count} records in silver.transactions."
                }
            return {
                "connected": True,
                "count": 0,
                "table": "fraud_prevention_dev.silver.transactions",
                "message": "Connected to Databricks SQL, but silver.transactions table has 0 records."
            }
        except Exception as e:
            return {
                "connected": False,
                "count": 0,
                "table": "fraud_prevention_dev.silver.transactions",
                "message": f"Databricks SQL query error: {e}"
            }

sql_service = DatabricksSQLService()
