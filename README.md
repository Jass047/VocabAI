# 🧠 AI Vocabulary Enhancement System

> An AI-powered web application for students to enhance vocabulary, explore words, and test knowledge through adaptive quizzes.

**Subject:** INT428 — AI Essentials  
**University:** Lovely Professional University  
**Tech Stack:** Python FastAPI + React + SQLite + Claude/Gemini API

---

## ✨ Features

- **Vocabulary Enhancer** — Paste text, get AI-powered vocabulary suggestions and readability analysis
- **Text Rewriter** — Rewrite text in different tones (formal, casual, academic, creative)
- **Word Explorer** — Deep-dive into any word: definition, etymology, synonyms, antonyms, examples
- **Quiz Arena** — AI-generated MCQ & fill-in-the-blank quizzes with scoring and explanations
- **Word Bank** — Save, track, and master words with spaced repetition
- **Progress Dashboard** — Charts, stats, and learning streak tracking
- **PDF Export** — Download your word bank as a formatted PDF
- **Dark/Light Theme** — Toggle between themes
- **Google OAuth** — Secure sign-in with Google
- **Dual AI Support** — Switch between free Gemini and premium Claude API

---

## 🛠 Setup Instructions

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

---

### Step 1: Get API Keys

#### A) Google Gemini API Key (FREE — recommended)

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy the key — save it somewhere safe

#### B) Claude API Key (OPTIONAL — premium)

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up and verify your phone number
3. Go to **Settings > API Keys** and create a new key
4. You get ~$5 free credits

#### C) Google OAuth Credentials (for login)

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (name: "VocabAI" or anything)
3. In the left sidebar: **APIs & Services > Credentials**
4. Click **"+ CREATE CREDENTIALS" > "OAuth 2.0 Client ID"**
5. If asked to configure consent screen:
   - Choose **"External"** > Create
   - App name: "VocabAI"
   - User support email: your email
   - Add your email to developer contacts
   - Save and continue through all steps
6. Back in Credentials, create OAuth Client ID:
   - Application type: **"Web application"**
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/auth/callback`
7. Copy the **Client ID** and **Client Secret**

---

### Step 2: Clone & Configure

```bash
# Clone the project
git clone <your-repo-url>
cd vocab-enhancer

# Setup backend
cd backend
cp .env.example .env
# Open .env and paste your API keys

# Setup frontend
cd ../frontend
cp .env.example .env
# Open .env and paste your Google Client ID
```

Edit `backend/.env`:

```
AI_PROVIDER=gemini
GEMINI_API_KEY=your_actual_key_here
# or use OpenRouter:
# AI_PROVIDER=openrouter
# OPENROUTER_API_KEY=your_openrouter_api_key_here
# OPENROUTER_MODEL=openai/gpt-4o-mini
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_secret_here
```

Edit `frontend/.env`:

```
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
```

---

### Step 3: Install & Run

#### Terminal 1 — Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at: **http://localhost:8000**  
API docs at: **http://localhost:8000/docs**

#### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 4: Open & Use

1. Open **http://localhost:5173** in your browser
2. Click **"Continue with Google"** to sign in
3. Start exploring! Try the Word Explorer or Enhance Text features

---

## 📁 Project Structure

```
vocab-enhancer/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py             # Environment config
│   ├── database.py           # SQLAlchemy setup
│   ├── models.py             # Database models
│   ├── auth.py               # Google OAuth + JWT
│   ├── ai_service.py         # AI abstraction (Claude + Gemini)
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment template
│   └── routes/
│       ├── auth_routes.py    # Login endpoints
│       ├── vocab_routes.py   # Enhance, explore, rewrite
│       ├── quiz_routes.py    # Quiz generation & scoring
│       ├── wordbank_routes.py # Word bank CRUD + export
│       └── user_routes.py    # Dashboard stats & history
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Routing & layout
│       ├── api.js            # Axios API helper
│       ├── index.css         # Global styles
│       ├── context/
│       │   └── AuthContext.jsx # Auth & theme state
│       ├── components/
│       │   └── Sidebar.jsx   # Navigation sidebar
│       └── pages/
│           ├── Landing.jsx       # Landing + login
│           ├── Dashboard.jsx     # Stats + charts
│           ├── VocabEnhancer.jsx # Text enhancement
│           ├── WordExplorer.jsx  # Word lookup
│           ├── QuizArena.jsx     # Quiz system
│           ├── WordBankPage.jsx  # Saved words
│           └── Profile.jsx       # User profile
└── README.md
```

---

## 🔄 Switching AI Provider

In `backend/.env`, change one line:

```bash
# Use free Gemini (default)
AI_PROVIDER=gemini

# Or use premium Claude
AI_PROVIDER=claude
```

Restart the backend after switching.

---

## 🧪 API Endpoints

| Endpoint                 | Method | Description                    |
| ------------------------ | ------ | ------------------------------ |
| `/api/auth/google`       | POST   | Google OAuth login             |
| `/api/auth/me`           | GET    | Get current user               |
| `/api/vocab/enhance`     | POST   | Enhance text vocabulary        |
| `/api/vocab/explore`     | POST   | Explore a word                 |
| `/api/vocab/rewrite`     | POST   | Rewrite text in different tone |
| `/api/vocab/word-of-day` | GET    | Get AI word of the day         |
| `/api/quiz/generate`     | POST   | Generate quiz questions        |
| `/api/quiz/submit`       | POST   | Submit quiz answers            |
| `/api/quiz/history`      | GET    | Get quiz history               |
| `/api/wordbank/`         | GET    | List saved words               |
| `/api/wordbank/add`      | POST   | Add word to bank               |
| `/api/wordbank/export`   | GET    | Export as PDF                  |
| `/api/user/dashboard`    | GET    | Dashboard stats                |

Full interactive docs: **http://localhost:8000/docs**

---

## 📝 License

Built for educational purposes — INT428 AI Essentials, LPU.
