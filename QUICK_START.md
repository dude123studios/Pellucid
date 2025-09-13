# 🚀 Quick Start Commands

## One-Command Startup

**For macOS/Linux:**
```bash
npm start
```

**For Windows:**
```bash
npm run start:windows
```

**Or run the script directly:**
```bash
# macOS/Linux
./start-all.sh

# Windows
start-all.bat
```

## Manual Startup (if scripts don't work)

### 1. Start Python Services (3 terminals)
```bash
# Terminal 1 - Labeling API
cd pellucid-labeling-api
source venv/bin/activate
python main.py

# Terminal 2 - Privacy Service  
cd pellucid-labeling-api
source venv/bin/activate
python privacy_service.py

# Terminal 3 - Visualization Service
cd pellucid-labeling-api
source venv/bin/activate
python visualization_service.py
```

### 2. Start Next.js Frontend (1 terminal)
```bash
# Terminal 4 - Frontend
cd pellucid-marketplace
npm run dev
```

## 🎯 What You'll Get

- **Frontend**: http://localhost:3000
- **Visualization Demo**: http://localhost:3000/visualization-demo
- **Marketplace**: http://localhost:3000/marketplace
- **Python APIs**: http://localhost:8000, 8001, 8002

## 🛑 Stop All Services

```bash
# Kill all processes
npm run clean

# Or manually kill ports:
lsof -ti:3000,8000,8001,8002 | xargs kill -9
```

## ✅ Check Status

```bash
npm run status
```

---

**That's it! Your complete AI marketplace will be running! 🎉**
