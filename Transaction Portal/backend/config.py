import os
from dotenv import load_dotenv

load_dotenv()

DATABRICKS_HOST      = os.getenv("DATABRICKS_HOST", "https://dbc-cb13acd9-016b.cloud.databricks.com")
DATABRICKS_TOKEN     = os.getenv("DATABRICKS_TOKEN", "")
SERVING_ENDPOINT_NAME = os.getenv("SERVING_ENDPOINT_NAME", "rtff-fraud-serving-dev")
PORT                 = int(os.getenv("PORT", "5001"))
HOST                 = os.getenv("HOST", "0.0.0.0")
FINANCE_PORTAL_URL   = os.getenv("FINANCE_PORTAL_URL", "http://localhost:5173")
