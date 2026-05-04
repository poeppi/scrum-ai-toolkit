import { useState, useEffect, useCallback } from 'react';

const PREFIX = 'retromirror_sprint_';
const INDEX_KEY = 'retromirror_index';

export function useSprintStorage() {
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    const index = loadIndex();
    const loaded = index.map(id => {
      try {
        return JSON.parse(localStorage.getItem(PREFIX + id));
      } catch {
        return null;
      }
    }).filter(Boolean);
    setSprints(loaded);
  }, []);

  const saveSprint = useCallback((sprint) => {
    localStorage.setItem(PREFIX + sprint.id, JSON.stringify(sprint));
    const index = loadIndex();
    if (!index.includes(sprint.id)) {
      const updated = [...index, sprint.id];
      localStorage.setItem(INDEX_KEY, JSON.stringify(updated));
    }
    setSprints(prev => {
      const exists = prev.findIndex(s => s.id === sprint.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = sprint;
        return copy;
      }
      return [...prev, sprint];
    });
  }, []);

  const deleteSprint = useCallback((id) => {
    localStorage.removeItem(PREFIX + id);
    const index = loadIndex().filter(i => i !== id);
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    setSprints(prev => prev.filter(s => s.id !== id));
  }, []);

  const getLastSprint = useCallback(() => {
    if (sprints.length === 0) return null;
    return sprints[sprints.length - 1];
  }, [sprints]);

  return { sprints, saveSprint, deleteSprint, getLastSprint };
}

function loadIndex() {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY)) ?? [];
  } catch {
    return [];
  }
}
