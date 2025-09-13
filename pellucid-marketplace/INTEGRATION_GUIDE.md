# Pellucid Frontend-Backend Integration Guide

This guide ensures that all frontend components properly display information by calling the backend and that features like login work correctly.

## 🚀 Quick Start

### 1. Start the Backend
```bash
npm run dev
```

### 2. Test Backend Connectivity
```bash
node test-backend.js
```

### 3. Verify Frontend Integration
Open http://localhost:3000 and test the following features:

## ✅ Integration Checklist

### **Authentication Flow**
- [ ] **Login Page** (`/auth`)
  - Email/password login works
  - Wallet connection works
  - JWT tokens are stored in localStorage
  - Redirects to dashboard after successful login

- [ ] **Wallet Connect Component**
  - Connects to backend `/api/auth` endpoint
  - Stores authentication token
  - Shows connected state
  - Handles disconnection properly

### **Data Contribution Flow**
- [ ] **Contribute Page** (`/contribute`)
  - Requires authentication (redirects to `/auth` if not logged in)
  - Calls `/api/contribute` endpoint
  - Shows real-time privacy protection demo
  - Processes file uploads
  - Redirects to results page with real submission ID

### **Results Display**
- [ ] **Results Page** (`/results/[id]`)
  - Fetches data from `/api/results/[id]`
  - Displays real analysis results
  - Shows privacy scores and processing times
  - Falls back to mock data if backend unavailable

### **Marketplace Integration**
- [ ] **Marketplace Page** (`/marketplace`)
  - Fetches datasets from `/api/marketplace`
  - Real-time search and filtering
  - Purchase functionality calls `/api/purchase`
  - Shows loading states

### **Dashboard Analytics**
- [ ] **Dashboard Page** (`/dashboard`)
  - Fetches user data from `/api/dashboard`
  - Shows real earnings and statistics
  - Displays contribution history
  - Payment tracking

### **Privacy Protection**
- [ ] **Privacy Page** (`/privacy`)
  - Calls `/api/sanitize` endpoint
  - Shows real-time privacy protection
  - Displays privacy scores
  - Example text demonstrations

## 🔧 Backend API Endpoints

### Authentication (`/api/auth`)
```typescript
POST /api/auth
{
  "action": "login" | "signup" | "wallet-connect",
  "email": "user@example.com", // for login/signup
  "password": "password123",   // for login/signup
  "name": "User Name",         // for signup
  "walletAddress": "0x..."     // for wallet-connect
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "walletAddress": "0x...",
    "totalEarnings": 0
  }
}
```

### Data Contribution (`/api/contribute`)
```typescript
POST /api/contribute
Headers: { "Authorization": "Bearer <token>" }
{
  "text": "AI conversation text",
  "files": [{"name": "file.txt", "size": 1024, "type": "text/plain"}],
  "privacyLevel": "standard" | "enhanced" | "maximum"
}

Response:
{
  "submissionId": "submission_id",
  "status": "processing",
  "estimatedProcessingTime": 30,
  "privacyScore": 0.95
}
```

### Results (`/api/results/[id]`)
```typescript
GET /api/results/[id]
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "submission": {
    "id": "submission_id",
    "status": "approved",
    "privacyScore": 0.95,
    "processingTime": 2.1,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "results": [
    {
      "id": "analysis_id",
      "category": "Hallucination",
      "severity": "medium",
      "confidence": 0.87,
      "description": "AI provided factually incorrect information",
      "excerpt": "The AI claimed that...",
      "estimatedValue": 14.5
    }
  ],
  "summary": {
    "totalValue": 61.5,
    "totalIssues": 4,
    "privacyScore": 0.95,
    "processingTime": 2.1,
    "categoryBreakdown": [...]
  }
}
```

### Marketplace (`/api/marketplace`)
```typescript
GET /api/marketplace?category=all&search=&sortBy=popular&page=1&limit=10

Response:
{
  "datasets": [
    {
      "id": "dataset_id",
      "title": "Harmful Content Detection Dataset",
      "category": "Harmful Content",
      "description": "Comprehensive collection of...",
      "price": 299.99,
      "samples": 15420,
      "rating": 4.8,
      "downloads": 1247,
      "createdAt": "2024-01-15T00:00:00Z",
      "tags": ["bias", "toxicity", "safety"],
      "severity": "high",
      "preview": "Sample preview text..."
    }
  ],
  "totalCount": 6,
  "categories": [
    {
      "name": "Harmful Content",
      "count": 1,
      "avgPrice": 300
    }
  ]
}
```

