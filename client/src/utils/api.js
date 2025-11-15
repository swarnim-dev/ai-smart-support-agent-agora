import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const healthApi = axios.create({
  baseURL,
  timeout: 3000,
});

export const checkHealth = async () => {
  try {
    const response = await healthApi.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const startSession = async () => {
  const response = await api.post('/session/start');
  return response.data;
};

export const sendMessage = async (ticketId, text) => {
  const response = await api.post('/messages', { ticketId, text });
  return response.data;
};

export const getMessages = async (ticketId) => {
  const response = await api.get(`/messages/${ticketId}`);
  return response.data;
};

// Voice Agent API functions
export const startVoiceAgent = async (ticketId, userId = null, config = {}) => {
  const response = await api.post('/voice-agent/start', {
    ticketId,
    userId,
    ...config,
  });
  return response.data;
};

export const stopVoiceAgent = async (ticketId) => {
  const response = await api.post('/voice-agent/stop', { ticketId });
  return response.data;
};

export const getVoiceAgentStatus = async (ticketId) => {
  const response = await api.get(`/voice-agent/status?ticketId=${ticketId}`);
  return response.data;
};

export const listVoiceAgents = async () => {
  const response = await api.get('/voice-agent/list');
  return response.data;
};

