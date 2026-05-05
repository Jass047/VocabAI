# 🚀 Complete Step-by-Step Deployment Guide
## Netlify (Frontend) + Railway (Backend)

---

## PART 1: Prepare Your GitHub Repository

### Step 1.1: Ensure Code is Committed
```bash
cd C:\Users\Dell\Downloads\vocab-enhancer\vocab-enhancer
git status
```
- You should see deployment files added (Procfile, Dockerfile, etc.)

### Step 1.2: Add New Changes to Git
```bash
git add .
git commit -m "Add deployment configuration for Railway and Netlify"
git push origin main
```
- This uploads your deployment setup to GitHub
- **Wait for push to complete** before proceeding

### Step 1.3: Verify on GitHub
1. Open [https://github.com](https://github.com)
2. Go to your `vocab-enhancer` repository
3. Refresh and confirm you see:
   - `Procfile`
   - `Dockerfile`
   - `railway.json`
   - `netlify.toml`
   - `.env.example`
   - `.gitignore`

---

## PART 2: Deploy Backend to Railway

### Step 2.1: Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Click **"Start Free"**
3. Sign up with GitHub (recommended)
   - Click **"Continue with GitHub"**
   - Authorize Railway to access your account
4. Create a new project

### Step 2.2: Connect Your GitHub Repository
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Click **"Connect GitHub"** if prompted
4. Find and select your `vocab-enhancer` repository
5. Select the branch: **`main`**
6. Click **"Deploy"**
   - Railway will auto-detect it's a Python project
   - Build process starts (~2-3 minutes)

### Step 2.3: Wait for Initial Build
- Go to **"Logs"** tab
- Wait until you see: `"Deployment Successful"`
- This means the backend is running!

### Step 2.4: Get Your Railway URL
1. Click **"Settings"** tab
2. Look for **"Domains"** section
3. You'll see a URL like: `https://vocab-enhancer-api-production.railway.app`
4. **Copy this URL** — you'll need it for Netlify

### Step 2.5: Add Environment Variables to Railway
Railway variables set secrets and configuration for your backend.

1. In Railway, click **"Variables"** tab
2. Click **"Add Variable"**
3. Add these variables one by one:

**Variable 1: AI Provider**
- Key: `AI_PROVIDER`
- Value: `gemini`
- Click ✅

**Variable 2: Gemini API Key** (FREE)
1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Back in Railway:
   - Key: `GEMINI_API_KEY`
   - Value: `paste_your_key_here`
   - Click ✅

**Variable 3: Google OAuth** (for authentication)
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click **"Select a Project"** → **"NEW PROJECT"**
4. Name: `vocab-enhancer` → **Create**
5. Wait for project creation
6. Go to **"APIs & Services"** → **"OAuth consent screen"**
7. Choose **"External"** → **"Create"**
8. Fill in:
   - App name: `Vocab Enhancer`
   - User support email: your email
   - Developer contact: your email
   - Click **"Save and Continue"**
9. Scopes: Click **"Save and Continue"** (defaults OK)
10. Test users: Click **"Save and Continue"**
11. Go to **"Credentials"**
12. Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**
13. Application type: **"Web application"**
14. Name: `vocab-enhancer-web`
15. Authorized JavaScript origins: Add
    - `http://localhost:5173` (local testing)
16. Authorized redirect URIs: Add
    - `http://localhost:5173/auth/callback` (local)
    - `https://your-netlify-url.netlify.app/auth/callback` (production - you'll update this later)
17. Click **"Create"**
18. Copy the displayed `Client ID` and `Client Secret`

Back in Railway, add:
   - Key: `GOOGLE_CLIENT_ID`
   - Value: `paste_your_client_id`
   - Click ✅

   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: `paste_your_client_secret`
   - Click ✅

**Variable 4: Secret Key**
Generate a random secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
This will output a random string like: `abc123xyz...`

Back in Railway:
   - Key: `SECRET_KEY`
   - Value: `paste_the_generated_string`
   - Click ✅

**Variable 5: Frontend URL** (update after Netlify deployment)
For now:
   - Key: `FRONTEND_URL`
   - Value: `http://localhost:5173`
   - **You'll update this after deploying to Netlify**
   - Click ✅

### Step 2.6: Trigger Redeploy with New Variables
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for build to complete
4. Check **"Logs"** for any errors

### Step 2.7: Test Backend API
1. Get your Railway URL from Step 2.4
2. Open: `https://your-railway-url/docs`
3. You should see **FastAPI Swagger UI** with all your endpoints
4. ✅ If you see this, your backend is working!

---

## PART 3: Deploy Frontend to Netlify

### Step 3.1: Create Netlify Account
1. Go to [https://netlify.com](https://netlify.com)
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Authorize and complete signup

### Step 3.2: Connect GitHub Repository
1. In Netlify dashboard, click **"Add new site"**
2. Choose **"Import an existing project"**
3. Select **"GitHub"**
4. Authorize Netlify to access your GitHub
5. Find and select `vocab-enhancer`
6. Click **"Open configuration"**

### Step 3.3: Configure Build Settings
Netlify should auto-detect, but verify:

1. **Base directory**: Leave empty (or `/`)
2. **Build command**: `cd frontend && npm run build`
3. **Publish directory**: `frontend/dist`
4. Click **"Deploy"**
   - Build starts (~3-5 minutes)
   - Check logs for progress

### Step 3.4: Wait for Build Completion
- Go to **"Deploys"** tab
- Wait until you see: `"Deploy published"`
- Your site is now live!

### Step 3.5: Get Your Netlify URL
1. In Netlify dashboard, look at the top
2. You'll see a URL like: `https://vocab-enhancer.netlify.app`
3. **Copy this URL**

### Step 3.6: Add Environment Variables to Netlify
1. In Netlify, go to **"Site settings"** (gear icon)
2. Click **"Build & deploy"** → **"Environment"**
3. Click **"Edit variables"**
4. Add Variable 1:
   - Key: `VITE_API_URL`
   - Value: `https://your-railway-url` (from Step 2.4)
   - Example: `https://vocab-enhancer-api-production.railway.app`
   - Click **"Save"**

5. Add Variable 2:
   - Key: `VITE_GOOGLE_CLIENT_ID`
   - Value: Your Google Client ID (from Step 2.5)
   - Click **"Save"**

### Step 3.7: Redeploy Frontend with New Variables
1. Go to **"Deployments"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete
4. Check logs for errors

---

## PART 4: Update Backend CORS Settings

Now that you have your Netlify URL, update the backend to allow requests from it.

### Step 4.1: Update Railway Variables
1. Go back to [Railway dashboard](https://railway.app)
2. Go to your project
3. Click **"Variables"** tab
4. Find `FRONTEND_URL` variable
5. Click the edit icon (pencil)
6. Change value from `http://localhost:5173` to your Netlify URL
   - Example: `https://vocab-enhancer.netlify.app`
7. Click ✅

### Step 4.2: Redeploy Backend
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on latest deployment
3. Wait for build to complete

---

## PART 5: Update Google OAuth Settings

### Step 5.1: Add Netlify Domain to Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your `vocab-enhancer` project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click on your OAuth 2.0 Client ID (the one you created)
5. Update **Authorized JavaScript origins**:
   - Add: `https://your-netlify-url.netlify.app`
   - Example: `https://vocab-enhancer.netlify.app`
   - Click **"Save"**
6. Update **Authorized redirect URIs**:
   - Add: `https://your-netlify-url.netlify.app/auth/callback`
   - Example: `https://vocab-enhancer.netlify.app/auth/callback`
   - Click **"Save"**

---

## PART 6: Final Testing

### Step 6.1: Test Frontend
1. Open your Netlify URL: `https://your-netlify-url.netlify.app`
2. You should see the landing page
3. Click **"Sign in with Google"**
4. Complete Google login
5. ✅ If login works, everything is connected!

### Step 6.2: Test Features
1. Try **"Vocabulary Enhancer"** → Paste some text
2. Try **"Word Explorer"** → Search a word
3. Try **"Quiz Arena"** → Take a quiz
4. ✅ All should work if backend is properly configured

### Step 6.3: Check Browser Console for Errors
1. Open frontend: `https://your-netlify-url.netlify.app`
2. Press **F12** to open Developer Tools
3. Go to **"Console"** tab
4. If you see red errors, screenshot them and check:
   - Is `VITE_API_URL` correct in Netlify?
   - Is backend running? (check Railway logs)
   - Is CORS properly configured?

---

## PART 7: Automatic Deployments

From now on, **whenever you push code to GitHub**, both platforms automatically redeploy:

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main

# Wait 2-5 minutes
# Railway and Netlify will automatically rebuild and deploy!
```

---

## 📊 Monitoring & Debugging

### Check Backend Logs (Railway)
1. Go to [Railway dashboard](https://railway.app)
2. Click your project
3. Go to **"Logs"** tab
4. See real-time output
5. Look for errors in red

### Check Frontend Logs (Netlify)
1. Go to [Netlify dashboard](https://app.netlify.com)
2. Click your site
3. Go to **"Deploys"** tab
4. Click a deployment
5. Click **"Deploy log"**
6. See build output

### Test Backend API
- Go to: `https://your-railway-url/docs`
- Try endpoints in the Swagger UI

---

## 🔑 Environment Variables Summary

### Railway (Backend)
```
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
SECRET_KEY=your_random_string
FRONTEND_URL=https://your-netlify-url.netlify.app
```

### Netlify (Frontend)
```
VITE_API_URL=https://your-railway-url.railway.app
VITE_GOOGLE_CLIENT_ID=your_id
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] Netlify account created
- [ ] Frontend deployed to Netlify
- [ ] Environment variables set on Railway
- [ ] Environment variables set on Netlify
- [ ] Google OAuth configured
- [ ] CORS settings updated
- [ ] Tested frontend login
- [ ] Tested features (quizzes, word lookup, etc.)

---

## 🆘 Troubleshooting

### "API connection failed" or CORS error
**Solution:**
- Check `VITE_API_URL` in Netlify is correct
- Check `FRONTEND_URL` in Railway is correct
- Redeploy both platforms

### Google login button doesn't work
**Solution:**
- Verify `GOOGLE_CLIENT_ID` in Netlify matches Google Cloud
- Verify Netlify domain in Google OAuth authorized origins
- Check browser console for error messages

### Backend shows 500 errors
**Solution:**
- Check Railway logs for error details
- Verify all environment variables are set
- Ensure API keys are valid

### Frontend shows blank page
**Solution:**
- Press F12, check Console tab for errors
- Check Netlify deploy log for build errors
- Verify build command: `cd frontend && npm run build`

---

## 🎉 You're Done!

Your app is now live with:
- ✅ Automatic deployments on every GitHub push
- ✅ Production API secured with authentication
- ✅ Google OAuth sign-in
- ✅ AI-powered features
- ✅ Professional hosting

**Share your Netlify URL with friends!** 🚀
