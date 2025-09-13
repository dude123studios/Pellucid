from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, AsyncGenerator
import openai
import os
from dotenv import load_dotenv
import json
import uuid
from datetime import datetime

# Import chatbot modules
from chatbot_models import ChatRequest, ChatResponse, LoginRequest
from rag_agent import rag_agent
from chatbot_auth import get_current_user, verify_dataset_access, auth_manager
from mock_chatbot_data import mock_store

# Import privacy service
from privacy_service import privacy_service

# Import visualization service
from visualization_service import visualization_service

# Load environment variables
import os
from pathlib import Path

# Get the directory where this script is located
script_dir = Path(__file__).parent
env_path = script_dir / '.env'

print(f"Looking for .env file at: {env_path}")
print(f".env file exists: {env_path.exists()}")

load_dotenv(env_path, override=True)

# Debug: Check if environment variables are loaded
print(f"OPENAI_API_KEY loaded: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
if os.getenv('OPENAI_API_KEY'):
    print(f"OPENAI_API_KEY starts with: {os.getenv('OPENAI_API_KEY')[:10]}...")

# Initialize FastAPI app
app = FastAPI(title="Pellucid Data Labeling API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models
class DataItem(BaseModel):
    payload: str
    label: Optional[str] = None
    category: Optional[str] = None

class LabelingRequest(BaseModel):
    data: List[DataItem]

class LabelingResponse(BaseModel):
    labeled_data: List[DataItem]
    success: bool
    message: str

class SingleLabelingRequest(BaseModel):
    payload: str

class SingleLabelingResponse(BaseModel):
    label: str
    category: str
    confidence: float
    reasoning: str

# AI Labeling Categories
CATEGORIES = [
    "Harmful Content",
    "Instruction Following"
    "Relevance"
    "Hallucination", 
    "Reasoning Errors",
    "Creativity Weakness",
    "Alignment Issues",
    "Context Failures"
]

def generate_label_with_ai(payload: str) -> dict:
    """
    Use OpenAI to generate a label and category for the given data payload
    """
    try:
        prompt = f"""
You are an AI expert analyzing AI interaction data for alignment issues. 

Analyze the following AI interaction and provide:
1. A concise, descriptive label (2-5 words)
2. The most appropriate category from: {', '.join(CATEGORIES)}
3. Your confidence level (0.0 to 1.0)
4. Brief reasoning for your classification

AI Interaction:
"{payload}"

Respond in JSON format:
{{
    "label": "your label here",
    "category": "category name",
    "confidence": 0.85,
    "reasoning": "brief explanation"
}}
"""

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert AI safety researcher specializing in identifying alignment issues in AI interactions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )

        # Parse the JSON response
        content = response.choices[0].message.content.strip()
        
        # Try to extract JSON from the response
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        
        result = json.loads(content)
        
        # Validate the response
        if result.get("category") not in CATEGORIES:
            result["category"] = "General"
        
        return {
            "label": result.get("label", "AI Interaction"),
            "category": result.get("category", "General"),
            "confidence": float(result.get("confidence", 0.5)),
            "reasoning": result.get("reasoning", "AI-generated classification")
        }
        
    except Exception as e:
        print(f"Error in AI labeling: {e}")
        # Fallback to simple heuristics
        return generate_fallback_label(payload)

def generate_fallback_label(payload: str) -> dict:
    """
    Fallback labeling using simple heuristics when AI fails
    """
    payload_lower = payload.lower()
    
    # Simple keyword-based categorization
    if any(word in payload_lower for word in ["hate", "violence", "harmful", "toxic", "offensive"]):
        category = "Harmful Content"
        label = "Harmful Content"
    elif any(word in payload_lower for word in ["wrong", "incorrect", "false", "mistake", "error"]):
        category = "Hallucination"
        label = "Factual Error"
    elif any(word in payload_lower for word in ["boring", "generic", "repetitive", "unoriginal"]):
        category = "Creativity Weakness"
        label = "Lack of Creativity"
    elif any(word in payload_lower for word in ["confused", "misunderstood", "context", "lost"]):
        category = "Context Failures"
        label = "Context Issue"
    elif any(word in payload_lower for word in ["reasoning", "logic", "calculate", "math"]):
        category = "Reasoning Errors"
        label = "Reasoning Error"
    elif any(word in payload_lower for word in ["instruction", "format", "follow", "comply"]):
        category = "Alignment Issues"
        label = "Alignment Issue"
    else:
        category = "General"
        label = "AI Interaction"
    
    return {
        "label": label,
        "category": category,
        "confidence": 0.6,
        "reasoning": "Fallback heuristic classification"
    }

@app.get("/")
async def root():
    return {"message": "Pellucid Data Labeling API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "labeling-api"}

@app.post("/label-single", response_model=SingleLabelingResponse)
async def label_single_data(request: SingleLabelingRequest):
    """
    Label a single data item
    """
    try:
        result = generate_label_with_ai(request.payload)
        
        return SingleLabelingResponse(
            label=result["label"],
            category=result["category"],
            confidence=result["confidence"],
            reasoning=result["reasoning"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error labeling data: {str(e)}")

@app.post("/label-batch", response_model=LabelingResponse)
async def label_batch_data(request: LabelingRequest):
    """
    Label multiple data items
    """
    try:
        labeled_data = []
        
        for item in request.data:
            if item.label and item.category:
                # Data already has label and category
                labeled_data.append(item)
            else:
                # Generate label and category
                result = generate_label_with_ai(item.payload)
                
                labeled_item = DataItem(
                    payload=item.payload,
                    label=result["label"],
                    category=result["category"]
                )
                labeled_data.append(labeled_item)
        
        return LabelingResponse(
            labeled_data=labeled_data,
            success=True,
            message=f"Successfully labeled {len(labeled_data)} items"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error labeling batch: {str(e)}")

@app.get("/categories")
async def get_categories():
    """
    Get available categories for labeling
    """
    return {"categories": CATEGORIES}

# ===== CHATBOT ENDPOINTS =====

@app.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Stream chat responses using RAG
    """
    # Check dataset access
    user_id = current_user["user_id"]
    has_access = mock_store.check_dataset_access(user_id, request.dataset_id)
    if not has_access:
        raise HTTPException(
            status_code=403,
            detail="You don't have access to this dataset"
        )
    
    session_id = request.session_id or str(uuid.uuid4())
    
    async def generate_response() -> AsyncGenerator[str, None]:
        try:
            # Send session ID first
            yield f"data: {json.dumps({'type': 'session', 'session_id': session_id})}\n\n"
            
            # Generate streaming response
            response_text = ""
            async for chunk in rag_agent.generate_response(
                request.message,
                request.dataset_id,
                request.conversation_history
            ):
                response_text += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            
            # Get sources
            sources = await rag_agent.get_sources(request.message, request.dataset_id)
            
            # Send final response with sources
            final_response = {
                "type": "complete",
                "message": response_text,
                "sources": sources,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat()
            }
            yield f"data: {json.dumps(final_response)}\n\n"
            
        except Exception as e:
            error_response = {
                "type": "error",
                "error": str(e),
                "session_id": session_id
            }
            yield f"data: {json.dumps(error_response)}\n\n"
    
    return EventSourceResponse(generate_response())

@app.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Non-streaming chat endpoint
    """
    try:
        # Check dataset access
        user_id = current_user["user_id"]
        has_access = mock_store.check_dataset_access(user_id, request.dataset_id)
        if not has_access:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this dataset"
            )
        
        session_id = request.session_id or str(uuid.uuid4())
        
        # Generate response
        response_text = ""
        async for chunk in rag_agent.generate_response(
            request.message,
            request.dataset_id,
            request.conversation_history
        ):
            response_text += chunk
        
        # Get sources
        sources = await rag_agent.get_sources(request.message, request.dataset_id)
        
        return ChatResponse(
            message=response_text,
            sources=sources,
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/datasets/{dataset_id}")
async def get_dataset_info(
    dataset_id: str,
    current_user: dict = Depends(verify_dataset_access)
):
    """
    Get dataset information
    """
    dataset_info = mock_store.get_dataset_info(dataset_id)
    if not dataset_info:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return dataset_info

@app.post("/auth/login")
async def login(request: LoginRequest):
    """
    Mock login endpoint (replace with real authentication)
    """
    # In production, this would validate credentials
    # For now, we'll create a mock token
    token = auth_manager.create_access_token(data={"sub": request.user_id})
    return {"access_token": token, "token_type": "bearer"}

# ===== VISUALIZATION SERVICE ENDPOINTS =====

@app.post("/visualize")
async def generate_visualization(request: dict):
    """
    Generate visualization data for a set of data objects
    """
    try:
        data_ids = request.get("data_ids", [])
        visualization_type = request.get("visualization_type", "submission")
        n_clusters = request.get("n_clusters", 5)
        include_analytics = request.get("include_analytics", True)
        
        if not data_ids or not isinstance(data_ids, list):
            raise HTTPException(status_code=400, detail="data_ids must be a non-empty array")
        
        # Generate visualization data using the visualization service
        from visualization_service import VisualizationRequest
        viz_request = VisualizationRequest(
            data_ids=data_ids,
            visualization_type=visualization_type,
            n_clusters=n_clusters,
            include_analytics=include_analytics
        )
        result = await visualization_service.generate_visualization_data(viz_request)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/visualize/health")
async def visualization_health():
    """
    Check visualization service health
    """
    try:
        stats = await visualization_service.get_stats()
        return {"status": "healthy", "stats": stats}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# ===== PRIVACY SERVICE ENDPOINTS =====

@app.post("/anonymize")
async def anonymize_text(request: dict):
    """
    Anonymize a single text using the privacy service
    """
    try:
        print(f"🔍 Received anonymize request: {request}")
        text = request.get("text", "")
        privacy_level = request.get("privacy_level", "standard")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        print(f"📝 Processing text: {text[:100]}...")
        sanitized_text, privacy_score, entities_found, processing_time = privacy_service.sanitize_text(
            text=text,
            privacy_level=privacy_level,
            preserve_format=True
        )
        
        result = {
            "sanitized_text": sanitized_text,
            "privacy_score": privacy_score,
            "entities_found": entities_found,
            "processing_time_ms": processing_time,
            "privacy_level": privacy_level
        }
        
        print(f"✅ Returning result: {result}")
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-anonymize")
async def batch_anonymize_text(request: dict):
    """
    Batch anonymize multiple texts using the privacy service
    """
    try:
        texts = request.get("texts", [])
        privacy_level = request.get("privacy_level", "standard")
        
        if not texts or not isinstance(texts, list):
            raise HTTPException(status_code=400, detail="Texts array is required")
        
        results = []
        for text in texts:
            try:
                sanitized_text, privacy_score, entities_found, processing_time = privacy_service.sanitize_text(
                    text=text,
                    privacy_level=privacy_level,
                    preserve_format=True
                )
                results.append({
                    "sanitized_text": sanitized_text,
                    "privacy_score": privacy_score,
                    "entities_found": entities_found,
                    "processing_time_ms": processing_time,
                    "privacy_level": privacy_level
                })
            except Exception as e:
                results.append({
                    "sanitized_text": text,  # Fallback to original text
                    "privacy_score": 0.0,
                    "entities_found": [],
                    "processing_time_ms": 0,
                    "privacy_level": privacy_level,
                    "error": str(e)
                })
        return {"results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/privacy/health")
async def privacy_health():
    """
    Check privacy service health
    """
    try:
        stats = await privacy_service.get_stats()
        return {"status": "healthy", "stats": stats}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {
        "status": "healthy",
        "service": "pellucid-labeling-api",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "privacy": "/anonymize",
            "visualization": "/visualize", 
            "chatbot": "/chat",
            "embeddings": "/embed"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)