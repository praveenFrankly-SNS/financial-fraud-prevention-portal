import urllib.request
import json
import logging
from typing import Dict, Any, List
from ..config import DATABRICKS_HOST, DATABRICKS_TOKEN, SERVING_ENDPOINT_NAME

logger = logging.getLogger("model_serving")

class ModelServingService:
    def __init__(self):
        self.host = DATABRICKS_HOST
        self.token = DATABRICKS_TOKEN
        self.endpoint_name = SERVING_ENDPOINT_NAME

    def _headers(self) -> Dict[str, str]:
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

    def check_health(self) -> Dict[str, Any]:
        url = f"{self.host}/api/2.0/serving-endpoints/{self.endpoint_name}"
        try:
            req = urllib.request.Request(url, headers=self._headers())
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode())
            state = res.get('state', {})
            return {
                "name": self.endpoint_name,
                "status": "healthy" if state.get("ready") == "READY" else "warning",
                "ready": state.get("ready"),
                "details": state
            }
        except Exception as e:
            logger.error(f"Failed to check model serving health: {e}")
            return {
                "name": self.endpoint_name,
                "status": "error",
                "ready": "NOT_READY",
                "error": str(e)
            }

    def predict(self, dataframe_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        url = f"{self.host}/serving-endpoints/{self.endpoint_name}/invocations"
        payload = {"dataframe_records": dataframe_records}
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=self._headers())
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode())
            return {"status": "success", "predictions": res.get("predictions", res)}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            logger.error(f"Inference HTTP error {e.code}: {err_body}")
            return {"status": "error", "code": e.code, "message": err_body}
        except Exception as e:
            logger.error(f"Inference prediction failed: {e}")
            return {"status": "error", "message": str(e)}

model_service = ModelServingService()
