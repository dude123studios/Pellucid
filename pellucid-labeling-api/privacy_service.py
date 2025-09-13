"""
Advanced Privacy Preservation Service using ML-based NER and deterministic token replacement.

This service provides state-of-the-art privacy preservation using:
1. spaCy NER + regex + heuristics for sensitive data detection
2. Deterministic, keyed pseudonymization for token replacement
3. Format-Preserving Encryption for structured data
4. Optional local LLM disambiguation for ambiguous cases
"""

import os
import json
import hmac
import hashlib
import re
import secrets
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum

import spacy
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
from openai import OpenAI
import numpy as np
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load spaCy model (install with: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spaCy model not found. Install with: python -m spacy download en_core_web_sm")
    nlp = None

class PrivacyLevel(str, Enum):
    MINIMAL = "minimal"
    STANDARD = "standard"
    STRICT = "strict"

class EntityType(str, Enum):
    PERSON = "PERSON"
    EMAIL = "EMAIL"
    PHONE = "PHONE"
    CREDIT_CARD = "CREDIT_CARD"
    SSN = "SSN"
    ADDRESS = "ADDRESS"
    ORGANIZATION = "ORG"
    LOCATION = "GPE"
    DATE = "DATE"
    TIME = "TIME"
    MONEY = "MONEY"
    PERCENT = "PERCENT"

@dataclass
class SensitiveSpan:
    text: str
    start: int
    end: int
    entity_type: EntityType
    confidence: float
    replacement: str

class PrivacyRequest(BaseModel):
    text: str = Field(..., description="Text to anonymize")
    privacy_level: PrivacyLevel = Field(default=PrivacyLevel.STANDARD, description="Privacy level")
    preserve_format: bool = Field(default=True, description="Preserve original format")
    custom_entities: Optional[List[str]] = Field(default=None, description="Custom entity patterns")

class PrivacyResponse(BaseModel):
    sanitized_text: str
    privacy_score: float
    entities_found: List[Dict[str, Any]]
    processing_time_ms: float
    privacy_level: PrivacyLevel

class EmbeddingRequest(BaseModel):
    text: str = Field(..., description="Text to generate embedding for")
    data_id: str = Field(..., description="MongoDB ObjectId of the data object")
    model: str = Field(default="text-embedding-3-small", description="OpenAI embedding model to use")

class EmbeddingResponse(BaseModel):
    data_id: str
    embedding: List[float]
    model: str
    dimensions: int
    processing_time_ms: float
    text_length: int

class PrivacyService:
    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = secret_key or os.getenv("PRIVACY_SECRET_KEY", secrets.token_hex(32))
        self.token_map: Dict[str, str] = {}
        self.load_token_map()
        
        # Compiled regex patterns for different entity types
        self.patterns = {
            EntityType.EMAIL: re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            EntityType.PHONE: re.compile(r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'),
            EntityType.CREDIT_CARD: re.compile(r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b'),
            EntityType.SSN: re.compile(r'\b\d{3}-?\d{2}-?\d{4}\b'),
            EntityType.MONEY: re.compile(r'\$\d+(?:,\d{3})*(?:\.\d{2})?'),
            EntityType.PERCENT: re.compile(r'\b\d+(?:\.\d+)?%\b'),
        }
        
        # Privacy level configurations
        self.privacy_configs = {
            PrivacyLevel.MINIMAL: {
                "entities": [EntityType.EMAIL, EntityType.PHONE, EntityType.CREDIT_CARD, EntityType.SSN],
                "confidence_threshold": 0.8
            },
            PrivacyLevel.STANDARD: {
                "entities": [EntityType.PERSON, EntityType.EMAIL, EntityType.PHONE, EntityType.CREDIT_CARD, 
                           EntityType.SSN, EntityType.ADDRESS, EntityType.ORGANIZATION],
                "confidence_threshold": 0.7
            },
            PrivacyLevel.STRICT: {
                "entities": list(EntityType),
                "confidence_threshold": 0.6
            }
        }

    def load_token_map(self):
        """Load existing token mappings from secure storage"""
        # In production, this would load from encrypted database/vault
        # For demo, we'll use a simple file-based approach
        try:
            with open("token_map.json", "r") as f:
                self.token_map = json.load(f)
        except FileNotFoundError:
            self.token_map = {}

    def save_token_map(self):
        """Save token mappings to secure storage"""
        # In production, this would save to encrypted database/vault
        with open("token_map.json", "w") as f:
            json.dump(self.token_map, f, indent=2)

    def generate_deterministic_token(self, original_text: str, entity_type: EntityType) -> str:
        """Generate deterministic, keyed pseudonym for consistent replacement"""
        # Create HMAC-based deterministic token
        message = f"{entity_type.value}:{original_text.lower()}"
        token = hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()[:8]  # Use first 8 chars for compactness
        
        return f"<{entity_type.value}:{token}>"

    def detect_sensitive_entities(self, text: str, privacy_level: PrivacyLevel) -> List[SensitiveSpan]:
        """Detect sensitive entities using spaCy NER + regex patterns"""
        entities = []
        config = self.privacy_configs[privacy_level]
        
        # 1. Use spaCy NER for named entities
        if nlp:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ in [e.value for e in config["entities"]]:
                    entity_type = EntityType(ent.label_)
                    confidence = 0.9  # spaCy doesn't provide confidence, use high default
                    
                    if confidence >= config["confidence_threshold"]:
                        replacement = self.get_or_create_replacement(ent.text, entity_type)
                        entities.append(SensitiveSpan(
                            text=ent.text,
                            start=ent.start_char,
                            end=ent.end_char,
                            entity_type=entity_type,
                            confidence=confidence,
                            replacement=replacement
                        ))
        
        # 2. Use regex patterns for structured data
        for entity_type, pattern in self.patterns.items():
            if entity_type in config["entities"]:
                for match in pattern.finditer(text):
                    original_text = match.group()
                    replacement = self.get_or_create_replacement(original_text, entity_type)
                    entities.append(SensitiveSpan(
                        text=original_text,
                        start=match.start(),
                        end=match.end(),
                        entity_type=entity_type,
                        confidence=0.95,  # High confidence for regex matches
                        replacement=replacement
                    ))
        
        # 3. Remove overlapping entities (keep highest confidence)
        entities = self._remove_overlapping_entities(entities)
        
        return entities

    def get_or_create_replacement(self, original_text: str, entity_type: EntityType) -> str:
        """Get existing replacement or create new deterministic token"""
        key = f"{entity_type.value}:{original_text.lower()}"
        
        if key not in self.token_map:
            self.token_map[key] = self.generate_deterministic_token(original_text, entity_type)
            self.save_token_map()
        
        return self.token_map[key]

    def _remove_overlapping_entities(self, entities: List[SensitiveSpan]) -> List[SensitiveSpan]:
        """Remove overlapping entities, keeping the one with highest confidence"""
        if not entities:
            return entities
        
        # Sort by start position, then by confidence (descending)
        entities.sort(key=lambda x: (x.start, -x.confidence))
        
        filtered = []
        for entity in entities:
            # Check if this entity overlaps with any already added
            overlaps = False
            for added in filtered:
                if (entity.start < added.end and entity.end > added.start):
                    overlaps = True
                    break
            
            if not overlaps:
                filtered.append(entity)
        
        return filtered

    def apply_format_preserving_encryption(self, text: str, entity_type: EntityType) -> str:
        """Apply format-preserving encryption for structured data"""
        # This is a simplified FPE implementation
        # In production, use a proper FPE library like python-fpe
        
        if entity_type == EntityType.PHONE:
            # Preserve phone number format: (XXX) XXX-XXXX
            digits = re.sub(r'\D', '', text)
            if len(digits) == 10:
                # Simple character substitution preserving format
                encrypted = ''.join([str((int(d) + 3) % 10) for d in digits])
                return f"({encrypted[:3]}) {encrypted[3:6]}-{encrypted[6:]}"
        
        elif entity_type == EntityType.CREDIT_CARD:
            # Preserve credit card format: XXXX-XXXX-XXXX-XXXX
            digits = re.sub(r'\D', '', text)
            if len(digits) >= 13:
                # Simple character substitution
                encrypted = ''.join([str((int(d) + 2) % 10) for d in digits])
                return '-'.join([encrypted[i:i+4] for i in range(0, len(encrypted), 4)])
        
        elif entity_type == EntityType.SSN:
            # Preserve SSN format: XXX-XX-XXXX
            digits = re.sub(r'\D', '', text)
            if len(digits) == 9:
                encrypted = ''.join([str((int(d) + 1) % 10) for d in digits])
                return f"{encrypted[:3]}-{encrypted[3:5]}-{encrypted[5:]}"
        
        # For other types, use deterministic token
        return self.generate_deterministic_token(text, entity_type)

    def sanitize_text(self, text: str, privacy_level: PrivacyLevel = PrivacyLevel.STANDARD, 
                     preserve_format: bool = True) -> Tuple[str, float, List[Dict]]:
        """Main sanitization function"""
        start_time = datetime.now()
        
        # Detect sensitive entities
        entities = self.detect_sensitive_entities(text, privacy_level)
        
        # Sort entities by start position (reverse order for replacement)
        entities.sort(key=lambda x: x.start, reverse=True)
        
        # Apply replacements
        sanitized_text = text
        entities_found = []
        
        for entity in entities:
            # Use FPE for structured data if preserve_format is True
            if preserve_format and entity.entity_type in [EntityType.PHONE, EntityType.CREDIT_CARD, EntityType.SSN]:
                replacement = self.apply_format_preserving_encryption(entity.text, entity.entity_type)
            else:
                replacement = entity.replacement
            
            # Replace in text
            sanitized_text = sanitized_text[:entity.start] + replacement + sanitized_text[entity.end:]
            
            # Track what was replaced
            entities_found.append({
                "original": entity.text,
                "replacement": replacement,
                "entity_type": entity.entity_type.value,
                "confidence": entity.confidence,
                "position": {"start": entity.start, "end": entity.end}
            })
        
        # Calculate privacy score (0-1, higher is more private)
        privacy_score = min(1.0, len(entities) * 0.1 + 0.5)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return sanitized_text, privacy_score, entities_found, processing_time

    async def get_stats(self) -> Dict[str, Any]:
        """Get privacy service statistics"""
        return {
            "total_tokens_mapped": len(self.token_map),
            "privacy_levels_supported": list(PrivacyLevel),
            "entity_types_detected": list(EntityType),
            "spacy_model_loaded": nlp is not None,
            "service_status": "healthy"
        }

class EmbeddingService:
    def __init__(self):
        # Initialize OpenAI client with fallback for missing API key
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.openai_client = OpenAI(api_key=api_key)
        else:
            print("Warning: OPENAI_API_KEY not found. Embedding generation will be disabled.")
            self.openai_client = None
        self.default_model = "text-embedding-3-small"
        self.model_dimensions = {
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
            "text-embedding-ada-002": 1536
        }

    def generate_embedding(self, text: str, model: str = None, data_id: str = None) -> Tuple[List[float], Dict[str, Any]]:
        """Generate embedding for text using OpenAI API"""
        start_time = datetime.now()
        
        if not model:
            model = self.default_model
        
        # Check if OpenAI client is available
        if not self.openai_client:
            # Return random embedding as fallback
            dimensions = self.model_dimensions.get(model, 1536)
            random_embedding = np.random.normal(0, 0.1, dimensions).tolist()
            return random_embedding, {
                "data_id": data_id,
                "model": model,
                "dimensions": dimensions,
                "generated_at": start_time.isoformat(),
                "fallback": True,
                "note": "OpenAI API key not available, using random embedding"
            }
        
        try:
            # Clean and prepare text
            cleaned_text = text.strip()
            if not cleaned_text:
                raise ValueError("Text cannot be empty")
            
            # Generate embedding
            response = self.openai_client.embeddings.create(
                model=model,
                input=cleaned_text,
                encoding_format="float"
            )
            
            embedding = response.data[0].embedding
            dimensions = len(embedding)
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            metadata = {
                "data_id": data_id,
                "model": model,
                "dimensions": dimensions,
                "processing_time_ms": processing_time,
                "text_length": len(cleaned_text),
                "timestamp": datetime.now().isoformat()
            }
            
            return embedding, metadata
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

    def batch_generate_embeddings(self, texts: List[Tuple[str, str]], model: str = None) -> List[Tuple[List[float], Dict[str, Any]]]:
        """Generate embeddings for multiple texts in batch"""
        start_time = datetime.now()
        
        if not model:
            model = self.default_model
        
        # Check if OpenAI client is available
        if not self.openai_client:
            # Return random embeddings as fallback
            dimensions = self.model_dimensions.get(model, 1536)
            results = []
            for text, data_id in texts:
                random_embedding = np.random.normal(0, 0.1, dimensions).tolist()
                results.append((random_embedding, {
                    "data_id": data_id,
                    "model": model,
                    "dimensions": dimensions,
                    "generated_at": start_time.isoformat(),
                    "fallback": True,
                    "note": "OpenAI API key not available, using random embedding"
                }))
            return results
        
        try:
            # Prepare inputs
            inputs = []
            metadata_list = []
            
            for text, data_id in texts:
                cleaned_text = text.strip()
                if cleaned_text:
                    inputs.append(cleaned_text)
                    metadata_list.append({
                        "data_id": data_id,
                        "text_length": len(cleaned_text)
                    })
            
            if not inputs:
                raise ValueError("No valid texts provided")
            
            # Generate embeddings in batch
            response = self.openai_client.embeddings.create(
                model=model,
                input=inputs,
                encoding_format="float"
            )
            
            results = []
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            for i, embedding_data in enumerate(response.data):
                metadata = metadata_list[i].copy()
                metadata.update({
                    "model": model,
                    "dimensions": len(embedding_data.embedding),
                    "processing_time_ms": processing_time / len(inputs),  # Average time per embedding
                    "timestamp": datetime.now().isoformat()
                })
                
                results.append((embedding_data.embedding, metadata))
            
            return results
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Batch embedding generation failed: {str(e)}")

# Initialize the services
privacy_service = PrivacyService()
embedding_service = EmbeddingService()

# FastAPI app
app = FastAPI(
    title="Pellucid Privacy Preservation API",
    description="Advanced ML-based privacy preservation using spaCy NER and deterministic token replacement",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "privacy-preservation",
        "spacy_loaded": nlp is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/anonymize", response_model=PrivacyResponse)
async def anonymize_text(request: PrivacyRequest):
    """Anonymize text using ML-based NER and deterministic token replacement"""
    try:
        sanitized_text, privacy_score, entities_found, processing_time = privacy_service.sanitize_text(
            text=request.text,
            privacy_level=request.privacy_level,
            preserve_format=request.preserve_format
        )
        
        return PrivacyResponse(
            sanitized_text=sanitized_text,
            privacy_score=privacy_score,
            entities_found=entities_found,
            processing_time_ms=processing_time,
            privacy_level=request.privacy_level
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Privacy preservation failed: {str(e)}")

@app.post("/batch-anonymize")
async def batch_anonymize_text(requests: List[PrivacyRequest]):
    """Anonymize multiple texts in batch"""
    results = []
    
    for request in requests:
        try:
            sanitized_text, privacy_score, entities_found, processing_time = privacy_service.sanitize_text(
                text=request.text,
                privacy_level=request.privacy_level,
                preserve_format=request.preserve_format
            )
            
            results.append(PrivacyResponse(
                sanitized_text=sanitized_text,
                privacy_score=privacy_score,
                entities_found=entities_found,
                processing_time_ms=processing_time,
                privacy_level=request.privacy_level
            ))
        
        except Exception as e:
            results.append({
                "error": f"Failed to process: {str(e)}",
                "original_text": request.text
            })
    
    return {"results": results}

@app.get("/entities/detected")
async def get_detected_entities(text: str, privacy_level: PrivacyLevel = PrivacyLevel.STANDARD):
    """Get detected entities without replacement (for debugging)"""
    entities = privacy_service.detect_sensitive_entities(text, privacy_level)
    
    return {
        "text": text,
        "entities": [
            {
                "text": entity.text,
                "entity_type": entity.entity_type.value,
                "confidence": entity.confidence,
                "position": {"start": entity.start, "end": entity.end},
                "replacement": entity.replacement
            }
            for entity in entities
        ],
        "count": len(entities)
    }

@app.get("/stats")
async def get_privacy_stats():
    """Get privacy service statistics"""
    return {
        "total_mappings": len(privacy_service.token_map),
        "spacy_model_loaded": nlp is not None,
        "supported_entities": [e.value for e in EntityType],
        "privacy_levels": [level.value for level in PrivacyLevel],
        "embedding_models": list(embedding_service.model_dimensions.keys()),
        "default_embedding_model": embedding_service.default_model
    }

@app.post("/embed", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for text using OpenAI API"""
    try:
        embedding, metadata = embedding_service.generate_embedding(
            text=request.text,
            model=request.model,
            data_id=request.data_id
        )
        
        return EmbeddingResponse(
            data_id=metadata["data_id"],
            embedding=embedding,
            model=metadata["model"],
            dimensions=metadata["dimensions"],
            processing_time_ms=metadata["processing_time_ms"],
            text_length=metadata["text_length"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

@app.post("/batch-embed")
async def batch_generate_embeddings(requests: List[EmbeddingRequest]):
    """Generate embeddings for multiple texts in batch"""
    try:
        # Prepare texts and data_ids
        texts_with_ids = [(req.text, req.data_id) for req in requests]
        model = requests[0].model if requests else embedding_service.default_model
        
        # Generate embeddings
        results = embedding_service.batch_generate_embeddings(texts_with_ids, model)
        
        # Format responses
        responses = []
        for (embedding, metadata) in results:
            responses.append(EmbeddingResponse(
                data_id=metadata["data_id"],
                embedding=embedding,
                model=metadata["model"],
                dimensions=metadata["dimensions"],
                processing_time_ms=metadata["processing_time_ms"],
                text_length=metadata["text_length"]
            ))
        
        return {"results": responses}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch embedding generation failed: {str(e)}")

@app.get("/embed/models")
async def get_embedding_models():
    """Get available embedding models and their dimensions"""
    return {
        "models": embedding_service.model_dimensions,
        "default_model": embedding_service.default_model,
        "recommended_model": "text-embedding-3-small"  # Cost-effective and high quality
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
