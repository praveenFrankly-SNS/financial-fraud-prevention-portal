from fastapi import APIRouter
from ..services.databricks_sql import sql_service

router = APIRouter()

@router.get("/rule-violations")
def get_rule_violations():
    rules = [
        {
            "id": "RV-20250519-0001", "ruleName": "High Velocity", "severity": "HIGH",
            "category": "Velocity", "triggeredBy": "Transaction", "count": 2842,
            "firstOccurred": "Live Stream", "lastOccurred": "Just now",
            "status": "Active", "blockPct": 94, "hitlPct": 4,
            "description": "Transaction velocity exceeds safe threshold in short time window.",
            "condition": "Transactions > 5 within 60 seconds", "threshold": "5 txns / 60s"
        },
        {
            "id": "RV-20250519-0002", "ruleName": "High Risk Country", "severity": "HIGH",
            "category": "Geo-Location", "triggeredBy": "Transaction", "count": 2105,
            "firstOccurred": "Live Stream", "lastOccurred": "Just now",
            "status": "Active", "blockPct": 88, "hitlPct": 10,
            "description": "Transaction originates from a country on the high-risk watchlist.",
            "condition": "Country in watchlist", "threshold": "Blocked country list"
        },
        {
            "id": "RV-20250519-0003", "ruleName": "Device Fingerprint Mismatch", "severity": "MEDIUM",
            "category": "Device", "triggeredBy": "Transaction", "count": 1764,
            "firstOccurred": "Live Stream", "lastOccurred": "2m ago",
            "status": "Active", "blockPct": 62, "hitlPct": 28,
            "description": "Transaction device not previously seen for this customer.",
            "condition": "Device ID not in customer device history", "threshold": "First device use"
        },
        {
            "id": "RV-20250519-0004", "ruleName": "Card Not Present – High Amount", "severity": "MEDIUM",
            "category": "Payment", "triggeredBy": "Transaction", "count": 1480,
            "firstOccurred": "Live Stream", "lastOccurred": "5m ago",
            "status": "Active", "blockPct": 55, "hitlPct": 35,
            "description": "Card-not-present payment above high-amount threshold.",
            "condition": "channel=Online AND amount > $2,000", "threshold": "$2,000"
        },
        {
            "id": "RV-20250519-0005", "ruleName": "Amount Deviation", "severity": "MEDIUM",
            "category": "Behavior", "triggeredBy": "Transaction", "count": 1250,
            "firstOccurred": "Live Stream", "lastOccurred": "7m ago",
            "status": "Active", "blockPct": 48, "hitlPct": 40,
            "description": "Amount deviates significantly from customer average.",
            "condition": "Amount > 3x customer 30-day average", "threshold": "3× avg"
        },
        {
            "id": "RV-20250519-0006", "ruleName": "Multiple Failed Authentications", "severity": "HIGH",
            "category": "Authentication", "triggeredBy": "Customer", "count": 1102,
            "firstOccurred": "Live Stream", "lastOccurred": "12m ago",
            "status": "Active", "blockPct": 90, "hitlPct": 7,
            "description": "Multiple failed authentication attempts before successful transaction.",
            "condition": "Failed logins > 3 in last 10 minutes", "threshold": "3 failures / 10m"
        }
    ]

    return {
        "ruleViolations": rules,
        "kpis": {
            "total": 10543,
            "high": 6049,
            "medium": 3494,
            "low": 1000,
            "uniqueRules": 23,
            "totalTrend": 18.7,
            "highTrend": 21.3,
            "mediumTrend": 14.2,
            "lowTrend": -8.1,
            "uniqueRulesTrend": 9.5,
        },
        "violationsByCategory": [
            {"category": "Velocity", "count": 3842, "pct": 36.4},
            {"category": "Geo-Location", "count": 2505, "pct": 23.8},
            {"category": "Device", "count": 1864, "pct": 17.7},
            {"category": "Payment", "count": 1212, "pct": 11.5},
            {"category": "Authentication", "count": 1120, "pct": 10.6},
        ]
    }
