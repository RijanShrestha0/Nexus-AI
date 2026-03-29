import { useState, useEffect, useCallback } from 'react';

export function useAgents(token) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(() => {
    if (!token) return;
    fetch('http://localhost:5005/api/dashboard/agents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setAgents(data.agents || []);
      setLoading(false);
    })
    .catch(console.error);
  }, [token]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (name) => {
    const res = await fetch('http://localhost:5005/api/dashboard/agents', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, type: 'bot' })
    });
    if (res.ok) {
      await fetchAgents();
    }
  };

  const deleteAgent = async (id) => {
    const res = await fetch(`http://localhost:5005/api/dashboard/agents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setAgents(agents.filter(a => a.id !== id));
    }
  };

  return { agents, loading, createAgent, deleteAgent, fetchAgents };
}
