import urllib.request
import json
import logging
from typing import Dict, Any, List, Optional
from ..config import DATABRICKS_HOST, DATABRICKS_TOKEN, SERVING_ENDPOINT_NAME

logger = logging.getLogger("model_serving")

# Feature columns expected by the Databricks fraud model
FEATURE_COLUMNS = [
    'failed_login_count_5m', 'failed_login_count_1h', 'failed_login_count_24h',
    'password_change_last_24h', 'device_change_last_24h', 'profile_change_last_24h',
    'card_added_last_24h', 'account_security_event_count_1h', 'account_security_event_count_24h',
    'customer_avg_amount_30d', 'customer_std_amount_30d', 'customer_max_amount_30d',
    'amount_vs_customer_avg', 'amount_zscore', 'customer_lifetime_txn_count',
    'device_age_days', 'is_new_device', 'is_known_customer_device',
    'device_transaction_count_1h', 'device_transaction_count_24h',
    'customer_device_count', 'device_customer_count',
    'distance_from_previous_location_km', 'travel_speed_kmh', 'impossible_travel',
    'distance_from_customer_home_km', 'is_new_country', 'is_new_location',
    'is_new_merchant', 'is_new_merchant_category', 'customer_merchant_txn_count',
    'customer_merchant_avg_amount', 'merchant_prior_fraud_rate',
    'payment_method_age_days', 'is_new_payment_method', 'payment_txn_count_24h',
    'payment_txn_count_7d', 'payment_txn_count_30d', 'customer_payment_method_frequency',
    'transaction_amount', 'transaction_hour', 'transaction_day_of_week', 'is_weekend',
    'time_since_previous_transaction_seconds', 'txn_count_5m', 'txn_count_10m',
    'txn_count_1h', 'txn_count_24h', 'amount_sum_5m', 'amount_sum_10m',
    'amount_sum_1h', 'amount_sum_24h', 'new_device_and_new_location',
    'new_device_and_large_amount', 'recent_password_change_and_transaction',
    'high_velocity_and_new_device', 'high_velocity_and_new_merchant',
    'impossible_travel_and_new_device'
]


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

    def predict(self, dataframe_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        url = f"{self.host}/serving-endpoints/{self.endpoint_name}/invocations"
        payload = {"dataframe_records": dataframe_records}
        print(f"[MODEL SERVING] Calling Databricks Endpoint: {self.endpoint_name}")
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode(),
                headers=self._headers(),
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=35) as resp:
                res = json.loads(resp.read().decode())
            print(f"[MODEL SERVING SUCCESS] Databricks Response received: {res}")
            return {"status": "success", "predictions": res.get("predictions", res)}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            logger.error("Databricks Model Serving HTTP error %d: %s", e.code, err_body)
            print(f"[MODEL SERVING HTTP {e.code}] Databricks Model Serving unavailable")
            return {"status": "error", "code": e.code, "message": "Databricks Model Serving request failed."}
        except Exception as e:
            logger.error("Databricks Model Serving request failed: %s", e)
            print(f"[MODEL SERVING OFFLINE] Databricks Model Serving unavailable: {e}")
            return {"status": "error", "message": "Databricks Model Serving is unavailable."}

    def build_features(
        self,
        amount: float,
        velocity_5m: int,
        velocity_10m: int,
        is_new_device: bool,
        is_new_location: bool,
        is_new_merchant: bool,
        impossible_travel: bool,
        customer_avg: Optional[float] = None,
    ) -> Dict[str, float]:
        record: Dict[str, float] = {col: 0.0 for col in FEATURE_COLUMNS}
        record['transaction_amount'] = float(amount)

        if customer_avg is not None and customer_avg > 0:
            record['customer_avg_amount_30d'] = float(customer_avg)
            record['amount_vs_customer_avg'] = float(amount) / customer_avg
            record['amount_zscore'] = max(0.0, (float(amount) - customer_avg) / max(customer_avg * 0.5, 1.0))
        else:
            record['customer_avg_amount_30d'] = 0.0
            record['amount_vs_customer_avg'] = 1.0
            record['amount_zscore'] = 0.0

        record['txn_count_5m'] = float(velocity_5m)
        record['txn_count_10m'] = float(velocity_10m)
        record['is_new_device'] = 1.0 if is_new_device else 0.0
        record['is_known_customer_device'] = 0.0 if is_new_device else 1.0
        record['is_new_location'] = 1.0 if is_new_location else 0.0
        record['is_new_merchant'] = 1.0 if is_new_merchant else 0.0
        record['impossible_travel'] = 1.0 if impossible_travel else 0.0
        record['new_device_and_large_amount'] = 1.0 if (is_new_device and amount > 10000) else 0.0
        record['new_device_and_new_location'] = 1.0 if (is_new_device and is_new_location) else 0.0
        record['impossible_travel_and_new_device'] = 1.0 if (impossible_travel and is_new_device) else 0.0
        record['high_velocity_and_new_device'] = 1.0 if (velocity_5m > 3 and is_new_device) else 0.0
        record['high_velocity_and_new_merchant'] = 1.0 if (velocity_5m > 3 and is_new_merchant) else 0.0
        return record

    def score_and_decide(
        self,
        features: Dict[str, float],
    ) -> Dict[str, Any]:
        import time
        start = time.time()
        serving_result = self.predict([features])
        elapsed_ms = round((time.time() - start) * 1000)

        if serving_result.get("status") != "success":
            return {
                "status": "error",
                "error_type": "MODEL_SERVING_UNAVAILABLE",
                "message": "Security service temporarily unavailable. The transaction could not be evaluated at this time. Please try again.",
                "processing_time_ms": elapsed_ms,
            }

        predictions = serving_result.get("predictions")
        if not isinstance(predictions, list) or len(predictions) == 0:
            logger.error("Databricks Model Serving returned no predictions.")
            return {
                "status": "error",
                "error_type": "INVALID_MODEL_RESPONSE",
                "message": "Databricks Model Serving returned no prediction.",
                "processing_time_ms": elapsed_ms,
            }

        pred = predictions[0]
        try:
            if isinstance(pred, dict):
                raw_score = float(pred.get("fraud_probability", pred.get("score", pred.get("prediction", 0.0))))
            else:
                raw_score = float(pred)
        except (TypeError, ValueError):
            logger.error("Invalid prediction returned by Databricks: %s", pred)
            return {
                "status": "error",
                "error_type": "INVALID_MODEL_RESPONSE",
                "message": "Databricks Model Serving returned an invalid prediction.",
                "processing_time_ms": elapsed_ms,
            }

        if not (0 <= raw_score <= 1):
            return {
                "status": "error",
                "error_type": "INVALID_MODEL_SCORE",
                "message": "Databricks Model Serving returned an invalid risk score.",
                "processing_time_ms": elapsed_ms,
            }

        print(f"[MODEL PREDICTION] Databricks score: {raw_score}")

        if raw_score >= 0.75:
            decision = "BLOCK"
            risk_level = "High"
        elif raw_score >= 0.40:
            decision = "CHALLENGE"
            risk_level = "Medium"
        else:
            decision = "ALLOW"
            risk_level = "Low"

        return {
            "status": "success",
            "raw_score": raw_score,
            "risk_level": risk_level,
            "decision": decision,
            "processing_time_ms": elapsed_ms,
        }


model_service = ModelServingService()
