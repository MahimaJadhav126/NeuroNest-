# NeuroNest — Full-Stack Academic MVP

NeuroNest is an evidence-informed digital wellbeing platform for:
- intentional technology use
- focus sessions
- exploratory memory/attention activities
- music and sound sessions
- breathing / mantra / reflection activities
- private journaling
- supportive NeuroSaathi chat
- personal analytics

## Architecture

React + Vite
→ FastAPI REST API
→ PostgreSQL

## 1. Fast local setup

### Requirements
- Node.js 20+
- Python 3.11+
- Docker Desktop (recommended)
- Git

### Start PostgreSQL + API

From the project root:

```powershell
docker compose up --build
```

API:
http://localhost:8000

API docs:
http://localhost:8000/docs

### Start frontend

Open another PowerShell:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal.

## 2. Without Docker

Create a PostgreSQL database called `neuronest`, then:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

## 3. Deployment

`render.yaml` is included as a starting point for a Render deployment:
- PostgreSQL database
- FastAPI API
- React/Nginx frontend

You still need to create/sign into the hosting account and supply the deployed API URL to the frontend environment variable. A real public URL cannot be created from source code alone without access to a hosting account.

## Academic / safety scope

NeuroLab metrics are exploratory and are NOT diagnostic for ADHD, dementia, depression, or other medical conditions.

NeuroSaathi is designed as supportive software, not a replacement for trusted people, therapists, doctors, or emergency support.

Do not put real secrets/API keys in the frontend or commit `.env` files to Git.
