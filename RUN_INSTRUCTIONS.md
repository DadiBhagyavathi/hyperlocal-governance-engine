# 🚀 How to Run HyperGov Application

## Quick Start (Single Command)

### Option 1: Using npm start
```bash
npm start
```
This will start the server on http://localhost:3000

### Option 2: Using npm dev (with auto-reload)
```bash
npm run dev
```
This will start the server with nodemon for auto-reload on file changes

## Step-by-Step Instructions

### 1. Install Dependencies (First Time Only)
```bash
cd c:\Users\sama\Desktop\Hackthon\hyperlocal-governance-engine
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Your Browser
Navigate to: **http://localhost:3000**

## Available URLs

Once the server is running, you can access:

| Page | URL |
|------|-----|
| **Authentication** | http://localhost:3000/auth.html |
| **Dashboard** | http://localhost:3000/dashboard.html |
| **Test Page** | http://localhost:3000/test.html |
| **Home** | http://localhost:3000/ |
| **Sign In** | http://localhost:3000/signin.html |
| **Sign Up** | http://localhost:3000/signup.html |
| **About** | http://localhost:3000/about.html |
| **FAQs** | http://localhost:3000/faq.html |
| **Analytics** | http://localhost:3000/analytics.html |
| **Admin Panel** | http://localhost:3000/admin.html |
| **Health Check** | http://localhost:3000/health |

## Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/v1/auth/signin` | POST | User sign in |
| `/api/v1/auth/signup` | POST | User registration |
| `/api/v1/feedback` | POST | Submit feedback |
| `/api/v1/projects` | GET | Get projects |
| `/api/v1/geofence` | POST | Geofence operations |
| `/api/v1/analytics` | GET | Analytics data |

## Authentication Flow

### New Combined Auth Page
- **URL**: http://localhost:3000/auth.html
- **Features**: Side-by-side signin and signup sections
- **Flow**: 
  1. User visits any page
  2. If not authenticated, can still browse public pages
  3. Protected pages (Analytics, Feedback) redirect to /auth.html
  4. After successful signin → redirects to /dashboard.html
  5. After successful signup → can immediately signin

### Protected Pages
- **Dashboard**: Requires authentication
- **Analytics**: Requires authentication  
- **Feedback**: Requires authentication
- **About & FAQ**: Public access

## How It Works

### Frontend + Backend Integration

1. **Express Server** serves both:
   - Static files (HTML, CSS, JS) from `/public` folder
   - API endpoints from `/api/v1/*` routes

2. **Single Port (3000)** handles:
   - Frontend pages (HTML)
   - Backend APIs (JSON)

3. **No CORS Issues** because frontend and backend run on same origin

## Verify Everything is Working

### Method 1: Test Page
1. Start server: `npm start`
2. Open: http://localhost:3000/test.html
3. Click the test buttons to verify CSS, JS, and API

### Method 2: Manual Check
1. Open: http://localhost:3000/
2. You should see the home page with animations
3. Try navigating to different pages
4. Test the sign-up form

## Troubleshooting

### Port Already in Use
If port 3000 is busy:
1. Edit `.env` file
2. Change `PORT=3000` to another port (e.g., `PORT=5000`)
3. Restart server

### Dependencies Missing
```bash
npm install
```

### Server Won't Start
Check console for errors and ensure:
- Node.js is installed
- You're in the correct directory
- `.env` file exists

## Development Mode (Auto-Reload)

For development with automatic restart on file changes:
```bash
npm run dev
```

This uses nodemon to watch for file changes and restart automatically.

## Stop the Server

Press `Ctrl + C` in the terminal where the server is running.

## Production Deployment

For production:
1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/server.js --name hypergov
```

## Architecture

```
┌─────────────────────────────────────┐
│         Browser (Port 3000)         │
├─────────────────────────────────────┤
│  Frontend (HTML/CSS/JS)             │
│  - index.html                       │
│  - signin.html                      │
│  - signup.html                      │
│  - about.html                       │
│  - faq.html                         │
│  - analytics.html                   │
│  - feedback.html                    │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               │
┌──────────────▼──────────────────────┐
│    Express Server (Port 3000)       │
├─────────────────────────────────────┤
│  Static Files Middleware            │
│  - Serves /public folder            │
│                                     │
│  API Routes                         │
│  - /api/v1/auth/*                   │
│  - /api/v1/feedback                 │
│  - /api/v1/projects                 │
│  - /api/v1/geofence                 │
│  - /api/v1/analytics                │
└─────────────────────────────────────┘
```

## Summary

✅ **Frontend and Backend are CONNECTED**
✅ **Single server on port 3000**
✅ **No separate frontend server needed**
✅ **Just run: `npm start`**
✅ **Open: http://localhost:3000**

That's it! Everything runs together seamlessly.
