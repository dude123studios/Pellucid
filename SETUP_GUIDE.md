# 🚀 Pellucid Setup Guide

## Prerequisites

- **Node.js 18+**
- **Python 3.8+**
- **MongoDB Atlas account** (or local MongoDB)

## Quick Setup

### 1. Environment Configuration

Create `.env.local` in `pellucid-marketplace/`:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pellucid?retryWrites=true&w=majority

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Python Service URLs
PYTHON_SERVICE_URL=http://localhost:8001
PYTHON_VISUALIZATION_SERVICE_URL=http://localhost:8002

# Development Settings
NODE_ENV=development
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 3. Start All Services

```bash
# One command startup
npm start

# Or manually:
# Terminal 1: Python Labeling API
cd pellucid-labeling-api && source venv/bin/activate && python main.py

# Terminal 2: Python Privacy Service  
cd pellucid-labeling-api && source venv/bin/activate && python privacy_service.py

# Terminal 3: Python Visualization Service
cd pellucid-labeling-api && source venv/bin/activate && python visualization_service.py

# Terminal 4: Next.js Frontend
cd pellucid-marketplace && npm run dev
```

## Testing

### Test Python Services
```bash
npm run test:python
```

### Test Complete Data Flow
```bash
npm run test
```

### Test Individual Components
```bash
# Test service health
npm run status

# Test build
npm run build
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   npm run clean
   ```

2. **Python Dependencies Missing**
   ```bash
   cd pellucid-labeling-api
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **MongoDB Connection Issues**
   - Check your MongoDB Atlas connection string
   - Ensure network access is configured
   - Verify database user permissions

4. **OpenAI API Issues**
   - Verify your API key is correct
   - Check API usage limits
   - Ensure billing is set up

### Service URLs

- **Frontend**: http://localhost:3000
- **Python Labeling API**: http://localhost:8000
- **Python Privacy Service**: http://localhost:8001
- **Python Visualization Service**: http://localhost:8002

### Demo Pages

- **Visualization Demo**: http://localhost:3000/visualization-demo
- **Marketplace**: http://localhost:3000/marketplace
- **Dashboard**: http://localhost:3000/dashboard
- **Authentication**: http://localhost:3000/auth

## Data Flow

1. **User Authentication** → JWT token generation
2. **Data Creation** → Privacy sanitization + embedding generation
3. **Data Submission** → Background analysis + categorization
4. **Results Display** → Analysis results + visualization
5. **Marketplace** → Dataset browsing + purchasing

## Architecture

```
Frontend (Next.js) ←→ Backend APIs ←→ Python Services ←→ MongoDB
     ↓                    ↓                ↓              ↓
  React UI            API Routes      ML Processing    Data Storage
  Components          Authentication   Privacy/Embed   Users/Data
  Visualization       Data Management  Clustering      Submissions
```

## Development

### Adding New Features

1. **Frontend**: Add components in `pellucid-marketplace/components/`
2. **API Routes**: Add endpoints in `pellucid-marketplace/app/api/`
3. **Python Services**: Add endpoints in `pellucid-labeling-api/`
4. **Database**: Update schemas in `pellucid-marketplace/lib/types.ts`

### Code Structure

```
hackcmu/
├── pellucid-marketplace/          # Next.js frontend
│   ├── app/                      # App Router pages & API routes
│   ├── components/               # React components
│   ├── lib/                      # Utilities, types, MongoDB
│   └── public/                   # Static assets
├── pellucid-labeling-api/        # Python backend services
│   ├── main.py                   # Labeling API
│   ├── privacy_service.py        # Privacy & embeddings
│   ├── visualization_service.py  # 3D visualization
│   └── requirements.txt          # Python dependencies
└── scripts/                      # Startup & test scripts
```

## Production Deployment

### Frontend (Vercel)
```bash
cd pellucid-marketplace
vercel --prod
```

### Python Services (Docker)
```bash
cd pellucid-labeling-api
docker build -t pellucid-api .
docker run -p 8000:8000 -p 8001:8001 -p 8002:8002 pellucid-api
```

### Environment Variables
Set all environment variables in your deployment platform:
- MongoDB URI
- JWT Secret
- OpenAI API Key
- Service URLs

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Run the test scripts
3. Check service logs
4. Verify environment variables

---

**Happy coding! 🚀✨**
