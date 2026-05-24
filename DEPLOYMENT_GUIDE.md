# 📱 Handbook: Deploying Sonoray ERP & Downloading the APK

This guide explains how to set up the database and server on **Render.com**, deploy your frontend, and download the mobile app (APK) using **GitHub Actions**.

---

## 🛠️ Step 1: Create a Database on Render

Render provides managed PostgreSQL databases that are highly secure, reliable, and natively supported by your Prisma schema.

1. **Sign Up**: Register or log in to your account at [Render.com](https://render.com).
2. **Create Database**:
   - Tap **New** (top right) -> **PostgreSQL**.
   - Set the following fields:
     - **Name**: `sonoray-erp-db`
     - **Database Name**: `sonoray`
     - **User**: `admin`
     - **Region**: Choose the closest region to you (e.g., Singapore or US Oregon).
     - **Datadog API Key**: Leave empty.
     - **Plan**: Select **Free** (or any tier of your choice).
   - Click **Create Database**.
3. **Copy the Connection String**:
   - Once created, locate the **Connections** panel on your Render dashboard.
   - Copy the **External Connection String** (it starts with `postgresql://...`).
   - You will use this database URL in Step 2.

---

## 🚀 Step 2: Deploy the Backend on Render

1. **Connect GitHub**: Connect your GitHub repository to your Render account.
2. **Create Web Service**:
   - Tap **New** -> **Web Service**.
   - Select your repository containing the ERP code.
3. **Configure Service Settings**:
   - **Name**: `sonoray-backend`
   - **Region**: Same as your database.
   - **Branch**: `main` (or the branch you push to).
   - **Root Directory**: `backend` *(Make sure to specify this so Render builds inside the backend folder)*.
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free** (or any tier).
4. **Configure Environment Variables**:
   - Click the **Environment** tab in your Render Web Service dashboard.
   - Add the following variables:
     - `DATABASE_URL`: *(Paste the PostgreSQL External Connection String you copied in Step 1)*
     - `JWT_SECRET`: *(A secure password for employee sessions, e.g., `my-super-secret-12345`)*
     - `PORT`: `5000`
     - `FRONTEND_URL`: *(The URL of your frontend from Step 3, e.g., `https://sonoray-frontend.onrender.com/`)*
5. **Deploy**: Click **Create Web Service**. Render will now build and host your API backend! Copy your backend URL (e.g., `https://project-company-demo.onrender.com`).

---

## 🌐 Step 3: Deploy the Frontend (Vercel or Render)

Your frontend website is hosted at **`https://sonoray-frontend.onrender.com/`**.

When building or deploying the frontend:
1. Make sure to specify the following environment variable:
   - `NEXT_PUBLIC_API_URL`: **`https://project-company-demo.onrender.com`**
2. This links the visual frontend website to the active API database and server running in the cloud.

---

## 📱 Step 4: Configure and Build the Android APK

We have set up an automated build script! To generate your APK:

1. **Website URL pre-configured**:
   - The [MainActivity.java](file:///d:/location/location/mobile-app/app/src/main/java/com/sonoray/erp/MainActivity.java) has been pre-configured to open your website: **`https://sonoray-frontend.onrender.com/`**!
2. **Push to GitHub**:
   - Commit and push your code updates to GitHub:
     ```bash
     git add .
     git commit -m "Configure live API URL and Android wrapper settings"
     git push origin main
     ```
3. **Download the APK File**:
   - Go to your repository on **GitHub.com**.
   - Click the **Actions** tab at the top.
   - You will see a running workflow named **"📱 Build Sonoray ERP APK"**.
   - Let it compile (takes about 1.5 to 2 minutes). Once the green checkmark shows, click on the completed run.
   - Scroll down to the **Artifacts** section at the bottom.
   - Click **Sonoray-ERP-Android-App** to download your custom compiled APK file!

---

## 📱 Step 5: Install on your Phone

1. Transfer the downloaded `.apk` file to your Android phone (via USB, email, Google Drive, WhatsApp, or download it directly on the phone browser).
2. Tap the `.apk` file on your phone to install it.
   - *Note: Android will display a "Blocked by Play Protect" warning because it's a self-compiled development app. Tap **"Install Anyway"** to proceed.*
3. Open the app! Log in with your credentials.
4. When prompted, grant **Location** and **Camera** permissions.
5. You are fully operational! Tracking, chat, attendance, and camera photo uploads are now live globally on a real mobile application!
