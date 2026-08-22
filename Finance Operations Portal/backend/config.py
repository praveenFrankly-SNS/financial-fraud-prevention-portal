import os
import configparser
from dotenv import load_dotenv

load_dotenv()

DATABRICKS_HOST = os.getenv('DATABRICKS_HOST', 'https://dbc-cb13acd9-016b.cloud.databricks.com').rstrip('/')
DATABRICKS_TOKEN = os.getenv('DATABRICKS_TOKEN', '')

if not DATABRICKS_TOKEN:
    cfg_path = os.path.expanduser("~/.databrickscfg")
    if os.path.exists(cfg_path):
        try:
            cfg = configparser.ConfigParser()
            cfg.read(cfg_path)
            for section in ("praveen", "DEFAULT", cfg.default_section):
                if section in cfg and "token" in cfg[section]:
                    DATABRICKS_TOKEN = cfg[section]["token"]
                    break
        except Exception:
            pass

DATABRICKS_WAREHOUSE_ID = os.getenv('DATABRICKS_WAREHOUSE_ID', '9a32ea9be4341223')
CATALOG_NAME = os.getenv('CATALOG_NAME', 'fraud_prevention_dev')
SERVING_ENDPOINT_NAME = os.getenv('SERVING_ENDPOINT_NAME', 'rtff-fraud-serving-dev')
PORT = int(os.getenv('PORT', '5000'))
HOST = os.getenv('HOST', '0.0.0.0')
