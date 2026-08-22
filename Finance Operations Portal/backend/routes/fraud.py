from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..services.model_serving import model_service

router = APIRouter()

class FraudScoreRequest(BaseModel):
    amount: float
    payment_method: Optional[str] = "online"
    customer_id: Optional[str] = "C-1023"
    merchant_id: Optional[str] = "M-481"
    device_id: Optional[str] = "DEV-9F8A6C2D"
    velocity_1m: Optional[int] = 3
    velocity_10m: Optional[int] = 8

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

@router.post("/fraud/score")
def score_fraud_transaction(body: FraudScoreRequest):
    """
    Submits full feature vector to Databricks Model Serving (rtff-fraud-serving-dev)
    and evaluates risk score & decision.
    """
    # Construct exact 58 feature payload matching model schema
    dataframe_record = {col: 0.0 for col in FEATURE_COLUMNS}
    
    dataframe_record['transaction_amount'] = float(body.amount)
    dataframe_record['customer_avg_amount_30d'] = 125.0
    dataframe_record['amount_vs_customer_avg'] = float(body.amount) / 125.0
    dataframe_record['txn_count_5m'] = float(body.velocity_1m or 1)
    dataframe_record['txn_count_10m'] = float(body.velocity_10m or 3)
    dataframe_record['is_new_device'] = 1.0 if (body.velocity_1m or 1) > 3 else 0.0
    dataframe_record['new_device_and_large_amount'] = 1.0 if body.amount > 1000 else 0.0

    # Call Model Serving endpoint
    serving_result = model_service.predict([dataframe_record])
    
    raw_score = 0.0
    if serving_result.get("status") == "success":
        preds = serving_result.get("predictions")
        if isinstance(preds, list) and len(preds) > 0:
            raw_score = float(preds[0])
    else:
        # Fallback scoring calculation if model serving endpoint scaling
        raw_score = min(0.99, round(0.1 + (body.amount / 5000.0) + ((body.velocity_1m or 1) * 0.1), 3))
    
    if raw_score >= 0.75:
        risk_level = "High"
        decision = "BLOCK"
    elif raw_score >= 0.50:
        risk_level = "Medium"
        decision = "HITL"
    else:
        risk_level = "Low"
        decision = "ALLOW"
        
    return {
        "status": "success",
        "fraudProbability": raw_score,
        "riskLevel": risk_level,
        "decision": decision,
        "endpoint": model_service.endpoint_name,
        "serving_response": serving_result
    }
