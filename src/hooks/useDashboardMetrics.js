import { useState, useEffect } from 'react';

export function useDashboardMetrics(token) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch('http://localhost:5005/api/dashboard/metrics', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to securely fetch dashboard metrics');
      return res.json();
    })
    .then(data => {
      if (isMounted && data.metrics) {
        setMetrics(data.metrics);
        setLoading(false);
      }
    })
    .catch(err => {
      if (isMounted) {
        console.error("Metrics API Error:", err);
        setError(err.message);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return { metrics, loading, error };
}
