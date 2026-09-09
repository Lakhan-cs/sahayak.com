# Sahayak — Render Deployment Guide

This project runs as **two Render Web Services**:

1. **Node/Express service** → serves the website + API + Socket.IO
2. **Flask AI service** → serves the AI/forecast endpoints

Do **not** upload or commit any `.env` file. Add those values in Render's Environment Variables section.

## 1. Upload the code to GitHub

Upload the contents of this project to a GitHub repository.

The ZIP prepared for deployment does not contain:

- `.env` files
- `node_modules`
- the old local `.git` history

Keep `.env.example` files. They are templates only.

## 2. Deploy Flask AI first

In Render:

**New → Web Service → select your GitHub repository**

Use:

- Name: `sahayak-flask-ai`
- Language: `Python 3`
- Root Directory: `flask_ai`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`
- Plan: Free (if available for your account)

After deployment, copy the Flask service's public URL, for example:

`https://sahayak-flask-ai.onrender.com`

Test:

`https://sahayak-flask-ai.onrender.com/api/health`

## 3. Add Flask environment variables

Open the Flask service → **Environment**.

Add the variables your local `flask_ai/.env` currently uses, especially:

- `GEMINI_API_KEY` (if you use Gemini)
- `GEMINI_MODEL` (if your project uses a custom model)

Never paste real secret values into GitHub.

## 4. Deploy Node/Express

Create another Render service:

**New → Web Service → select the same GitHub repository**

Use:

- Name: `sahayak-node`
- Language: `Node`
- Root Directory: `node_backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Plan: Free (if available for your account)

Render provides the `PORT` environment variable automatically. Do not hard-code the production port.

## 5. Add Node environment variables

Open the Node service → **Environment** and add the values from your local `node_backend/.env`.

Required project variables include:

- `MONGODB_URI`
- `JWT_SECRET_KEY`
- `REFRESH_SECRET_KEY`
- `APP_MAIL`
- `APP_PASS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (if used by your login flow)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FLASK_TIMEOUT_MS=120000`
- `FLASK_BASE_URL=https://YOUR-FLASK-SERVICE.onrender.com`

Do not add `PORT=3001` for production. Render supplies `PORT` itself.

## 6. Important: Flask URL

For a free setup, use the Flask service's **public HTTPS URL** in `FLASK_BASE_URL`.

Example:

`FLASK_BASE_URL=https://sahayak-flask-ai.onrender.com`

If your Render plan/setup supports private networking for both services, you can instead use the Flask service's internal address.

## 7. Google Login

After the Node service gets its final public URL, update your Google OAuth configuration:

- Add the production origin to the authorized JavaScript origins.
- Add any required production redirect URI used by your login flow.

Use your actual Render URL, not `localhost`.

## 8. Final test

Open the Node Render URL.

Check in this order:

1. Homepage loads.
2. Login/signup works.
3. MongoDB-backed features work.
4. Service request flow works.
5. Dashboard opens.
6. Forecast pages load.
7. AI/forecast requests return data.
8. Worker recommendations work.
9. Messaging/Socket.IO works.
10. Google login works after OAuth settings are updated.

## 9. If the Node service says Flask is unavailable

Check the Node service environment variable:

`FLASK_BASE_URL`

It must point to the deployed Flask service, not:

`http://127.0.0.1:5000`

or

`http://localhost:5000`

## 10. If the Flask build says gunicorn is missing

This deployment ZIP already adds Gunicorn to:

`flask_ai/requirements.txt`

Build again with:

`pip install -r requirements.txt`

## 11. Important security note

Never commit `.env` files. If any real credentials were previously exposed in a ZIP, Git history, GitHub repository, or screenshot, rotate those credentials before public deployment.
