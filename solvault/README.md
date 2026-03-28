# My App

A fullstack boilerplate with a FastAPI backend and React + Vite frontend.

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Server runs at http://localhost:8000.
Health endpoint: GET http://localhost:8000/api/health

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173.
Vite proxies `/api/*` → `http://localhost:8000`.

## Running both

Open two terminals and run each server with the commands above.
