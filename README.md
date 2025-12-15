# Smart Farm / Hydroponics Dashboard

Rule-driven monitoring and control stack for pumps, curtains, and fans with Auto / Manual / Emergency modes.

## Architecture
- **Backend (Node + Express)**
  - REST endpoints: `/sensor/current`, `/sensor/history`, `/device/:name`, `/settings`.
  - In-memory rule engine watches sustained TDS overage and sensor stale windows, triggers event log entries, and enforces emergency lockouts.
  - Simulated sensor feed using non-blocking intervals to keep UI updated; automation toggles devices in AUTO mode.
- **Frontend (React + TypeScript + Vite + Recharts)**
  - Dashboard with stat cards, half-gauge visualizations, alert status, and rolling event log.
  - Control panel for mode selection and device toggles with emergency stop.
  - History chart with zoom-friendly responsive lines for temperature, humidity, TDS, and pH.
  - Settings form for thresholds, rule windows, and cooldowns persisted to backend.
- **Modes & Safety**
  - **AUTO:** rule engine drives devices from live sensor input.
  - **MANUAL:** direct toggles allowed; blocked when not in MANUAL.
  - **EMERGENCY:** shuts everything down, locks controls, logs `emergency_trigger`.

## Folder Structure
```
backend/       Express REST API with rule engine and simulation
frontend/      React + Vite client
```

## Running Locally
1. Backend
   ```bash
   cd backend
   npm install
   npm start
   ```
2. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Point the frontend to the backend via `VITE_API_URL` or use default `http://localhost:4000`.
