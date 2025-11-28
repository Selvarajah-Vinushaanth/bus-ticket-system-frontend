import axios from 'axios';

const API_BASE_URL ='https://bus-ticket-system-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (username, password) => {
  const response = await api.post('/login', { username, password });
  return response.data;
};

export const getRoutes = async () => {
  const response = await api.get('/routes');
  return response.data;
};

export const getRoute = async (routeNumber) => {
  const response = await api.get(`/routes/${routeNumber}`);
  return response.data;
};

export const calculateFare = async (routeNumber, passengerType) => {
  const response = await api.post('/calculate-fare', {
    routeNumber,
    passengerType,
  });
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

export const getTickets = async (conductorId, date) => {
  const params = {};
  if (conductorId) params.conductorId = conductorId;
  if (date) params.date = date;

  const response = await api.get('/tickets', { params });
  return response.data;
};

export const getTicket = async (ticketNumber) => {
  const response = await api.get(`/tickets/${ticketNumber}`);
  return response.data;
};

export const getStatistics = async (conductorId, date) => {
  const params = {};
  if (conductorId) params.conductorId = conductorId;
  if (date) params.date = date;

  const response = await api.get('/statistics', { params });
  return response.data;
};

export const chatQuestion = async (question) => {
  const response = await api.post('/chat', { question });
  return response.data;
};

export const chatConversation = async (messages, conductorId = null, conductorRoute = null) => {
  const response = await api.post('/chat/conversation', { messages, conductorId, conductorRoute });
  return response.data;
};

export const generateTicketAI = async (prompt, conductorId, conductorRoute) => {
  const response = await api.post('/tickets/generate', { prompt, conductorId, conductorRoute });
  return response.data;
};

export const getChatHistory = async (conductorId, limit = 50) => {
  const response = await api.get(`/chat/history/${conductorId}?limit=${limit}`);
  return response.data;
};

export const clearChatHistory = async (conductorId) => {
  const response = await api.delete(`/chat/history/${conductorId}`);
  return response.data;
};

export default api;
