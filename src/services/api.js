import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export default api;
