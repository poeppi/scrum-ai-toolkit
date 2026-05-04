import { useState } from 'react';

export function useAnthropicStream() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function stream(systemPrompt, userContent) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || sessionStorage.getItem('toolkit_api_key') || null;
    if (!apiKey) {
      setError('Kein API-Key konfiguriert. Bitte oben rechts "API-Key einrichten" klicken.');
      return;
    }
    setLoading(true); setOutput(''); setError(null);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'messages-2023-12-15'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userContent }]
        })
      });
      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        throw new Error(e.error?.message ?? `API-Fehler: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const p = JSON.parse(data);
            if (p.delta?.text) setOutput(prev => prev + p.delta.text);
          } catch {}
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() { setOutput(''); setError(null); }

  return { output, loading, error, stream, reset };
}
