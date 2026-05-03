# Sanjeevni — Real-Time Hospital Network OS

<div align="center">

**A production-grade emergency hospital coordination platform built for the real world.**

*Real-time patient transfers · ML surge forecasting · AI-assisted clinical decisions · Decentralized resource exchange*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sanjeevnifrontend.vercel.app-blue?style=for-the-badge)](https://sanjeevnifrontend.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-brightgreen?style=for-the-badge)](https://sanjeevni-9zgt.onrender.com)
[![ML Engine](https://img.shields.io/badge/ML%20Engine-FastAPI%20%2B%20Random%20Forest-orange?style=for-the-badge)](https://github.com/Krishna-Vineet/Sanjeevni/tree/main/hospital_patient_prediction)

</div>

---

## 🚨 The Real Problem

Every year, thousands of patients in India die not because there's no treatment available — but because **no one knows where it is in time.**

Hospital coordination still runs on phone calls, WhatsApp groups, and manual registers. When a critical patient arrives at a full ICU, the family scrambles. Doctors call ten hospitals. Ambulances drive blind. Ventilators sit unused five kilometers away.

**Sanjeevni eliminates this.**

---

## ⚡ What Sanjeevni Does

Sanjeevni is a **Hospital Network Operating System** — a real-time coordination layer connecting hospitals in a living, reactive network. Every node can:

| Feature | Description |
|---|---|
| 🔴 **Code Red Transfer Engine** | Create a patient transfer request and broadcast it instantly across the network. Nearby hospitals receive it, respond live, and a weighted scoring algorithm assigns the best match. |
| 🔄 **Resource Exchange Hub** | Broadcast shortages (Oxygen, Ventilators, Blood, PPE). Peer hospitals can accept and fulfill directly. Trust score updates on every transaction. |
| 🤖 **Smart Doctor AI** | Gemini-powered clinical assistant. Enter patient vitals and condition — get real-time triage support, treatment options, and escalation recommendations. |
| 📦 **Fleet Inventory Management** | Full CRUD inventory per hospital, synced to MongoDB. Edit assets live; the ML Surge Panel dynamically recalculates gaps against predicted peak demand. |
| 🧠 **ML Surge Prediction** | Python FastAPI microservice running a Random Forest model — predicts patient load for the next 7 days using historical data, AQI, rainfall, temperature, and lag features. Gaps surface directly in the Inventory UI. |
| ⚙️ **Auto-Accept Rules** | Hospitals configure severity + resource type rules stored in MongoDB. When a transfer is broadcast, the backend checks all recipient hospitals and auto-generates acceptances for matching rules — no manual action needed. |
| 📡 **Network News Broadcast** | Any hospital can broadcast a real-time advisory to the full network. Stored in MongoDB, served as the latest 5 entries on every dashboard. |
| 🔐 **Trust Score System** | Every hospital carries a live `trust_score` (0–100). Fulfilling a resource request `+5`. Accepting transfers improves score. The scoring engine weights it at `15%` in hospital matching. |

---


## 👥 Team & Contributions

<div align="center">

**Core Development Team — Sanjeevni**

</div>

---

### 🧠 Rakesh Gupta —
Machine Learning Engineer  
🔗 https://github.com/Raakeshguptaa  

**Contributions:**
- Built and trained the Random Forest model for patient surge prediction  
- Developed FastAPI microservice for ML inference  
- Implemented prediction logic with lag features and growth control  
- Optimized model performance and stability  

---

### ⚙️ Vineet Kumar Sahu —
Backend Developer  
🔗 https://github.com/Krishna-Vineet  

**Contributions:**
- Developed REST APIs using Node.js and Express  
- Designed MongoDB schemas and handled database operations  
- Implemented authentication using JWT and bcrypt  
- Built transfer system, resource exchange, and hospital modules  

---

### 🖥️ Vikas Kumar —
Frontend Developer  
🔗 https://github.com/vikas-kumar004  

**Contributions:**
- Built UI using React, Vite, and Tailwind CSS  
- Developed Dashboard, Transfer, and Resource pages  
- Integrated APIs using Axios  
- Managed routing and state for smooth UX  

---

### 🤖 Shivam Mishra —
AI Doctor 
🔗 https://github.com/Shivam-Mishra-2004  

**Contributions:**
- Implemented Smart Doctor using Gemini AI  
- Designed AI interaction and prompt system  
- Integrated AI into frontend interface  
- Contributed to UI development  

---


## 🏗️ System Architecture

Sanjeevni is a **three-service, independently deployable** system:

```
┌──────────────────────────────────────────────────────────────┐
│                      SANJEEVNI NETWORK                       │
│                                                              │
│   ┌────────────────┐   ┌──────────────────┐   ┌──────────┐   │
│   │   Frontend     │   │    Backend       │   │  ML      │   │
│   │                │   │                  │   │  Engine  │   │
│   │  React 19      │──►│  Node.js /       │   │          │   │
│   │  Vite 8        │   │  Express 5       │   │  FastAPI │   │
│   │  TailwindCSS 4 │◄──│  MongoDB         │   │  Python  │   │
│   │  Framer Motion │   │  Mongoose        │   │  RF Model│   │
│   │  Vercel        │   │  Render          │◄──│  :8001   │   │
│   └────────────────┘   └──────────────────┘   └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Frontend — `frontend/`

- **React 19** + **Vite 8** — Lightning-fast SPA
- **Tailwind CSS 4.0** — Premium dark glassmorphism UI
- **Framer Motion** — Page transitions and micro-animations
- **React Router v7** — Full client-side routing (with `vercel.json` SPA rewrites)
- **Axios** — Token-intercepted API calls with JWT auth headers injected automatically
- **SanjeevniContext** — Custom React Context providing global state: `hospitalInfo`, `activeTransfers`, `resourceRequests`, `notifications`, `isAuthenticated`
- Deployed on **Vercel**

**Pages:**
| Page | Route | Description |
|---|---|---|
| Login | `/login` | JWT authentication with password visibility toggle |
| Dashboard | `/` | Code Red feed, incoming requests, network news, logistics monitor |
| Transfer Request | `/transfer` | Create + broadcast patient transfer, view ranked hospital matches |
| Resource Exchange | `/resources` | Browse open resource broadcasts, respond, cancel |
| Smart Doctor | `/ai` | Gemini AI clinical assistant with chat history |
| Fleet Inventory | `/inventory` | Asset management table + live ML surge gap panel |
| Hospital Settings | `/settings` | Update capacity, auto-accept rules, persisted to MongoDB |

---

## ⚙️ Backend — `backend/`

**Stack:** Node.js · Express 5 · MongoDB (Mongoose) · JWT · bcryptjs · Google Gemini AI

### Entry Point
- **`server.js`** — Sets Google DNS resolvers (`8.8.8.8`, `1.1.1.1`) for Render deployment compatibility, connects to MongoDB, starts Express on `PORT 8000`.

### API Routes

| Route | File | Description |
|---|---|---|
| `POST /api/auth/login` | `auth.js` | Validates hospital_id + password (bcrypt), returns signed JWT |
| `POST /api/auth/logout` | `auth.js` | Clears session |
| `POST /api/transfer/create` | `transfer.js` | Creates a `TransferRequest` document in MongoDB |
| `GET /api/transfer/match/:id` | `transfer.js` | Runs weighted scoring across all hospitals, returns ranked list |
| `POST /api/transfer/broadcast` | `transfer.js` | Sets transfer status to `broadcasted`, triggers auto-accept checks |
| `GET /api/transfer/:id` | `transfer.js` | Returns transfer status + all hospital responses |
| `POST /api/transfer/finalize` | `transfer.js` | Selects best accepting hospital, sets `confirmed`, writes `assigned_hospital_id` |
| `GET /api/transfer/history` | `transfer.js` | Returns incoming + outgoing transfer history for the authenticated node |
| `GET /api/hospital/requests` | `hospital.js` | Returns pending transfers broadcast to this hospital |
| `POST /api/hospital/respond` | `hospital.js` | Hospital accepts/rejects a Code Red request |
| `PUT /api/hospital/capacity` | `hospital.js` | Updates ICU beds, general beds, oxygen, ventilators |
| `PUT /api/hospital/settings` | `hospital.js` | Saves auto-accept rules to MongoDB |
| `POST /api/resource/request` | `resource.js` | Creates a resource need broadcast |
| `POST /api/resource/respond` | `resource.js` | Accept/reject a resource request + updates fulfiller's trust score (`+5`) |
| `GET /api/resource/all` | `resource.js` | Returns all pending requests + your own accepted/fulfilled exchanges |
| `GET /api/resource/stats` | `resource.js` | Returns hospitals helped, hospitals that helped you, trust score |
| `DELETE /api/resource/cancel/:id` | `resource.js` | Removes a pending resource broadcast |
| `GET /api/inventory` | `inventory.js` | Fetch hospital inventory items |
| `PUT /api/inventory` | `inventory.js` | Sync inventory items array to MongoDB |
| `GET /api/news/latest` | `news.js` | Returns latest 5 network news entries |
| `POST /api/news/broadcast` | `news.js` | Publishes a new advisory to the network |
| `POST /api/ai/smart-doctor` | `ai.js` | Sends prompt to Gemini AI, returns clinical response |
| `GET /api/hospitals/nearby` | `system.js` | Returns hospitals sorted by Haversine distance |
| `POST /api/dev/seed` | `system.js` | Seeds 10 real Gurgaon hospitals from `.env` credentials |

### Data Models (MongoDB)

| Model | Key Fields |
|---|---|
| `Hospital` | `hospital_id`, `name`, `location_lat/lng`, `icu_beds`, `ventilators`, `oxygen_units`, `general_beds`, `trust_score`, `auto_accept_enabled`, `auto_accept_conditions`, `password` (hashed) |
| `TransferRequest` | `request_id`, `origin_hospital_id`, `severity`, `condition`, `required_resources`, `status` (`created → broadcasted → confirmed`), `assigned_hospital_id`, `top_3_priority_ids` |
| `TransferResponse` | `request_id`, `hospital_id`, `action` (accept/reject), `is_auto` |
| `ResourceRequest` | `resource_request_id`, `requesting_hospital_id`, `resource_type`, `quantity`, `status`, `fulfilled_by` |
| `Inventory` | `hospital_id`, `items: [{name, category, quantity, unit}]` |
| `News` | `title`, `content`, `source` (hospital name), `createdAt` |
| `ChatHistory` | `hospital_id`, `messages: [{role, content}]` |
| `HistoricalSurgeData` | Used for future ML retraining from live data |

### Scoring Engine — `scoringService.js`

The hospital matching algorithm uses a **weighted composite score**:

```
score = 0.35 × specialization_match
      + 0.25 × proximity_score       (inverse Haversine distance, capped at 50km)
      + 0.15 × normalized_rating     (hospital rating / 5.0)
      + 0.15 × trust_score           (trust_score / 100)
      + 0.10 × resource_availability
```

### Services

| Service | Description |
|---|---|
| `aiService.js` | Wraps `@google/generative-ai` — sends hospital context + patient input to Gemini, returns clinical response |
| `scoringService.js` | Pure function `computeMatchScore(hospital, request, distanceKm)` — no DB calls, purely mathematical |

### Middleware

| Middleware | Description |
|---|---|
| `authMiddleware.js` | `protect` — verifies JWT, attaches full `req.hospital` object from MongoDB |
| `errorMiddleware.js` | Global `notFound` + `errorHandler` — catches all unhandled errors, returns JSON error responses |

### Seeded Hospital Network (Gurgaon, Delhi NCR)
- Medanta - The Medicity
- Fortis Memorial Research Institute
- Artemis Hospital
- Max Super Speciality Hospital
- Narayana Superspeciality Hospital
- Paras Health
- CK Birla Hospital
- Park Hospital
- Cloudnine Hospital
- Signature Advanced Super Speciality

---

## 🧠 ML Microservice — `hospital_patient_prediction/`

**Stack:** Python · FastAPI · scikit-learn · pandas · joblib

### Endpoint
`POST /predict_next_7_days`
```json
// Request
{ "hosp_id": "MEDANTA01" }

// Response
{
  "predictions": [
    { "date": "2026-04-19", "predicted_patients": 42, "resources": { ... } }
  ],
  "total_resources_needed": {
    "ventilators": 3,
    "oxygen_cylinders": 17,
    "ppe_kits": 21,
    "masks": 210,
    "doctors": 6
  }
}
```

### Model

- **Algorithm:** Random Forest Regressor (trained via `src/model_training.py`)
- **Features:** `lag_1_patients`, `lag_7_patients`, `lag_14_patients`, `rolling_7_patients`, `rolling_14_patients`, `day_of_week`, `is_weekend`, `month`, `avg_aqi`, `avg_temp`, `avg_humidity`, `total_rainfall`, `total_revisit`, `is_holiday`
- **Autoregressive Loop:** Predicts one day at a time; each prediction becomes `lag_1` for the next day — prevents exponential drift
- **Growth Cap:** Maximum 8% day-over-day growth enforced — prevents model blow-up on high-lag days
- **Peak-Based Resources:** Hardware requirements calculated on the single **peak concurrent day**, not cumulative sum
- **Calibration Scalar:** `× 0.25` stabilization applied post-prediction
- **CORS:** Fully open (accepts browser direct calls)
- **Fallback:** If unreachable, frontend generates hospital-calibrated mock predictions automatically from `hospitalInfo.icu_beds`

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB URI (Atlas or local)
- Gemini API Key

### 1. Backend
```bash
cd backend
cp .env.example .env   # Fill in the required values
npm install
npm run dev            # http://localhost:8000
```

### 2. Seed Hospital Data
```bash
curl -X POST http://localhost:8000/api/dev/seed
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

### 4. ML Microservice
```bash
cd hospital_patient_prediction
pip install -r requirements.txt
py -m uvicorn app.main:app --reload --port 8001
# http://localhost:8001
```

---

## 🔑 Environment Variables

### `backend/.env`
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key

# Hospital Credentials (used by /api/dev/seed)
HOSP_MEDANTA_ID=MEDANTA01
HOSP_MEDANTA_PWD=your_password
HOSP_FORTIS_ID=FORTIS01
HOSP_FORTIS_PWD=your_password
# ... (one entry per hospital)
```

---

## 📁 Project Structure

```
Sanjeevni/
│
├── frontend/                         # React + Vite SPA
│   ├── public/icon.png               # Brand icon (favicon + UI logo)
│   ├── vercel.json                   # SPA rewrite rules for Vercel
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── TransferRequest.jsx
│       │   ├── ResourceExchange.jsx
│       │   ├── SmartDoctor.jsx
│       │   ├── Inventory.jsx
│       │   ├── HospitalSettings.jsx
│       │   ├── AdminCenter.jsx
│       │   └── Login.jsx
│       ├── components/Sidebar.jsx
│       ├── context/SanjeevniContext.jsx
│       └── services/api.js           # Axios API client
│
├── backend/                          # Node.js + Express API
│   ├── server.js                     # Entry point, DB connect
│   └── src/
│       ├── app.js                    # Express app, route mounting
│       ├── config/database.js        # MongoDB connection
│       ├── routes/                   # auth, transfer, hospital, resource, inventory, news, ai, system
│       ├── controllers/              # Business logic per module
│       ├── models/                   # Mongoose schemas
│       ├── services/
│       │   ├── aiService.js          # Gemini AI wrapper
│       │   └── scoringService.js     # Weighted hospital matching
│       ├── middleware/
│       │   ├── authMiddleware.js     # JWT protect
│       │   └── errorMiddleware.js    # Global error handler
│       └── utils/geo.js              # Haversine distance formula
│
└── hospital_patient_prediction/      # Python ML Microservice
    ├── app/
    │   ├── main.py                   # FastAPI server + inference endpoint
    │   └── schemas.py                # Pydantic request/response models
    ├── models/
    │   ├── rf_model.joblib           # Trained Random Forest
    │   └── preprocessor.joblib       # Column transformer
    ├── data/processed/
    │   └── daily_aggregated_data.csv # Training dataset
    └── src/model_training.py         # Training script
```

---

<div align="center">

**Built with urgency. Designed for lives.**

*Sanjeevni — Because the next Code Red cannot wait.*

</div>

