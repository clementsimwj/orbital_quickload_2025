# QuickLoad

QuickLoad is a mobile app for student residences in NUS that helps to facilitate laundry usage within the campus. This repo contains the full-stack Application including both frontend and backend
---
## TechStack
Frontend: React Native, Expo Go
Backend: FastAPI
Database: PostgreSQL

## Project Structure
main/
├── frontend/
│ └── .env.example
├── backend/
│ └── .env.example
└── README.md

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/clementsimwj/orbital_quickload_2025.git
```

### 2. Backend Setup

```bash
cd backend
# Create a new .env file
touch .env
# Copy the contents from .env.example to .env
cp .env.example .env
#Edit .env to add your real values
#Install dependencies
cd app
pip install -r requirements.txt
#Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
# Create a new .env file
touch .env
# Copy the contents from .env.example to .env
cp .env.example .env
#Edit .env to add your real values
#Install dependencies
npm install
#or
yarn install
#Start the Expo app
npx expo start
```
