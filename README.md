# Pellucid AI Alignment Data Marketplace

A comprehensive AI alignment data marketplace with privacy-preserving data contribution, automated analysis, and interactive visualizations.

## 🚀 Quick Start

### Option 1: One-Command Startup (Recommended)

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

### Option 2: Manual Startup

1. **Start Python Services:**
   ```bash
   cd pellucid-labeling-api
   source venv/bin/activate  # On Windows: venv\Scripts\activate.bat
   python main.py &          # Labeling API (port 8000)
   python privacy_service.py &  # Privacy Service (port 8001)
   python visualization_service.py &  # Visualization Service (port 8002)
   ```

2. **Start Next.js Frontend:**
   ```bash
   cd pellucid-marketplace
   npm run dev
   ```

## 📊 Services & Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Next.js Frontend** | 3000 | http://localhost:3000 | Main web application |
| **Python Labeling API** | 8000 | http://localhost:8000 | Automatic data labeling |
| **Python Privacy Service** | 8001 | http://localhost:8001 | Privacy preservation & embeddings |
| **Python Visualization** | 8002 | http://localhost:8002 | 3D visualization & analytics |

## 🎯 Key Features

### Frontend (Next.js)
- **Landing Page**: Marketing site with statistics
- **Authentication**: User signup/login with JWT
- **Data Contribution**: Upload and stage data points
- **Marketplace**: Browse and purchase datasets
- **Dashboard**: User analytics and earnings
- **3D Visualization**: Interactive data exploration
- **AI Chatbot**: Modern chat interface for data insights

### Backend (Python FastAPI)
- **Privacy Preservation**: ML-based token replacement
- **Automatic Labeling**: OpenAI-powered data classification
- **Embedding Generation**: Vector embeddings for search
- **3D Visualization**: PCA clustering and analytics
- **Vector Search**: MongoDB Atlas integration

### Database (MongoDB)
- **User Management**: Authentication and profiles
- **Data Storage**: Individual data points with embeddings
- **Submissions**: Grouped data contributions
- **Datasets**: Market-ready data collections
- **Transactions**: Purchase and payout tracking

## 🛠️ Development

### Prerequisites
- **Node.js 18+**
- **Python 3.8+**
- **MongoDB Atlas** (or local MongoDB)

### Installation
```bash
# Install all dependencies
npm run install:all

# Or install separately:
cd pellucid-marketplace && npm install
cd pellucid-labeling-api && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### Environment Setup
Create `.env.local` in `pellucid-marketplace/`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pellucid
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
PYTHON_SERVICE_URL=http://localhost:8001
PYTHON_VISUALIZATION_SERVICE_URL=http://localhost:8002
```

### Available Scripts
```bash
npm start              # Start all services (macOS/Linux)
npm run start:windows  # Start all services (Windows)
npm run start:frontend # Start only Next.js frontend
npm run start:python   # Start only Python labeling API
npm run start:privacy  # Start only Python privacy service
npm run start:visualization # Start only Python visualization service
npm run build          # Build Next.js for production
npm run clean          # Stop all running services
npm run status         # Check which services are running
```

## 🎨 Demo Pages

- **Visualization Demo**: http://localhost:3000/visualization-demo
- **Marketplace**: http://localhost:3000/marketplace
- **Dashboard**: http://localhost:3000/dashboard
- **Authentication**: http://localhost:3000/auth
- **Data Contribution**: http://localhost:3000/contribute

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
npm run clean

# Or manually:
lsof -ti:3000 | xargs kill -9  # Next.js
lsof -ti:8000 | xargs kill -9  # Python Labeling
lsof -ti:8001 | xargs kill -9  # Python Privacy
lsof -ti:8002 | xargs kill -9  # Python Visualization
```

### Python Dependencies
```bash
cd pellucid-labeling-api
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Node.js Dependencies
```bash
cd pellucid-marketplace
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection
- Ensure your MongoDB Atlas cluster is running
- Check your connection string in `.env.local`
- Verify network access settings in MongoDB Atlas

## 📁 Project Structure

```
hackcmu/
├── pellucid-marketplace/          # Next.js frontend
│   ├── app/                      # App Router pages
│   ├── components/               # React components
│   ├── lib/                      # Utilities and types
│   └── public/                   # Static assets
├── pellucid-labeling-api/        # Python backend services
│   ├── main.py                   # Labeling API
│   ├── privacy_service.py        # Privacy & embeddings
│   ├── visualization_service.py  # 3D visualization
│   └── requirements.txt          # Python dependencies
├── start-all.sh                  # macOS/Linux startup script
├── start-all.bat                 # Windows startup script
└── package.json                  # Root package.json with scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm start`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify environment variables are set correctly
4. Check that all ports (3000, 8000, 8001, 8002) are available

---

**Happy coding! 🚀✨**
