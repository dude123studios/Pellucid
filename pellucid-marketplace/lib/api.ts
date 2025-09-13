import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
}

export interface Source {
  id: string;
  content: string;
  similarity_score: number;
  metadata: any;
}

export interface ChatRequest {
  message: string;
  dataset_id: string;
  session_id?: string;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  sources: Source[];
  session_id: string;
  timestamp: string;
}

export const chatApi = {
  // Login (mock)
  async login(userId: string) {
    const response = await api.post('/auth/login', { user_id: userId });
    const token = response.data.access_token;
    localStorage.setItem('auth_token', token);
    return token;
  },

  // Get dataset info
  async getDatasetInfo(datasetId: string) {
    const response = await api.get(`/datasets/${datasetId}`);
    return response.data;
  },

  // Send chat message (non-streaming)
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post('/chat', request);
    return response.data;
  },

  // Create EventSource for streaming
  createStreamConnection(request: ChatRequest): EventSource {
    const token = localStorage.getItem('auth_token');
    const url = new URL(`${API_BASE_URL}/chat/stream`);
    
    // Add auth header via URL parameter (EventSource limitation)
    if (token) {
      url.searchParams.set('token', token);
    }
    
    return new EventSource(url.toString());
  }
};
