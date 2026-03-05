# 🚀 QUICK START - HyperGov

## ⚡ Fastest Way to Run

### Windows Users:
**Double-click:** `start-and-open.bat`
- Starts server automatically
- Opens browser automatically
- Everything just works!

### Command Line:
```bash
npm start
```
Then open: **http://localhost:3000**

---

## 📋 All Commands

| Command | What It Does |
|---------|--------------|
| `npm install` | Install dependencies (first time only) |
| `npm start` | Start the server |
| `npm run dev` | Start with auto-reload (development) |
| `start.bat` | Windows: Start server |
| `start-and-open.bat` | Windows: Start + open browser |

---

## 🌐 Access the Application

**Main URL:** http://localhost:3000

### All Pages:
- 🏠 Home: http://localhost:3000/
- 🔐 Sign In: http://localhost:3000/signin.html
- ✍️ Sign Up: http://localhost:3000/signup.html
- ℹ️ About: http://localhost:3000/about.html
- ❓ FAQs: http://localhost:3000/faq.html
- 📊 Analytics: http://localhost:3000/analytics.html
- 💬 Feedback: http://localhost:3000/feedback.html
- 🧪 Test: http://localhost:3000/test.html

---

## ✅ What's Connected

✅ Frontend (HTML/CSS/JS) - Served from `/public`
✅ Backend (Express API) - Running on port 3000
✅ All API endpoints - `/api/v1/*`
✅ Static files - CSS, JS, images
✅ Forms - Sign in, Sign up, Feedback

---

## 🛑 Stop the Server

Press `Ctrl + C` in the terminal

---

## 🔧 Troubleshooting

**Port 3000 busy?**
- Edit `.env` file
- Change `PORT=3000` to `PORT=5000`

**Dependencies missing?**
```bash
npm install
```

**Server won't start?**
- Check if Node.js is installed: `node --version`
- Make sure you're in the project directory

---

## 📁 Project Structure

```
hyperlocal-governance-engine/
├── public/              ← Frontend files
│   ├── css/
│   ├── js/
│   └── *.html
├── src/                 ← Backend files
│   ├── modules/
│   ├── config/
│   └── app.js
├── .env                 ← Configuration
├── package.json
├── start.bat           ← Quick start (Windows)
└── start-and-open.bat  ← Auto-open browser
```

---

## 🎯 That's It!

**Just run:** `npm start`
**Then open:** http://localhost:3000

Everything is connected and ready to use! 🎉
