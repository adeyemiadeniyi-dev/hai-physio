# Hai-Physio - AI-Powered Home Physiotherapy

**IBM Bob Dev Day Hackathon 2026**

An offline-first, voice-guided rehabilitation companion for low-resource settings. Patients perform physiotherapy at home with AI guidance, while clinicians monitor remotely.

## 🎯 The Problem

In low-resource settings (rural Africa, underserved communities), patients who need physiotherapy after injury or surgery cannot access regular clinic visits. Physiotherapists are scarce, transport is expensive, and follow-up rarely happens.

## 💡 The Solution

Hai-Physio enables patients to perform physiotherapy at home with AI guidance, while clinicians monitor remotely. It works on cheap Android phones with patchy internet, requires no camera, no literacy, and no constant internet connection.

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS - deployed as PWA
- **Backend**: FastAPI (Python)
- **AI Coaching**: IBM watsonx.ai (LLM for exercise instructions)
- **Voice**: IBM Watson Text-to-Speech
- **Offline Storage**: IndexedDB (sessions saved locally, synced when online)
- **Database**: SQLite (dev) / PostgreSQL (production)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- IBM Cloud account with watsonx.ai and Watson Text-to-Speech credentials

### Backend Setup

1. Navigate to backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate: `source venv/bin/activate` (Windows: `venv\Scripts\activate`)
4. Install dependencies: `pip install -r requirements.txt`
5. Configure `.env` from `.env.example` with IBM credentials
6. Run: `uvicorn main:app --reload`

Backend available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend: `cd frontend`
2. Install: `npm install`
3. Run dev: `npm run dev`
4. Build PWA: `npm run build && npm start`

Frontend available at `http://localhost:3000`

## 📱 Demo Flow

**Patient**: Tap "I am a Patient" → Play voice instructions → Complete exercise → Log reps & pain score

**Offline**: Turn off WiFi → Log session → Turn on WiFi → Auto-sync

**Clinician**: Tap "I am a Clinician" → View patient list → See pain trends → Flag high-pain sessions

## 🎯 Key Features

- ✓ Voice-first AI coaching (watsonx.ai + Watson TTS)
- ✓ Offline-first with automatic sync
- ✓ Emoji-based pain scale for low literacy
- ✓ Real-time clinician monitoring
- ✓ Progressive Web App (installable)

## 📊 API Endpoints

- `POST /sessions` - Create session
- `GET /sessions/{patient_id}` - Get patient sessions
- `PATCH /sessions/{id}/flag` - Flag session
- `POST /coaching/instruction` - AI coaching
- `POST /coaching/tts` - Text-to-speech

## 🔧 IBM Cloud Setup

1. Get watsonx.ai API key and Project ID
2. Get Watson TTS API key and URL
3. Add to backend `.env` file

## 📝 Notes

- Hardcoded patient "Maria" (p1) for MVP demo
- No authentication (simplified for hackathon)
- SQLite for dev, PostgreSQL for production

---

**Built for IBM Bob Dev Day Hackathon 2026** 🚀