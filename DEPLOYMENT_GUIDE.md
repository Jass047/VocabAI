# 🚀 Deployment Guide: Railway (Backend) + Netlify (Frontend)

## Overview

- **Backend**: FastAPI on [Railway](https://railway.app)
- **Frontend**: React/Vite on [Netlify](https://netlify.com)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create a Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub (recommended) or email
3. Create a new project

### Step 2: Connect GitHub Repository

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Authorize Railway to access your GitHub account
4. Select your `vocab-enhancer` repository
5. Select the branch to deploy (usually `main`)

### Step 3: Configure Environment Variables

1. In Railway, go to **Variables** tab
2. Add these environment variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/vocab_db
SECRET_KEY=your-super-secret-key-generate-a-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AI_PROVIDER=gemini
GOOGLE_API_KEY=your_google_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-netlify-domain.netlify.app
```

### Step 4: Add PostgreSQL Database (Optional but Recommended)

1. Click **"Add Service"** → **"Add from Marketplace"**
2. Search for **"PostgreSQL"**
3. Select version and add
4. The `DATABASE_URL` will be automatically set

### Step 5: Deploy

Railway will automatically detect:
- ✅ Python project (via `requirements.txt`)
- ✅ Procfile for startup command

Click **"Deploy"** and wait for completion. You'll get a URL like: `https://vocab-enhancer-api.railway.app`

### Step 6: Verify Backend

Open: `https://vocab-enhancer-api.railway.app/docs`

You should see the FastAPI Swagger documentation.

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Create Netlify Account

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up with GitHub (recommended)

### Step 2: Connect GitHub Repository

1. Click **"Add new site"** → **"Import an existing project"**
2. Select **"GitHub"**
3. Authorize and select your `vocab-enhancer` repository
4. Netlify will auto-detect the build settings

### Step 3: Configure Build Settings

Netlify should auto-detect:
- **Build command**: `cd frontend && npm run build`
- **Publish directory**: `frontend/dist`

If not, set them manually in **Site settings** → **Build & deploy** → **Build settings**

### Step 4: Add Environment Variables

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"**
3. Add:

```
VITE_API_URL=https://vocab-enhancer-api.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Replace `vocab-enhancer-api.railway.app` with your actual Railway backend URL.

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete
3. You'll get a URL like: `https://vocab-enhancer.netlify.app`

---

## Part 3: Post-Deployment Configuration

### Step 1: Update CORS in Backend

In [backend/config.py](backend/config.py), update `FRONTEND_URL`:

```python
FRONTEND_URL = "https://your-netlify-domain.netlify.app"
```

In [backend/main.py](backend/main.py), update CORS origins:

```python
allow_origins=[FRONTEND_URL, "https://your-netlify-domain.netlify.app"]
```

### Step 2: Update API URL in Frontend

In [frontend/src/api.js](frontend/src/api.js), ensure the API URL uses environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

### Step 3: Configure Google OAuth

For Google authentication to work in production:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **OAuth 2.0 Consent Screen**
3. Add your Netlify domain to **Authorized JavaScript origins**:
   - `https://your-netlify-domain.netlify.app`
4. Add to **Authorized redirect URIs**:
   - `https://your-netlify-domain.netlify.app/auth/callback`
5. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Railway environment variables

---

## Part 4: Database Setup (PostgreSQL on Railway)

If you added PostgreSQL to Railway:

1. The `DATABASE_URL` is automatically set
2. SQLAlchemy will use it from environment variables
3. Database tables are created automatically on first startup via `init_db()`

**To migrate from SQLite to PostgreSQL locally:**

```bash
# Backup your current data if needed
cp backend/vocab_enhancer.db backend/vocab_enhancer.db.backup

# Update DATABASE_URL in .env to PostgreSQL URL
# Run the app - tables will be created automatically
python -m uvicorn backend.main:app --reload
```

---

## Part 5: Continuous Deployment (CI/CD)

Both Railway and Netlify automatically redeploy when you push to your connected GitHub branch. 

**To deploy updates:**

```bash
git add .
git commit -m "Update deployment configuration"
git push origin main
```

Both platforms will automatically rebuild and redeploy within minutes.

---

## Part 6: Monitoring & Debugging

### Railway Logs

1. Go to Railway dashboard
2. Click your project
3. Go to **Logs** tab
4. View real-time logs

### Netlify Logs

1. Go to Netlify dashboard
2. Click your site
3. Go to **Deploys** → click a deployment → **Deploy log**

---

## Troubleshooting

### Backend won't start

- Check logs in Railway for error messages
- Verify all environment variables are set
- Ensure `Procfile` exists in root or `backend/` directory

### Frontend shows blank page

- Check browser console for errors (F12 → Console)
- Verify `VITE_API_URL` is correct
- Check Netlify deploy logs for build errors

### API calls fail with CORS error

- Update `FRONTEND_URL` in Railway environment variables
- Verify CORS middleware in `backend/main.py` includes your Netlify domain

### Database connection issues

- Verify `DATABASE_URL` format is correct
- For PostgreSQL, ensure the database exists
- Check Railway PostgreSQL logs

---

## Environment Variables Summary

### Backend (Railway)

```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AI_PROVIDER=gemini
GOOGLE_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
FRONTEND_URL=https://your-netlify-domain.netlify.app
```

### Frontend (Netlify)

```
VITE_API_URL=https://your-railway-backend-url.railway.app
VITE_GOOGLE_CLIENT_ID=xxx
```

---

## Quick Links

- 🚂 [Railway Dashboard](https://railway.app/dashboard)
- 🌐 [Netlify Dashboard](https://app.netlify.com)
- 📚 [FastAPI Documentation](https://fastapi.tiangolo.com/)
- ⚛️ [React Documentation](https://react.dev)
- 🔑 [Google API Console](https://console.cloud.google.com)

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Netlify
3. ✅ Configure environment variables
4. ✅ Test the application
5. 📊 Monitor logs and performance
6. 🔄 Set up automatic deployments via GitHub

**Your app is now live! 🎉**
