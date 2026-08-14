# Step-by-Step Deployment Guide (PlaceTrack App)

This guide walks you through deploying the PlaceTrack placement portal. We deploy the **Backend** (Node.js/Express/WebRTC sockets) on **Render** and the **Frontend** (React/Vite) on **Vercel**.

---

## 1. Deploy the Backend on Render

Render is ideal for hosting Node.js servers with active WebSocket (Socket.io) endpoints.

### Step 1: Create a Render Web Service
1. Log in to [Render](https://render.com).
2. Click **New** (top right) and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and click **Next**.
4. Connect your GitHub repository: `vamsivalluri-19/pms`.

### Step 2: Configure Service Settings
Specify the settings below to compile from the monorepo subdirectory:
* **Name**: `pms-backend` (or similar)
* **Region**: Choose the closest region (e.g. Singapore or Oregon)
* **Branch**: `main`
* **Root Directory**: `backend` *(CRITICAL: Tell Render to run commands inside the backend folder)*
* **Runtime**: `Node`
* **Build Command**: `npm install`
* **Start Command**: `node server.js`
* **Instance Type**: Select **Free** (or any tier of your choice)

### Step 3: Add Environment Variables
Click **Advanced** and add the following Environment Variables (under **Env Groups** or **Environment Variables**):

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production configurations |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Connection String |
| `JWT_SECRET` | `your_secure_access_token_secret` | Random secret key for access tokens |
| `JWT_REFRESH_SECRET` | `your_secure_refresh_token_secret` | Random secret key for refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary credentials for resume storage |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API credentials |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API credentials |
| `GEMINI_API_KEY` | `your_gemini_key` | API Key for AI Resume & Interview Assistant |
| `FRONTEND_URL` | `https://pms-frontend.vercel.app` | Exact primary frontend URL (no trailing slash) |
| `EMAIL_HOST` | `smtp.mailtrap.io` | SMTP server host (e.g. Mailtrap or Gmail) |
| `EMAIL_PORT` | `2525` | SMTP port |
| `EMAIL_USER` | `your_smtp_user` | SMTP username |
| `EMAIL_PASS` | `your_smtp_password` | SMTP password |
| `CORS_ORIGIN` | `https://pms-frontend.vercel.app,https://*.vercel.app` | Comma-separated allowed origins. Supports wildcard patterns such as `https://*.vercel.app` for preview deployments. |
| `GOOGLE_CLIENT_ID` | `your_google_oauth_web_client_id.apps.googleusercontent.com` | Optional Google OAuth Web Client ID |
| `ADMIN_EMAIL` | `admin@yourcollege.edu` | Optional first-admin bootstrap account |
| `ADMIN_BOOTSTRAP_SECRET` | `long_random_secret` | Optional one-time admin registration secret |

### Step 4: Deploy and copy Backend URL
Click **Create Web Service**. Render will install dependencies and start the server. 
Once successfully deployed, copy your Render URL (e.g. `https://pms-backend.onrender.com`).

---

## 2. Deploy the Frontend on Vercel

Vercel is optimized for static React/Vite applications.

### Step 1: Create a Vercel Project
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your repository: `vamsivalluri-19/pms`.

### Step 2: Configure Project Settings
* **Project Name**: `pms-frontend` (or similar)
* **Framework Preset**: `Vite` (Vercel automatically detects this)
* **Root Directory**: `frontend` *(CRITICAL: Tell Vercel to compile inside the frontend folder)*

### Step 3: Build & Development Settings
Make sure Vercel sets the commands below:
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`

### Step 4: Add Environment Variables
Expand the **Environment Variables** accordion and add the variables pointing to your Render backend API:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://pms-backend.onrender.com/api` | Your Render Web Service URL appended with `/api` |
| `VITE_SOCKET_URL` | `https://pms-backend.onrender.com` | Your Render Web Service URL (without trailing slashes) |
| `VITE_GOOGLE_CLIENT_ID` | `your_google_oauth_web_client_id.apps.googleusercontent.com` | Optional; must exactly match backend `GOOGLE_CLIENT_ID` |

### Step 5: Deploy
Click **Deploy**. Vercel will build the React bundles and serve them. Copy your Vercel URL (e.g. `https://pms-frontend.vercel.app`).

### Step 6: Link Vercel URL back to Render Backend (Final Sync)
1. Go back to your Render Dashboard.
2. Select your `pms-backend` Web Service -> **Environment**.
3. Update `FRONTEND_URL` to your exact Vercel production URL, for example `https://pms-frontend.vercel.app`.
4. Update `CORS_ORIGIN` with every frontend origin that should call the API, for example `https://pms-frontend.vercel.app,https://*.vercel.app`.
5. Save changes and trigger a redeploy.

---

## 3. Verify Deployment
Open your Vercel URL. You should see the login screen.
* **Test Admin Login**: Sign in with the admin account you created using the configured bootstrap credentials. Never use demo credentials in production.
* **Test Video Interview**: Open an interview page. Live socket connection and camera feeds should connect dynamically!
* **Test Resume Builder**: Verify you can select templates and download them as selectable PDF resumes.
