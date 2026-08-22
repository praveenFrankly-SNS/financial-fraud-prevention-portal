# 🏦 Real-Time Financial Fraud Prevention — Unified UI Portals

An enterprise-grade, real-time financial fraud detection and operations control web application built with **React (TypeScript, Vite)** and **FastAPI (Python)**, powered by **Databricks Model Serving & Databricks SQL**.

---

## 🏛️ Architecture Overview

The application comprises two unified views serving different user personas across the transaction lifecycle:

```text
               ┌──────────────────────────────────────────────┐
               │              CUSTOMER PORTAL                 │
               │   Customer View (Bank / Transaction UI)      │
               │  - Submits UPI / Card payments               │
               │  - Performs Step-Up OTP Verification (CHALLENGE) │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    FastAPI Backend (5001)     │
                      │  - Databricks Model Serving   │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │           FINANCE OPERATIONS PORTAL          │
               │        Internal View (Risk Ops UI)           │
               │  - Real-time Databricks SQL Dashboard         │
               │  - Forensic Transaction Inspection & Audit   │
               │  - High-Risk Case Management                 │
               └──────────────────────────────────────────────┘
```

---

## 📂 Repository Layout

```text
UI/
├── Transaction Portal/             # Customer Bank Portal
│   ├── src/                       # React (TypeScript) frontend
│   └── backend/                   # FastAPI backend (Port 5001) -> Databricks Model Serving
│
├── Finance Operations Portal/      # Internal Risk & Ops Control Center
│   ├── src/                       # React (TypeScript) frontend
│   └── backend/                   # FastAPI backend (Port 5000) -> Databricks SQL Warehouse
│
└── WireFrame/                     # UI Wireframes & Mockups
```

---

## 🚀 Quick Start & Local Execution

### 1️⃣ Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: 3.10+
- **Databricks Workspace**: Access token, Workspace URL, and SQL Warehouse HTTP path.

---

### 2️⃣ Customer Bank Portal (Port 5174 / 5001)

#### Backend (FastAPI - Port 5001):
```bash
cd "UI/Transaction Portal"
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r backend/requirements.txt   # or fastapi uvicorn requests python-dotenv

# Set Databricks credentials in .env or environment variables:
# DATABRICKS_HOST=https://dbc-cb13acd9-016b.cloud.databricks.com
# DATABRICKS_TOKEN=your_personal_access_token

python -m uvicorn backend.main:app --port 5001 --reload
```

#### Frontend (React Vite - Port 5174):
```bash
cd "UI/Transaction Portal"
npm install
npm run dev -- --port 5174
```
Access at: **http://localhost:5174**

---

### 3️⃣ Finance Operations Portal (Port 5173 / 5000)

#### Backend (FastAPI - Port 5000):
```bash
cd "UI/Finance Operations Portal"
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r backend/requirements.txt

# Set Databricks SQL credentials in .env:
# DATABRICKS_HOST=dbc-cb13acd9-016b.cloud.databricks.com
# DATABRICKS_TOKEN=your_personal_access_token
# DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/...

python -m uvicorn backend.main:app --port 5000 --reload
```

#### Frontend (React Vite - Port 5173):
```bash
cd "UI/Finance Operations Portal"
npm install
npm run dev -- --port 5173
```
Access at: **http://localhost:5173**

---

## 🔒 Security & Data Policy
- **Zero Synthetic Fallback**: Real Databricks evaluations only. When Databricks Model Serving or SQL Warehouse is unreachable, explicit status banners inform operators without inventing artificial risk scores.
- **Role-Based Views**: Customer portal handles payment submission and step-up authentication. Operations portal provides read-only auditing and investigation of real-time Delta Lake tables.
