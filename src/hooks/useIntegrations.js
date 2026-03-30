import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useIntegrations() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [integrations, setIntegrations] = useState({
    slack: false,
    github: false,
    postgres: false,
    gmail: false
  });
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5005/api/dashboard/integrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Integrations fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const toggleConnection = async (integrationId) => {
    try {
      const response = await fetch('http://localhost:5005/api/dashboard/integrations/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ integrationId })
      });
      
      const data = await response.json();
      if (data.success) {
        setIntegrations(data.integrations);
        const action = data.integrations[integrationId] ? 'Connected' : 'Disconnected';
        addToast(`${integrationId.toUpperCase()} successfully ${action}!`, 'success');
      }
    } catch (error) {
      console.error('Toggle failed:', error);
      addToast('Critical platform communication error.', 'error');
    }
  };

  return { integrations, toggleConnection, loading };
}
