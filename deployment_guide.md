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
| `FRONTEND_URL` | `https://pms-frontend.vercel.app` | *Update this after creating the Vercel frontend project* |
| `EMAIL_HOST` | `smtp.mailtrap.io` | SMTP server host (e.g. Mailtrap or Gmail) |
| `EMAIL_PORT` | `2525` | SMTP port |
| `EMAIL_USER` | `your_smtp_user` | SMTP username |
| `EMAIL_PASS` | `your_smtp_password` | SMTP password |

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

### Step 5: Deploy
Click **Deploy**. Vercel will build the React bundles and serve them. Copy your Vercel URL (e.g. `https://pms-frontend.vercel.app`).

### Step 6: Link Vercel URL back to Render Backend (Final Sync)
1. Go back to your Render Dashboard.
2. Select your `pms-backend` Web Service -> **Environment**.
3. Update the `FRONTEND_URL` environment variable to match your Vercel URL: `https://pms-frontend.vercel.app`.
4. Save Changes. Render will redeploy with the updated config.

---

## 3. Verify Deployment
Open your Vercel URL. You should see the login screen.
* **Test Admin Login**: Enter credentials (`vamsivalluri52@gmail.com` / `Vamsi@1912`) to check if verification succeeds.
* **Test Video Interview**: Open an interview page. Live socket connection and camera feeds should connect dynamically!
* **Test Resume Builder**: Verify you can select templates and download them as selectable PDF resumes.
