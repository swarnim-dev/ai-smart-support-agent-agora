import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

