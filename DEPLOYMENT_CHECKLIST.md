## 🚀 Quick Deployment Checklist

Your project is ready for deployment! Follow these steps:

### **Step 1: Prepare Your Repository**

- [ ] Push all code to GitHub
  ```bash
  git add .
  git commit -m "Add deployment configuration"
  git push origin main
  ```
- [ ] Ensure `.env` is in `.gitignore` (✅ Already done)
- [ ] Copy `.env.example` as `.env` locally with your API keys

---

### **Step 2: Deploy Backend to Railway (5-10 minutes)**

1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub"
4. Select your `vocab-enhancer` repository
5. Wait for auto-detection
6. Go to **Variables** tab and add these:

```
GEMINI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here (optional)
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
SECRET_KEY=generate_random_string
AI_PROVIDER=gemini
```

7. Click **Deploy** ✅
8. Copy your Railway URL (e.g., `https://vocab-enhancer-api-production.railway.app`)

---

### **Step 3: Deploy Frontend to Netlify (5-10 minutes)**

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select GitHub and your `vocab-enhancer` repository
5. **Build settings** (should auto-detect):
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
6. Go to **Site settings** → **Environment** → **Edit variables**
7. Add:
```
VITE_API_URL=https://your-railway-url.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
8. Click **Deploy site** ✅
9. Copy your Netlify URL (e.g., `https://vocab-enhancer.netlify.app`)

---

### **Step 4: Update Backend CORS**

1. In Railway dashboard, go to your project's **Variables**
2. Update or add:
```
FRONTEND_URL=https://your-netlify-url.netlify.app
```

---

### **Step 5: Test Your Deployment**

- [ ] Backend API: Open `https://your-railway-url.railway.app/docs`
  - You should see Swagger documentation
- [ ] Frontend: Open `https://your-netlify-url.netlify.app`
  - Should load without errors
- [ ] Try logging in with Google OAuth
- [ ] Test a quiz or word lookup

---

### **Environment Variables Reference**

**Backend (Railway):**
- `GEMINI_API_KEY` - Get from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- `ANTHROPIC_API_KEY` - Get from [console.anthropic.com](https://console.anthropic.com) (optional)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Get from [console.cloud.google.com](https://console.cloud.google.com)
- `SECRET_KEY` - Generate random: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `AI_PROVIDER` - Set to `gemini` or `claude`

**Frontend (Netlify):**
- `VITE_API_URL` - Your Railway backend URL
- `VITE_GOOGLE_CLIENT_ID` - Same as backend

---

### **Common Issues & Solutions**

**API calls fail (CORS error):**
- Update `FRONTEND_URL` in Railway variables to your actual Netlify domain

**Frontend shows blank page:**
- Check browser console (F12)
- Verify `VITE_API_URL` in Netlify environment variables

**Google OAuth doesn't work:**
- Add your Netlify domain to Google OAuth authorized origins
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

**Backend returns 500 error:**
- Check Railway logs for error messages
- Ensure all required environment variables are set

---

### **Next Steps (Optional)**

- [ ] Set up custom domain for Netlify
- [ ] Set up custom domain for Railway
- [ ] Enable SSL/HTTPS (auto-enabled by both platforms)
- [ ] Monitor logs for errors
- [ ] Set up email notifications for deployment failures

---

**✨ Your app will automatically redeploy whenever you push to GitHub!**

For detailed instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
