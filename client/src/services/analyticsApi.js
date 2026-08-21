import api from './api';

export const getOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

export const getRevenueRisk = async () => {
  const response = await api.get('/analytics/revenue-risk');
  return response.data;
};

export const getFailures = async () => {
  const response = await api.get('/analytics/failures');
  return response.data;
};

export const getRecovery = async () => {
  const response = await api.get('/analytics/recovery');
  return response.data;
};

export const getTrends = async () => {
  const response = await api.get('/analytics/trends');
  return response.data;
};