### Dashboard (`/api/dashboard`)
```typescript
GET /api/dashboard
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "totalEarnings": 247.83,
  "pendingPayments": 45.2,
  "totalContributions": 23,
  "activeDatasets": 8,
  "recentContributions": [
    {
      "id": "contribution_id",
      "title": "Hallucination Examples",
      "category": "Hallucination",
      "status": "approved",
      "earnings": 18.5,
      "date": "2024-02-15",
      "downloads": 12
    }
  ],
  "paymentHistory": [
    {
      "id": "payment_id",
      "amount": 67.25,
      "date": "2024-02-10",
      "txHash": "0x1234...5678",
      "status": "completed"
    }
  ]
}
```

### Purchase (`/api/purchase`)
```typescript
POST /api/purchase
Headers: { "Authorization": "Bearer <token>" }
{
  "datasetId": "dataset_id",
  "buyerId": "user_id"
}

Response:
{
  "transactionId": "transaction_id",
  "amount": 299.99,
  "contributors": 5,
  "estimatedPayout": 269.99
}
```

### Privacy Protection (`/api/sanitize`)
```typescript
POST /api/sanitize
{
  "text": "My name is John Smith and my email is john@example.com",
  "privacyLevel": "standard"
}

Response:
{
  "sanitizedText": "My name is [PERSON_NAME] and my email is [EMAIL_ADDRESS]",
  "replacements": [
    {
      "original": "John Smith",
      "replacement": "[PERSON_NAME]",
      "type": "personal_name",
      "confidence": 0.95
    }
  ],
  "privacyScore": 0.95,
  "contextPreserved": true
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Not Working**
   - Check if JWT token is stored in localStorage
   - Verify token is included in Authorization header
   - Check backend JWT_SECRET environment variable

2. **API Calls Failing**
   - Check browser network tab for error responses
   - Verify backend is running on port 3000
   - Check CORS headers in API responses

3. **Database Connection Issues**
   - Verify MONGODB_URI in .env.local
   - Check MongoDB Atlas connection
   - Ensure database indexes are created

4. **Frontend Not Updating**
   - Check if API calls are returning data
   - Verify state management in React components
   - Check for JavaScript errors in console

### Debug Steps

1. **Check Backend Logs**
   ```bash
   npm run dev
   # Look for error messages in terminal
   ```

2. **Test API Endpoints**
   ```bash
   node test-backend.js
   ```

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Verify Environment Variables**
   ```bash
   # Check if .env.local exists and has required variables
   cat .env.local
   ```

## 🎯 Testing Scenarios

### Complete User Journey Test

1. **Sign Up**
   - Go to `/auth`
   - Fill out signup form
   - Verify redirect to dashboard

2. **Contribute Data**
   - Go to `/contribute`
   - Paste AI conversation text
   - Submit and verify redirect to results

3. **View Results**
   - Check analysis results display
   - Verify privacy score and categories
   - Check value estimates

4. **Browse Marketplace**
   - Go to `/marketplace`
   - Test search and filtering
   - Try purchasing a dataset

5. **Check Dashboard**
   - Verify earnings display
   - Check contribution history
   - Review payment history

### Error Handling Test

1. **Invalid Login**
   - Try wrong credentials
   - Verify error message display

2. **Network Issues**
   - Disconnect internet
   - Verify fallback to mock data

3. **Unauthorized Access**
   - Try accessing protected pages without login
   - Verify redirect to auth page

## 🚀 Production Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
```

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Database Setup
1. Create MongoDB Atlas cluster
2. Set up database indexes
3. Seed initial datasets

## 📊 Monitoring

### Key Metrics to Monitor
- API response times
- Authentication success rate
- Data contribution volume
- Marketplace transactions
- Error rates

### Logging
- Backend logs all API requests
- Frontend logs user interactions
- Error tracking with stack traces

The integration is now complete and ready for production use! 🎉
