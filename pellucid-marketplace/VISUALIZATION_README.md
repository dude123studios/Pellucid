# Data Visualization System

A comprehensive data visualization system for the Pellucid AI Alignment Data Marketplace, featuring 3D scatter plots, analytics dashboards, and an AI-powered chatbot assistant.

## 🚀 Features

### 3D Data Visualization
- **Interactive 3D Scatter Plot**: Visualize data points in 3D space using CSS transforms
- **Category-based Coloring**: Each AI alignment category has a distinct color
- **Cluster Visualization**: Semi-transparent spheres show cluster centers with point counts
- **Interactive Controls**: Filter by categories, adjust point size, toggle labels and clusters
- **Point Selection**: Click on data points to see detailed information

### Analytics Dashboard
- **Overview Cards**: Key statistics about the dataset
- **Category Distribution**: Bar chart showing data distribution by category
- **Category Breakdown**: Pie chart with percentage breakdown
- **Cluster Analysis**: Detailed view of each cluster with progress bars
- **Category Trends**: Line chart showing trends over time
- **Technical Details**: Embedding dimensions, clustering algorithm info

### Modern AI Chatbot
- **Floating Chat Interface**: Modern, glass-morphism design
- **Real-time Responses**: Simulated AI responses with typing indicators
- **Quick Suggestions**: Pre-built suggestion buttons for common queries
- **Conversation History**: Persistent chat history with timestamps
- **Smart Analysis**: Context-aware responses about data patterns

### Visualization Controls
- **Point Size Control**: Adjustable slider for data point size
- **Display Options**: Toggle labels, clusters, axes, and grid
- **Category Filters**: Show/hide specific categories
- **Color Schemes**: Multiple color palette options
- **Clustering Settings**: Adjustable number of clusters and methods
- **Export/Share**: Export visualization data and share functionality

## 🛠️ Technical Implementation

### Frontend Components
- **`SimpleDataVisualization3D.tsx`**: CSS-based 3D visualization (no Three.js dependencies)
- **`StatsDashboard.tsx`**: Analytics dashboard with Recharts
- **`VisualizationControls.tsx`**: Interactive control panel
- **`ModernChatbot.tsx`**: AI chatbot with modern UI
- **`DataVisualizationPage.tsx`**: Main container component

### Demo Data System
- **`demo-data.ts`**: Generates realistic demo data for testing
- **Category Colors**: Consistent color palette across components
- **Sample Conversations**: Pre-built chatbot conversation examples

### Backend Integration
- **Python Visualization Service**: ML-based clustering and dimension reduction
- **MongoDB Integration**: Vector search and embedding storage
- **API Endpoints**: RESTful APIs for visualization data generation

## 🎨 Design Features

### Modern UI/UX
- **Glass Morphism**: Translucent cards with backdrop blur
- **Gradient Backgrounds**: Beautiful gradient overlays
- **Dark Theme**: Optimized for dark mode with proper contrast
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: CSS transitions and hover effects

### Color Palette
```typescript
const categoryColors = {
  "Harmful Content": "#ef4444",    // Red
  "Hallucination": "#f97316",      // Orange
  "Reasoning Errors": "#eab308",   // Yellow
  "Creativity Weakness": "#22c55e", // Green
  "Alignment Issues": "#06b6d4",   // Cyan
  "Context Failures": "#8b5cf6",   // Purple
  "Bias": "#ec4899",               // Pink
  "Misinformation": "#f43f5e",     // Rose
  "Good Response": "#10b981",      // Emerald
  "Unknown": "#6b7280"             // Gray
}
```

## 📊 Data Flow

1. **Data Generation**: Demo data is generated with realistic patterns
2. **3D Positioning**: Points are positioned in 3D space using embeddings
3. **Clustering**: K-means clustering groups similar data points
4. **Visualization**: CSS transforms create 3D effect without WebGL
5. **Interactivity**: Click handlers and filters provide user control
6. **Analytics**: Real-time statistics and charts update dynamically

## 🚀 Getting Started

### Demo Page
Visit `/visualization-demo` to see the full visualization system in action with demo data.

### Integration
```typescript
import DataVisualizationPage from "@/components/DataVisualizationPage";

<DataVisualizationPage
  dataIds={dataIds}
  visualizationType="submission"
  title="Your Data Visualization"
/>
```

### Customization
- Modify `categoryColors` in `demo-data.ts` for different color schemes
- Adjust demo data generation parameters for different datasets
- Customize chatbot responses in `ModernChatbot.tsx`

## 🔧 Configuration

### Environment Variables
```bash
PYTHON_VISUALIZATION_URL=http://localhost:8002
PYTHON_SERVICE_URL=http://localhost:8001
```

### Dependencies
- **Frontend**: React, Next.js, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Python, FastAPI, scikit-learn, spaCy, OpenAI
- **Database**: MongoDB Atlas with vector search

## 🎯 Use Cases

### For Data Contributors
- Visualize their submitted data in 3D space
- Understand clustering patterns and category distributions
- Get AI-powered insights about their data quality
- Export visualization data for further analysis

### For Dataset Purchasers
- Explore purchased datasets with interactive visualizations
- Understand data patterns before using in research
- Get AI assistance for data analysis and insights
- Share visualizations with team members

### For Researchers
- Analyze AI alignment issues across different categories
- Identify patterns in data clustering
- Export data for further research
- Collaborate using the chatbot assistant

## 🔮 Future Enhancements

- **Real-time Updates**: Live data streaming and updates
- **Advanced Clustering**: Multiple clustering algorithms
- **Custom Visualizations**: User-defined visualization types
- **Collaborative Features**: Multi-user visualization sessions
- **AI Integration**: Real AI backend for chatbot responses
- **Mobile Optimization**: Touch-friendly 3D interactions

## 📱 Mobile Support

The visualization system is fully responsive and works on mobile devices:
- Touch-friendly controls and interactions
- Optimized layout for small screens
- Swipe gestures for 3D navigation
- Collapsible control panels

## 🎨 Customization Guide

### Adding New Categories
1. Update `categoryColors` in `demo-data.ts`
2. Add category to demo data generation
3. Update color references in components

### Modifying Visualizations
1. Adjust CSS transforms in `SimpleDataVisualization3D.tsx`
2. Update chart configurations in `StatsDashboard.tsx`
3. Modify control options in `VisualizationControls.tsx`

### Customizing Chatbot
1. Update response templates in `ModernChatbot.tsx`
2. Add new suggestion buttons
3. Modify conversation flow and logic

## 🐛 Troubleshooting

### Common Issues
- **3D Points Not Visible**: Check CSS transform values and z-index
- **Charts Not Rendering**: Verify Recharts data format
- **Chatbot Not Responding**: Check demo conversation data
- **Performance Issues**: Reduce number of data points

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` to see detailed console output.

## 📄 License

This visualization system is part of the Pellucid AI Alignment Data Marketplace project.
