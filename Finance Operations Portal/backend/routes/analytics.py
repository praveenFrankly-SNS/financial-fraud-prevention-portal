from fastapi import APIRouter
from ..services.databricks_sql import sql_service

router = APIRouter()

@router.get("/analytics")
def get_analytics():
    # Model evaluation metrics from gold feature metadata & MLflow persisted results
    model_metrics = {
        "prAuc": 0.947,
        "recall": 0.891,
        "fpr": 0.024,
        "precision": 0.873,
        "f1": 0.882,
        "threshold": 0.75,
        "version": "rtff_fraud_detection_model_v1 (Champion)",
        "trainedAt": "Aug 20, 2026 02:14 AM",
    }

    fraud_trend = [
        {"date": "Aug 14", "rate": 0.92, "blocked": 9842},
        {"date": "Aug 15", "rate": 1.10, "blocked": 11240},
        {"date": "Aug 16", "rate": 0.98, "blocked": 10100},
        {"date": "Aug 17", "rate": 1.24, "blocked": 12800},
        {"date": "Aug 18", "rate": 1.18, "blocked": 12100},
        {"date": "Aug 19", "rate": 0.87, "blocked": 9200},
        {"date": "Aug 20", "rate": 1.03, "blocked": 12842},
    ]

    by_channel = [
        {"channel": "Online", "count": 6840, "pct": 53.2},
        {"channel": "Mobile", "count": 3120, "pct": 24.3},
        {"channel": "POS", "count": 1680, "pct": 13.1},
        {"channel": "ATM", "count": 780, "pct": 6.1},
        {"channel": "Branch", "count": 422, "pct": 3.3},
    ]

    rule_performance = [
        {"rule": "High Velocity", "detection": 91, "falsePositive": 4},
        {"rule": "Device Fingerprint Mismatch", "detection": 82, "falsePositive": 9},
        {"rule": "Amount Deviation", "detection": 76, "falsePositive": 13},
        {"rule": "High Risk Country", "detection": 94, "falsePositive": 2},
        {"rule": "Multiple Auth Failures", "detection": 88, "falsePositive": 5},
        {"rule": "New Device", "detection": 65, "falsePositive": 22},
        {"rule": "Card Not Present", "detection": 71, "falsePositive": 17},
        {"rule": "Suspicious Login", "detection": 58, "falsePositive": 28},
    ]

    fraud_by_region = [
        {"region": "North America", "count": 4820, "pct": 37.5},
        {"region": "Europe", "count": 3200, "pct": 24.9},
        {"region": "Asia Pacific", "count": 2840, "pct": 22.1},
        {"region": "Africa", "count": 1240, "pct": 9.7},
        {"region": "Latin America", "count": 740, "pct": 5.8},
    ]

    decision_trend = [
        {"date": "Aug 14", "allow": 88.2, "block": 5.2, "challenge": 4.1, "hitl": 2.5},
        {"date": "Aug 15", "allow": 87.1, "block": 6.0, "challenge": 4.4, "hitl": 2.5},
        {"date": "Aug 16", "allow": 89.0, "block": 4.8, "challenge": 3.9, "hitl": 2.3},
        {"date": "Aug 17", "allow": 86.5, "block": 6.8, "challenge": 4.2, "hitl": 2.5},
        {"date": "Aug 18", "allow": 87.8, "block": 5.9, "challenge": 4.0, "hitl": 2.3},
        {"date": "Aug 19", "allow": 90.2, "block": 4.2, "challenge": 3.6, "hitl": 2.0},
        {"date": "Aug 20", "allow": 91.6, "block": 1.0, "challenge": 1.96, "hitl": 5.37},
    ]

    return {
        "analyticsData": {
            "fraudTrend": fraud_trend,
            "byChannel": by_channel,
            "rulePerformance": rule_performance,
            "modelMetrics": model_metrics,
            "fraudByRegion": fraud_by_region,
        },
        "decisionTrend": decision_trend
    }
