import api from './api';

export const analyzePayment = async (paymentId) => {
  const response = await api.post('/ai/analyze-payment', { paymentId });
  return response.data;
};

export const analyzeFailures = async () => {
  const response = await api.post('/ai/analyze-failures');
  return response.data;
};

export const getDailyReport = async () => {
  const response = await api.get('/ai/daily-report');
  return response.data;
};

export const sendCopilotQuery = async (query) => {
  const response = await api.post('/ai/copilot', { query });
  return response.data;
};
