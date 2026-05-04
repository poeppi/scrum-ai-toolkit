import { useState, useEffect, useCallback } from 'react';

const PREFIX = 'sqe_story_';
const INDEX_KEY = 'sqe_index';

export function useStoryStorage() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const index = loadIndex();
    const loaded = index.map(id => {
      try { return JSON.parse(localStorage.getItem(PREFIX + id)); }
      catch { return null; }
    }).filter(Boolean);
    setStories(loaded);
  }, []);

  const saveStory = useCallback((story) => {
    localStorage.setItem(PREFIX + story.id, JSON.stringify(story));
    const index = loadIndex();
    if (!index.includes(story.id)) {
      localStorage.setItem(INDEX_KEY, JSON.stringify([...index, story.id]));
    }
    setStories(prev => {
      const idx = prev.findIndex(s => s.id === story.id);
      if (idx >= 0) { const c = [...prev]; c[idx] = story; return c; }
      return [...prev, story];
    });
  }, []);

  return { stories, saveStory };
}

function loadIndex() {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY)) ?? []; }
  catch { return []; }
}
