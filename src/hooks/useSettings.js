import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useSettings() {
  const { token, user, setUser, setToken } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update both local storage and context
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('nexus_token', data.token);
        }
        addToast('Settings updated successfully!', 'success');
        return true;
      } else {
        addToast(data.error || 'Failed to update settings.', 'error');
        return false;
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      addToast('Critical connection error to Nexus API.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, setUser, setToken, addToast]);

  return {
    updateProfile,
    loading,
    user
  };
}
