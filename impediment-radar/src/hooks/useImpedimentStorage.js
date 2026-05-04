import { useState, useEffect, useCallback } from 'react';

const KEY = 'radar_impediments';

export function useImpedimentStorage() {
  const [impediments, setImpediments] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setImpediments(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((list) => {
    localStorage.setItem(KEY, JSON.stringify(list));
    setImpediments(list);
  }, []);

  const upsert = useCallback((item) => {
    setImpediments(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      const updated = idx >= 0
        ? prev.map(i => i.id === item.id ? item : i)
        : [...prev, item];
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const remove = useCallback((id) => {
    setImpediments(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  function getOpenFromSprint(sprintNumber) {
    return impediments.filter(
      i => i.sprintNumber === sprintNumber && (i.status === 'offen' || i.status === 'in-arbeit')
    );
  }

  function getForSprint(sprintNumber) {
    return impediments.filter(i => i.sprintNumber === sprintNumber);
  }

  function getAllSprints() {
    const nums = [...new Set(impediments.map(i => i.sprintNumber))].sort((a, b) => a - b);
    return nums;
  }

  return { impediments, upsert, remove, save, getOpenFromSprint, getForSprint, getAllSprints };
}
