import { useState, useEffect, useCallback } from 'react';

const KEY = 'vlens_sprints';

export function useSprintStorage() {
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setSprints(JSON.parse(stored));
    } catch {}
  }, []);

  const upsert = useCallback((sprint) => {
    setSprints(prev => {
      const idx = prev.findIndex(s => s.id === sprint.id);
      const updated = idx >= 0
        ? prev.map(s => s.id === sprint.id ? sprint : s)
        : [...prev, sprint];
      updated.sort((a, b) => a.sprintNumber - b.sprintNumber);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { sprints, upsert };
}
