from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from typing import List, Dict, Any, AsyncGenerator
import asyncio
import os
from chatbot_models import RetrievalResult

class RAGAgent:
    def __init__(self):
        # Get OpenAI API key from environment
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if not openai_api_key:
            print("Warning: OPENAI_API_KEY not found. RAG functionality will be limited.")
            self.embeddings = None
            self.llm = None
        else:
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=openai_api_key,
                model="text-embedding-3-small"
            )
            self.llm = ChatOpenAI(
                openai_api_key=openai_api_key,
                model="gpt-4",
                temperature=0.7,
                max_tokens=1000
            )
        
        # RAG prompt template
        self.prompt_template = PromptTemplate(
            input_variables=["context", "question", "dataset_info"],
            template="""
You are a helpful AI assistant that answers questions about a specific dataset of ChatGPT conversations. 
You have access to relevant conversation data from the dataset to provide accurate and helpful responses.

Dataset Information: {dataset_info}

Context from the dataset:
{context}

Question: {question}

Instructions:
1. Answer the question based on the provided context from the dataset
2. Be specific and cite relevant information from the conversations
3. If the context doesn't contain enough information to answer the question, say so
4. Focus on insights, patterns, or specific examples from the dataset
5. Be helpful and informative while staying within the scope of the dataset

Answer:
"""
        )

    async def get_query_embedding(self, query: str) -> List[float]:
        """
        Generate embedding for the user query
        """
        if not self.embeddings:
            # Return random embedding if OpenAI is not available
            import random
            return [random.uniform(-1, 1) for _ in range(1536)]
        
        embedding = await self.embeddings.aembed_query(query)
        return embedding

    async def retrieve_relevant_docs(
        self, 
        query: str, 
        dataset_id: str, 
        limit: int = 10
    ) -> List[RetrievalResult]:
        """
        Retrieve relevant documents using vector search
        """
        # Generate query embedding
        query_embedding = await self.get_query_embedding(query)
        
        # For now, we'll use mock data since we don't have MongoDB Atlas Vector Search set up
        # In production, this would call the database vector search
        from mock_chatbot_data import mock_store
        results = mock_store.vector_search(query_embedding, dataset_id, limit)
        
        # Convert to RetrievalResult objects
        retrieval_results = []
        for result in results:
            retrieval_results.append(RetrievalResult(
                content=result["content"],
                metadata=result["metadata"],
                similarity_score=result["similarity_score"],
                source_id=result["source_id"]
            ))
        
        return retrieval_results

    async def generate_response(
        self, 
        query: str, 
        dataset_id: str, 
        conversation_history: List[Dict[str, str]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response using RAG
        """
        # Get dataset info
        from mock_chatbot_data import mock_store
        dataset_info = mock_store.get_dataset_info(dataset_id)
        dataset_name = dataset_info.get("name", "Unknown Dataset") if dataset_info else "Unknown Dataset"
        
        # Retrieve relevant documents
        retrieved_docs = await self.retrieve_relevant_docs(query, dataset_id)
        
        if not retrieved_docs:
            yield "I couldn't find any relevant information in this dataset to answer your question."
            return
        
        # Format context from retrieved documents
        context_parts = []
        for i, doc in enumerate(retrieved_docs, 1):
            context_parts.append(f"Document {i} (Category: {doc.metadata.get('category', 'Unknown')}):\n{doc.content}\n")
        
        context = "\n".join(context_parts)
        
        # Format conversation history if provided
        history_context = ""
        if conversation_history:
            history_parts = []
            for msg in conversation_history[-5:]:  # Last 5 messages
                role = "User" if msg["role"] == "user" else "Assistant"
                history_parts.append(f"{role}: {msg['content']}")
            history_context = "\n".join(history_parts)
        
        # Create the prompt
        prompt = self.prompt_template.format(
            context=context,
            question=query,
            dataset_info=f"Dataset: {dataset_name}"
        )
        
        # Add conversation history if available
        if history_context:
            prompt += f"\n\nPrevious conversation:\n{history_context}"
        
        # Stream response from LLM
        try:
            if not self.llm:
                # Fallback response if OpenAI is not available
                yield f"Based on the dataset context, I found {len(retrieved_docs)} relevant documents. However, I cannot generate a detailed response without OpenAI API access. The documents contain information about: {', '.join(set(doc.metadata.get('category', 'Unknown') for doc in retrieved_docs))}"
                return
            
            async for chunk in self.llm.astream(prompt):
                if hasattr(chunk, 'content') and chunk.content:
                    yield chunk.content
        except Exception as e:
            yield f"Error generating response: {str(e)}"

    async def get_sources(self, query: str, dataset_id: str) -> List[Dict[str, Any]]:
        """
        Get source documents for a query
        """
        retrieved_docs = await self.retrieve_relevant_docs(query, dataset_id)
        
        sources = []
        for doc in retrieved_docs:
            sources.append({
                "id": doc.source_id,
                "content": doc.content[:200] + "..." if len(doc.content) > 200 else doc.content,
                "similarity_score": doc.similarity_score,
                "metadata": doc.metadata
            })
        
        return sources

# Global RAG agent instance
rag_agent = RAGAgent()
