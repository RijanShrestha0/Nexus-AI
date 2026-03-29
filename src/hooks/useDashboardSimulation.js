import { useState, useEffect } from 'react';

export function useDashboardSimulation() {
  const [tasks, setTasks] = useState(24592);
  const [bars, setBars] = useState([40, 70, 50, 90, 60]);

  useEffect(() => {
    const taskInterval = setInterval(() => {
      setTasks(prev => prev + Math.floor(Math.random() * 3));
    }, 2500);

    const barInterval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 60) + 30));
    }, 3000);

    return () => {
      clearInterval(taskInterval);
      clearInterval(barInterval);
    };
  }, []);

  return { tasks, bars };
}
