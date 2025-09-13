from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = datetime.now()

class ChatRequest(BaseModel):
    message: str
    dataset_id: str
    session_id: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    message: str
    sources: List[Dict[str, Any]]
    session_id: str
    timestamp: datetime = datetime.now()

class DatasetAccess(BaseModel):
    user_id: str
    dataset_id: str
    purchased_at: datetime
    expires_at: Optional[datetime] = None

class DataObject(BaseModel):
    _id: str
    dataset_id: str
    content: str
    category: str
    embedding: List[float]
    metadata: Dict[str, Any] = {}
    created_at: datetime

class RetrievalResult(BaseModel):
    content: str
    metadata: Dict[str, Any]
    similarity_score: float
    source_id: str

class LoginRequest(BaseModel):
    user_id: str
