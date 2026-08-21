import { useState, useEffect, useCallback } from 'react';
import { getPayments, getFailedPayments } from '../services/paymentApi';
import { getOverview, getTrends } from '../services/analyticsApi';

export const usePayments = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [failedPayments, setFailedPayments] = useState([]);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, failedRes, trendsRes] = await Promise.all([
        getOverview(),
        getFailedPayments({ limit: 50 }),
        getTrends()
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (failedRes.success) setFailedPayments(failedRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
    } catch (err) {
      console.error('Error fetching payments analytics:', err);
      setError(err.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    loading,
    overview,
    failedPayments,
    trends,
    error,
    refreshData
  };
};
