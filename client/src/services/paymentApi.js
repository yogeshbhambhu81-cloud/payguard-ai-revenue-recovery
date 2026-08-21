import api from './api';

export const getPayments = async (params) => {
  const response = await api.get('/payments', { params });
  return response.data;
};

export const getFailedPayments = async (params) => {
  const response = await api.get('/payments/failed', { params });
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

export const syncPayments = async () => {
  const response = await api.post('/payments/sync');
  return response.data;
};
