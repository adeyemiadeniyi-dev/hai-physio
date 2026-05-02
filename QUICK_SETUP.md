# 🚀 Quick Setup Guide - Hai-Physio MVP

## ✅ What You've Already Done

- ✅ PostgreSQL database `hai_physio` created
- ✅ Browser's built-in speech synthesis configured (no IBM Watson TTS needed)
- ✅ All code files updated for PostgreSQL

---

## 📋 Next Steps (30 minutes total)

### Step 1: Get IBM watsonx.ai Credentials (15 mins)

**You need:**
- IBM watsonx.ai API Key
- IBM watsonx.ai Project ID

**How to get them:**
1. Go to https://cloud.ibm.com (use your colleague's account or create your own)
2. Navigate to watsonx.ai: https://dataplatform.cloud.ibm.com/wx/home
3. Create a project (or use existing one)
4. Get Project ID: Click "Manage" → "General" → Copy Project ID
5. Get API Key: https://cloud.ibm.com/iam/apikeys → Create new key

**Detailed guide:** See `SETUP_WATSONX_AI.md` (if needed)

---

### Step 2: Configure Backend (5 mins)

```bash
cd backend

# Create .env file from example
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

**Add your credentials:**
```env
# IBM watsonx.ai Configuration
WATSONX_API_KEY=your_actual_api_key_here
WATSONX_PROJECT_ID=your_actual_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# PostgreSQL Database (already created)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hai_physio

# Server Configuration
PORT=8000
```

**Note:** Update `DATABASE_URL` if your PostgreSQL credentials are different.

---

### Step 3: Install Backend Dependencies (5 mins)

```bash
# Make sure you're in backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Expected output:** All packages installed successfully

---

### Step 4: Start Backend (1 min)

```bash
# Make sure virtual environment is activated
# Make sure you're in backend directory

uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Test it:**
Open browser: http://localhost:8000
You should see: `{"message": "Hai-Physio API", "status": "running", ...}`

---

### Step 5: Install Frontend Dependencies (3 mins)

**Open a NEW terminal** (keep backend running):

```bash
cd frontend

# Install dependencies
npm install
```

**This will take 2-3 minutes.** Wait for it to complete.

---

### Step 6: Start Frontend (1 min)

```bash
# Make sure you're in frontend directory

npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

**Open browser:** http://localhost:3000

---

## 🧪 Test Your Setup (5 mins)

### Test 1: Home Page
- ✅ You should see "Hai-Physio" with two buttons
- ✅ "I am a Patient" and "I am a Clinician"

### Test 2: Patient Flow
1. Click "I am a Patient"
2. Wait for exercise card to load (AI instructions from watsonx.ai)
3. Click "Play Voice Instructions"
4. ✅ You should hear voice speaking (browser's built-in TTS)
5. Enter reps: 10
6. Select pain score: 3 (😐 Moderate)
7. Click "Save Session"
8. ✅ You should see green success message

### Test 3: Check Database
```bash
# In a new terminal
psql -U postgres -d hai_physio

# Run query
SELECT * FROM sessions;

# You should see your saved session
# Exit: \q
```

### Test 4: Clinician Dashboard
1. Go back to home: http://localhost:3000
2. Click "I am a Clinician"
3. ✅ You should see patient "Maria" with 1 session
4. ✅ Pain chart should display

---

## 🚨 Troubleshooting

### Backend Issues

**Error: "No module named 'ibm_watsonx_ai'"**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
```

**Error: "Could not connect to database"**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database exists: `psql -U postgres -l | grep hai_physio`
- Check DATABASE_URL in .env matches your PostgreSQL credentials

**Error: "WATSONX_API_KEY not configured"**
- Make sure .env file exists in backend directory
- Check you copied credentials correctly (no extra spaces)
- Restart backend: Ctrl+C, then `uvicorn main:app --reload`

### Frontend Issues

**Error: "Module not found"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: "Failed to fetch coaching instruction"**
- Check backend is running on port 8000
- Open http://localhost:8000/health in browser
- Should show: `{"status": "healthy", ...}`

**Voice not playing:**
- Check browser console (F12) for errors
- Try different browser (Chrome/Edge work best)
- Make sure volume is not muted

---

## ✅ Success Checklist

Before moving to demo preparation:

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can see home page with two buttons
- [ ] AI coaching instructions load (from watsonx.ai)
- [ ] Voice playback works (browser TTS)
- [ ] Can save a session
- [ ] Session appears in PostgreSQL database
- [ ] Clinician dashboard shows sessions
- [ ] Pain chart displays correctly

---

## 🎬 Next: Demo Preparation

Once everything works:

1. **Create test data:** Log 3-5 sessions with varying pain scores
2. **Test offline mode:** Toggle network in DevTools
3. **Practice demo:** Follow `DEMO_SCRIPT.md`
4. **Record video:** 5-minute demo showing all features

**See:** `DEMO_SCRIPT.md` for detailed video recording guide

---

## 📊 What's Different from Original Plan

### ✅ Changes Made:
1. **Database:** PostgreSQL instead of SQLite
   - More production-ready
   - Better for team collaboration
   - Already set up by you

2. **Text-to-Speech:** Browser's speechSynthesis instead of IBM Watson TTS
   - Works offline (better for demo!)
   - No additional IBM service needed
   - Free and unlimited
   - Actually better for the use case!

### ✅ Still Using IBM Tech:
- ✅ IBM watsonx.ai for AI coaching (REQUIRED for hackathon)
- ✅ IBM Bob built the entire codebase (REQUIRED for eligibility)

### ✅ Benefits:
- Simpler setup (one less IBM service)
- Works completely offline (better for rural Nigeria use case)
- Faster development (no TTS API calls)
- Still meets all hackathon requirements

---

## 🎯 Quick Commands Reference

**Start everything:**
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Stop everything:**
- Press Ctrl+C in both terminals

**Check database:**
```bash
psql -U postgres -d hai_physio -c "SELECT COUNT(*) FROM sessions;"
```

---

## 🆘 Need Help?

1. Check `DEPLOYMENT.md` for detailed troubleshooting
2. Check `README.md` for full setup guide
3. Check backend logs in terminal 1
4. Check browser console (F12) for frontend errors

---

**You're almost there! 🚀**

**Estimated time to working demo:** 30 minutes

**Next step:** Get your IBM watsonx.ai credentials and add them to `.env`
