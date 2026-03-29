import { useState, useEffect, useCallback } from 'react';

export function useActivityFeed(token) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5005/api/dashboard/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.activities) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Activity fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    
    fetchActivity();
    
    // Refresh periodically for the live feel
    const interval = setInterval(() => {
      if (isMounted) fetchActivity();
    }, 15000); // 15s refresh
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchActivity]);

  return { activities, loading };
}
