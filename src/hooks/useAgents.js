import { useState, useEffect, useCallback } from 'react';

export function useAgents(token) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:5005/api/dashboard/agents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setAgents(data.agents || []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Agents fetch error:", err);
      setLoading(false);
    });
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    
    fetchAgents();
    
    const interval = setInterval(() => {
      if (isMounted) fetchAgents();
    }, 8000); // Pulse every 8s for live activity
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchAgents]);

  const createAgent = async (name, type, config) => {
    try {
      const res = await fetch('http://localhost:5005/api/dashboard/agents', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, type, config })
      });
      if (res.ok) {
        await fetchAgents();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const deleteAgent = async (id) => {
    try {
      const res = await fetch(`http://localhost:5005/api/dashboard/agents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAgents(prev => prev.filter(a => a.id !== id));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const getAgentDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5005/api/dashboard/agents/${id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return { agents, loading, createAgent, deleteAgent, getAgentDetails, fetchAgents };
}
