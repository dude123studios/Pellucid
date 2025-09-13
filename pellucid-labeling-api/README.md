# Pellucid Data Labeling API

A Python FastAPI backend service that uses OpenAI to automatically label AI interaction data for the Pellucid platform.

## Features

- **Automatic Labeling**: Uses OpenAI GPT-3.5-turbo to generate descriptive labels and categories
- **Batch Processing**: Label multiple data items at once
- **Fallback Heuristics**: Simple keyword-based labeling when AI fails
- **CORS Support**: Configured for frontend integration
- **Health Checks**: Built-in health monitoring

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run the Server**
   ```bash
   python main.py
   ```
   
   Or with uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Health Check
- `GET /health` - Check API health status

### Categories
- `GET /categories` - Get available labeling categories

### Single Data Labeling
- `POST /label-single` - Label a single data item
  ```json
  {
    "payload": "AI interaction text here"
  }
  ```
  
  Response:
  ```json
  {
    "label": "Generated Label",
    "category": "Hallucination",
    "confidence": 0.85,
    "reasoning": "Brief explanation"
  }
  ```

### Batch Data Labeling
- `POST /label-batch` - Label multiple data items
  ```json
  {
    "data": [
      {
        "payload": "AI interaction 1",
        "label": null,
        "category": null
      },
      {
        "payload": "AI interaction 2",
        "label": "Existing Label",
        "category": "Existing Category"
      }
    ]
  }
  ```

## Categories

The API can classify data into these categories:
- Harmful Content
- Hallucination
- Reasoning Errors
- Creativity Weakness
- Alignment Issues
- Context Failures

## Integration with Frontend

To integrate with the Pellucid frontend, update the data creation API to call this labeling service when no label is provided:

```javascript
// In your frontend data creation
if (!label || !category) {
  const labelingResponse = await fetch('http://localhost:8000/label-single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: dataPayload })
  });
  
  const labelingResult = await labelingResponse.json();
  label = labelingResult.label;
  category = labelingResult.category;
}
```

## Error Handling

The API includes fallback mechanisms:
1. **AI Labeling**: Primary method using OpenAI
2. **Heuristic Fallback**: Keyword-based classification when AI fails
3. **Default Values**: Safe defaults for all fields

## Development

- **Hot Reload**: Use `--reload` flag with uvicorn
- **API Docs**: Available at `http://localhost:8000/docs`
- **CORS**: Configured for localhost:3000 (update for production)
