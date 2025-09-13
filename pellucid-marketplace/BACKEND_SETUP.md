# Pellucid Backend Setup Guide

This guide will help you set up the complete backend infrastructure for the Pellucid AI Alignment Data Marketplace.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pellucid?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI API Key (for future AI analysis integration)
OPENAI_API_KEY=your-openai-api-key-here

# Blockchain Configuration (for future smart contract integration)
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=10
MIN_PAYOUT_AMOUNT=0.01

# Development/Production Environment
NODE_ENV=development
```

### 3. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and add it to `.env.local`
4. Whitelist your IP address in Atlas

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/pellucid`

### 4. Initialize Database

The database will be automatically initialized when you first run the application. This includes:
- Creating necessary indexes
- Seeding initial datasets
- Setting up collections

### 5. Start Development Server

```bash
npm run dev
```

## 📁 Backend Architecture

### Database Schema

#### Users Collection
```typescript
{
  _id: ObjectId,
  email?: string,          // Optional email for traditional auth
  walletAddress?: string,  // Crypto wallet for blockchain payouts
  name?: string,
  createdAt: Date,
  totalEarnings: number,
  submissions: ObjectId[],
  isActive: boolean
}
```

#### Submissions Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  originalText?: string,   // Temporarily stored during processing
  sanitizedText: string,   // Privacy-protected text
  categories: string[],    // AI alignment categories
  critiques: string[],     // AI-generated feedback
  valueEstimate: number,   // Estimated monetary value
  status: 'processing' | 'approved' | 'rejected',
  privacyScore: number,
  processingTime: number,
  createdAt: Date,
  updatedAt: Date,
  fileInfo?: {
    name: string,
    size: number,
    type: string
  }
}
```

#### Datasets Collection
```typescript
{
  _id: ObjectId,
  category: string,        // Alignment category
  title: string,
  description: string,
  samples: ObjectId[],     // Linked submissions
  price: number,           // $149 - $329
  buyerCount: number,
  totalDownloads: number,
  rating: number,
  tags: string[],
  severity: 'low' | 'medium' | 'high',
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean
}
```

#### Transactions Collection
```typescript
{
  _id: ObjectId,
  buyerId: ObjectId,
  datasetId: ObjectId,
  amountPaid: number,
  payoutDistributed: boolean,
  payoutAmount: number,
  contributors: Array<{
    userId: ObjectId,
    submissionId: ObjectId,
    amount: number
  }>,
  createdAt: Date,
  txHash?: string          // Blockchain transaction hash
}
```

### API Routes

#### Authentication (`/api/auth`)
- `POST /api/auth` - Login, signup, wallet connection
- JWT-based authentication
- Support for both email/password and wallet-based auth

#### Data Contribution (`/api/contribute`)
- `POST /api/contribute` - Submit AI interaction data
- Automatic privacy protection
- Background AI analysis processing

#### Analysis (`/api/analyze`)
- `POST /api/analyze` - Run AI analysis on text
- Categorizes alignment issues
- Estimates monetary value

#### Results (`/api/results/[id]`)
- `GET /api/results/[id]` - Fetch submission analysis results
- Detailed breakdown of findings
- Privacy verification

#### Marketplace (`/api/marketplace`)
- `GET /api/marketplace` - Browse datasets with filtering
- `POST /api/marketplace` - Create new datasets (admin)

#### Purchase (`/api/purchase`)
- `POST /api/purchase` - Purchase datasets
- Automatic payout distribution
- Blockchain transaction simulation

#### Dashboard (`/api/dashboard`)
- `GET /api/dashboard` - User statistics and earnings
- Contribution history
- Payment tracking

#### Payouts (`/api/payout`)
- `POST /api/payout` - Trigger payout distribution
- `GET /api/payout` - Check pending payouts
- Mock blockchain integration

## 🔒 Privacy Protection

### Token Substitution
- Names, emails, phone numbers automatically replaced
- Context-preserving anonymization
- Multiple privacy levels (standard, enhanced, maximum)

### Data Flow
1. User submits raw data
2. Privacy protection applied client-side
3. Only sanitized data stored in database
4. Original data never persisted

### Privacy Levels
- **Standard**: Basic PII removal
- **Enhanced**: Additional context preservation
- **Maximum**: Differential privacy with noise injection

## 🤖 AI Analysis System

### Alignment Categories
- **Harmful Content** ($12-25/example) - Bias, toxicity, discrimination
- **Hallucination** ($8-15/example) - Factual errors, misinformation
- **Reasoning Errors** ($10-20/example) - Logical fallacies, math errors
- **Creativity Weakness** ($5-12/example) - Repetitive, generic content
- **Alignment Issues** ($15-30/example) - Instruction following failures
- **Context Failures** ($6-18/example) - Memory and context loss

### Analysis Process
1. Text preprocessing and sanitization
2. Keyword-based pattern matching
3. Confidence scoring
4. Value estimation based on category and severity
5. Detailed critique generation

## 💰 Economic Model

### Pricing Formula
```
valueEstimate = basePrice(category) × confidenceScore × qualityMultiplier
```

### Payout Distribution
1. Dataset purchase triggers payout calculation
2. Revenue split based on contribution value
3. 10% platform fee deducted
4. Automatic distribution to contributors
5. Blockchain transaction simulation

### Mock Blockchain Integration
- Simulated transaction hashes
- Payout tracking and verification
- Ready for real smart contract integration

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production MongoDB URI
- Set up monitoring and logging

## 🔧 Development

### Database Management
```typescript
// Initialize database with indexes and seed data
import { initializeDatabase } from '@/lib/db-init'
await initializeDatabase()
```

### Testing
```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action": "login", "email": "test@example.com", "password": "password"}'

# Test data contribution
curl -X POST http://localhost:3000/api/contribute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text": "AI conversation data here", "privacyLevel": "standard"}'
```

## 🔮 Future Enhancements

### Real AI Integration
- Replace mock analysis with OpenAI GPT-4
- Implement more sophisticated classification
- Add sentiment analysis and bias detection

### Blockchain Integration
- Deploy smart contracts on Polygon/Arbitrum
- Real cryptocurrency payouts
- NFT-based dataset ownership

### Advanced Features
- Real-time collaboration
- Advanced analytics dashboard
- API rate limiting and caching
- Comprehensive logging and monitoring

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string format
   - Verify IP whitelist in Atlas
   - Ensure network connectivity

2. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header

3. **Privacy Protection Issues**
   - Verify text input format
   - Check privacy level configuration
   - Review sanitization patterns

4. **Analysis Failures**
   - Check text length requirements
   - Verify category keywords
   - Review confidence thresholds

### Debug Mode
Set `NODE_ENV=development` for detailed error logging and debugging information.

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review API error responses
3. Check MongoDB logs
4. Verify environment configuration

The backend is designed to be robust, scalable, and privacy-first, supporting the full Pellucid marketplace functionality while maintaining the highest standards of data protection.
