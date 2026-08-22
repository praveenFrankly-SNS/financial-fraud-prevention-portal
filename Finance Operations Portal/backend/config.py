import os

DATABRICKS_HOST = os.getenv('DATABRICKS_HOST', 'https://dbc-cb13acd9-016b.cloud.databricks.com').rstrip('/')
DATABRICKS_TOKEN = os.getenv('DATABRICKS_TOKEN', '')
DATABRICKS_WAREHOUSE_ID = os.getenv('DATABRICKS_WAREHOUSE_ID', '')
CATALOG_NAME = os.getenv('CATALOG_NAME', 'fraud_prevention_dev')
SERVING_ENDPOINT_NAME = os.getenv('SERVING_ENDPOINT_NAME', 'rtff-fraud-serving-dev')
PORT = int(os.getenv('PORT', '5000'))
