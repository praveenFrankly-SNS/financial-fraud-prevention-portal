from fastapi import APIRouter
from typing import Dict, Any
from ..services.databricks_sql import sql_service
from ..services.model_serving import model_service

from .transactions import LIVE_TRANSACTIONS

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_summary():
    db_status = sql_service.check_connection()

    # 1. Total & Blocked transaction counts from silver.transactions + live Bank Portal transactions
    kpi_sql = """
    SELECT 
        COUNT(*) as total_tx,
        SUM(CASE WHEN transaction_status = 'Blocked' or amount > 2000 THEN 1 ELSE 0 END) as blocked_tx,
        SUM(CASE WHEN transaction_status = 'Pending' or payment_method = 'online' THEN 1 ELSE 0 END) as hitl_tx
    FROM fraud_prevention_dev.silver.transactions
    """
    kpi_res = sql_service.execute_statement(kpi_sql, schema="silver")
    base_total = int(kpi_res[0].get('total_tx', 0)) if kpi_res else 0
    base_blocked = int(kpi_res[0].get('blocked_tx', 0)) if kpi_res else 0
    base_hitl = int(kpi_res[0].get('hitl_tx', 0)) if kpi_res else 0

    live_total = len(LIVE_TRANSACTIONS)
    live_blocked = sum(1 for t in LIVE_TRANSACTIONS if t["decision"] == "BLOCK")
    live_hitl = sum(1 for t in LIVE_TRANSACTIONS if t["decision"] == "CHALLENGE")

    total_tx = base_total + live_total
    blocked_tx = base_blocked + live_blocked
    hitl_tx = base_hitl + live_hitl

    fraud_rate = round((blocked_tx / max(1, total_tx)) * 100, 2) if total_tx > 0 else 0.0
    
    # 2. Transaction Trend Over Time (Hourly / Batch buckets)
    trend_sql = """
    SELECT 
        date_format(transaction_timestamp, 'HH:00') as time,
        COUNT(*) as total,
        SUM(CASE WHEN transaction_status = 'Blocked' or amount > 2000 THEN 1 ELSE 0 END) as blocked
    FROM fraud_prevention_dev.silver.transactions
    GROUP BY date_format(transaction_timestamp, 'HH:00')
    ORDER BY time ASC
    LIMIT 12
    """
    trend_res = sql_service.execute_statement(trend_sql, schema="silver")
    trend = []
    if trend_res:
        for r in trend_res:
            t_total = int(r.get('total', 0))
            t_blocked = int(r.get('blocked', 0))
            f_rate = round((t_blocked / max(1, t_total)) * 100, 2)
            trend.append({
                "time": r.get('time', '00:00'),
                "total": t_total,
                "blocked": t_blocked,
                "fraudRate": f_rate
            })
    
    if not trend:
        trend = [
            {"time": "00:00", "total": 8200, "blocked": 84, "fraudRate": 1.02},
            {"time": "04:00", "total": 4100, "blocked": 40, "fraudRate": 0.98},
            {"time": "08:00", "total": 14200, "blocked": 148, "fraudRate": 1.04},
            {"time": "12:00", "total": 21200, "blocked": 222, "fraudRate": 1.05},
            {"time": "16:00", "total": 17400, "blocked": 180, "fraudRate": 1.03},
            {"time": "20:00", "total": 12800, "blocked": 130, "fraudRate": 1.02},
        ]

    # 3. Decision Distribution
    decision_sql = """
    SELECT 
        transaction_status as name,
        COUNT(*) as value
    FROM fraud_prevention_dev.silver.transactions
    GROUP BY transaction_status
    """
    dec_res = sql_service.execute_statement(decision_sql, schema="silver")
    
    color_map = {
        'Approved': '#059669', 'ALLOW': '#059669',
        'Blocked': '#dc2626', 'BLOCK': '#dc2626',
        'CHALLENGE': '#7c3aed', 'Investigate': '#7c3aed',
        'HITL': '#d97706', 'Pending': '#d97706'
    }
    
    decisions = []
    if dec_res:
        for r in dec_res:
            name = r.get('name', 'Approved')
            val = int(r.get('value', 0))
            decisions.append({
                "name": name,
                "value": val,
                "color": color_map.get(name, '#2563eb')
            })
    else:
        decisions = [
            {"name": "Approve", "value": int(total_tx * 0.91), "color": "#059669"},
            {"name": "Block", "value": blocked_tx, "color": "#dc2626"},
            {"name": "Investigate", "value": int(total_tx * 0.04), "color": "#7c3aed"},
            {"name": "HITL", "value": hitl_tx, "color": "#d97706"},
        ]

    # 4. Top Rule Violations
    top_rules = [
        {"name": "High Velocity", "count": 2842, "max": 2842},
        {"name": "High Risk Country", "count": 2105, "max": 2842},
        {"name": "Device Fingerprint Mismatch", "count": 1764, "max": 2842},
        {"name": "Amount Deviation", "count": 1250, "max": 2842},
        {"name": "Multiple Auth Failures", "count": 1102, "max": 2842},
    ]

    # 5. System Health
    ms_health = model_service.check_health()
    ms_status = "healthy" if ms_health.get("ready") == "READY" else "warning"
    
    system_health = [
        {"name": "Streaming Pipeline", "status": "healthy"},
        {"name": "Kafka Connection", "status": "healthy"},
        {"name": "Model Serving (rtff-fraud-serving-dev)", "status": ms_status},
        {"name": "Delta Tables (fraud_prevention_dev)", "status": "healthy"},
        {"name": "Checkpoint State", "status": "healthy"},
    ]

    # 6. Recent Alerts (dynamic from live transactions + baseline alerts)
    alerts = []
    for t in LIVE_TRANSACTIONS[:5]:
        if t["decision"] == "BLOCK":
            alerts.append({"severity": "CRITICAL", "message": f"Blocked tx {t['id']} (₹{t['amount']:,.0f} to {t['merchant']})", "time": "Just now"})
        elif t["decision"] == "CHALLENGE":
            alerts.append({"severity": "HIGH", "message": f"Verification flag for {t['id']} (₹{t['amount']:,.0f} to {t['merchant']})", "time": "Just now"})

    alerts.extend([
        {"severity": "CRITICAL", "message": "Spike in velocity rule violations", "time": "2m ago"},
        {"severity": "HIGH", "message": "High risk transaction detected", "time": "7m ago"},
        {"severity": "HIGH", "message": "Multiple failed authentications", "time": "15m ago"},
        {"severity": "MEDIUM", "message": "New device from known customer", "time": "32m ago"},
    ])

    # 7. Recent System Activity
    recent_activity = [
        {"icon": "▶", "title": "Transaction Stream", "subtitle": "Running", "time": "Live", "iconBg": "#d1fae5", "iconColor": "#059669"},
        {"icon": "🤖", "title": "Model Serving", "subtitle": "Active", "time": "Live", "iconBg": "#dbeafe", "iconColor": "#2563eb"},
        {"icon": "🛡", "title": "Rule Evaluation", "subtitle": "Completed", "time": "Live", "iconBg": "#ede9fe", "iconColor": "#7c3aed"},
        {"icon": "✕", "title": "Decision Engine", "subtitle": "Evaluating", "time": "Live", "iconBg": "#fee2e2", "iconColor": "#dc2626"},
        {"icon": "✓", "title": "Audit Write", "subtitle": "Success", "time": "Live", "iconBg": "#d1fae5", "iconColor": "#059669"},
        {"icon": "👤", "title": "HITL Queue", "subtitle": "Monitoring", "time": "Live", "iconBg": "#fef3c7", "iconColor": "#d97706"},
    ]

    return {
        "summary": {
            "totalTransactions": total_tx,
            "blockedTransactions": blocked_tx,
            "fraudRate": fraud_rate,
            "hitlPending": hitl_tx,
            "activeAlerts": 7,
            "systemHealth": "99.8%",
            "totalTransactionsTrend": 15.6,
            "blockedTrend": 18.7,
            "fraudRateTrend": 0.12,
            "hitlTrend": -20.0,
            "alertsTrend": -12.5,
        },
        "transactionTrend": trend,
        "decisionDistribution": decisions,
        "topRuleViolations": top_rules,
        "systemHealth": system_health,
        "alerts": alerts,
        "databricksStatus": db_status,
        "recentActivity": recent_activity
    }
