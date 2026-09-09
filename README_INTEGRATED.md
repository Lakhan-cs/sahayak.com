# Sahayak — Integrated Build

This build combines the **updated frontend**, the **updated Node.js backend**, and the **existing Flask AI/ML project**.

## Folder structure

```text
Sahayak_Integrated/
├── public/                 # Updated customer + worker frontend
├── node_backend/           # Node.js / Express backend + auth + bookings + worker APIs
├── flask_ai/               # Existing Flask AI/search/forecasting project
├── start_all.bat
├── run_node.bat
└── run_flask.bat
```

## Important

- Never commit `node_backend/.env`. Copy `.env.example` to `node_backend/.env` and add your private values.
- Flask AI files were preserved from the previous integrated build; no Flask chatbot/backend changes were made here.
- The browser uses Node/Express as the main server.
- Node proxies the existing Flask AI/ML endpoints using `FLASK_BASE_URL`.
- Google authentication uses the `GOOGLE_CLIENT_ID` already configured in the Node `.env`; it is never hard-coded into the source.
- Cloudinary configuration is preserved, but booking image uploads use the local `uploads/` folder so the project does not depend on an extra upload-storage package at startup.

## Run everything

From this folder:

```text
start_all.bat
```

This starts:

```text
Flask AI  → http://127.0.0.1:5000
Node      → http://127.0.0.1:3001
```

Open:

```text
http://127.0.0.1:3001/
```

## Setup for a new teammate

Prerequisites: Node.js 18+, Python 3.11+, MongoDB (local or Atlas), and Git.

```powershell
git clone <repository-url>
cd Sahayak_Final
Copy-Item .env.example node_backend/.env
notepad node_backend/.env
cd node_backend
npm install
cd ..\flask_ai
python -m pip install -r requirements.txt
cd ..
start_all.bat
```

Set at least `MONGODB_URI`, `JWT_SECRET_KEY`, and `REFRESH_SECRET_KEY` in `node_backend/.env`. Google login and email features require their optional credentials. Do not commit `.env`, `node_modules`, Python caches, or uploaded files.

## Run separately

### Flask

```text
run_flask.bat
```

### Node

```text
run_node.bat
```

Or manually:

```text
cd node_backend
npm install
npm start
```

```text
cd flask_ai
pip install -r requirements.txt
python app.py
```

## Main integrated flows

### Authentication

```text
Signup/Login
    ↓
Node /api/auth/*
    ↓
JWT access token + refresh cookie
    ↓
Customer or Worker dashboard
```

Google login:

```text
Google Identity Services
    ↓
/api/auth/google
    ↓
Google token verification
    ↓
Sahayak user/session
```

### Customer service flow

```text
Customer Homepage
    ↓
Service search / service selection
    ↓
Problem description + optional photos
    ↓
ASAP or scheduled service
    ↓
Location
    ↓
Worker matching screen
    ↓
Review booking
    ↓
POST /api/bookings
    ↓
MongoDB
    ↓
Booking confirmation
```

### Worker

```text
Worker Dashboard
    ↓
Profile
Availability
Service requests
Earnings
    ↓
Node /api/worker/*
```

### AI/ML

The existing Flask AI/ML system remains behind Node:

```text
Frontend
   ↓
Node /api/*
   ↓
Flask AI/ML
```

Existing forecasting, search, analytics and recommendation routes are preserved.

## Health check

```text
http://127.0.0.1:3001/api/node-health
```

Flask through Node:

```text
http://127.0.0.1:3001/api/health
```

## Notes

The customer booking UI now creates a real backend booking instead of generating a fake local booking ID.

Account-specific information such as current booking status, worker assignment and live earnings should be read from backend data rather than the static Flask datasets.

## Google Authentication

The login page uses Google Identity Services (official rendered Google Sign-In button) and sends the returned ID credential to `/api/auth/google`. Add `http://127.0.0.1:3001` and `http://localhost:3001` as Authorized JavaScript origins for the same Google OAuth client in Google Cloud Console.

## Latest AI Search Integration

- Public homepage AI Service Search now detects the service and highlights the matching card in Popular services.
- If the detected service is hidden behind View all, the service list expands automatically before highlighting it.
- The selected service is stored in `sessionStorage` so the normal service flow can use it.
- Customer homepage search now uses the same `/api/understand` AI endpoint instead of simple name matching.
- Customer AI Search -> View Service opens `service-request.html` with the detected service already selected.
- Customer AI search result is responsive on smaller screens.
- Google authentication updates remain included from the previous integrated build.
- Cooperative Society signup option remains removed; signup supports Customer and Worker.
