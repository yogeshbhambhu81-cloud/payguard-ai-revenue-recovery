import api from './api';

export const createPaymentLink = async (paymentId) => {
  const response = await api.post('/recovery/payment-link', { paymentId });
  return response.data;
};

export const getRecoveryActions = async () => {
  const response = await api.get('/recovery');
  return response.data;
};

export const getRecoveryActionById = async (id) => {
  const response = await api.get(`/recovery/${id}`);
  return response.data;
};

export const triggerSeedData = async () => {
  const response = await api.post('/demo/seed');
  return response.data;
};
