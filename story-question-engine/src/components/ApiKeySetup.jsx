import { useState } from 'react';

const STORAGE_KEY = 'toolkit_api_key';

export function ApiKeySetup() {
  const envKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;
  const [localKey, setLocalKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showLimitSteps, setShowLimitSteps] = useState(false);

  const hasKey = envKey || !!localKey;

  function save() {
    const trimmed = input.trim();
    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setLocalKey(trimmed);
    setInput('');
    setOpen(false);
  }

  function clear() {
    sessionStorage.removeItem(STORAGE_KEY);
    setLocalKey('');
    setOpen(false);
  }

  if (envKey) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs py-1 px-3 rounded"
        style={{
          border: `1px solid ${hasKey ? 'var(--green-mid)' : 'var(--amber)'}`,
          color: hasKey ? 'var(--green-dark)' : 'var(--amber)',
          background: hasKey ? 'var(--green-light)' : 'var(--amber-light)'
        }}
      >
        {hasKey ? 'API-Key ✓' : 'API-Key einrichten'}
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
             style={{ background: 'rgba(26,23,20,0.5)' }}>
          <div className="rounded-lg max-w-md w-full p-6 shadow-xl overflow-y-auto"
               style={{ background: '#fff', border: '1px solid var(--rule)', maxHeight: '90vh' }}>
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--ink)' }}>
              API-Key einrichten
            </h3>

            <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
              Für die KI-Features braucht das Tool einen API-Key von Anthropic ({' '}
              <span style={{ fontFamily: 'var(--mono)' }}>console.anthropic.com</span> → API Keys).
            </p>

            {/* Worst-case */}
            <div className="p-3 rounded mb-3 text-xs" style={{ background: 'var(--red-light)', border: '1px solid var(--red-dark)' }}>
              <p className="font-medium mb-1" style={{ color: 'var(--red-dark)' }}>Wichtig: Spending Limit setzen — bevor ihr den Key eintragt</p>
              <p style={{ color: 'var(--ink)' }}>
                Ein gestohlener Key ohne Limit kann in Stunden hunderte Euro Schaden verursachen. Anthropic erstattet das in der Regel nicht. Mit einem Limit von 10 USD ist der maximale Schaden auf 10 USD begrenzt.
              </p>
              <button
                onClick={() => setShowLimitSteps(s => !s)}
                className="mt-2 text-xs underline"
                style={{ color: 'var(--red-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showLimitSteps ? 'Anleitung ausblenden' : 'Wie setze ich ein Spending Limit? →'}
              </button>
              {showLimitSteps && (
                <ol className="mt-2 space-y-1 pl-4 list-decimal" style={{ color: 'var(--ink)' }}>
                  <li>console.anthropic.com öffnen und einloggen</li>
                  <li>Oben rechts: <strong>Settings</strong></li>
                  <li>Im Menü links: <strong>Billing</strong> → <strong>Usage limits</strong></li>
                  <li><strong>Monthly spend limit</strong> eintragen — empfohlen: 10 USD für Teamnutzung</li>
                  <li>Speichern — fertig</li>
                </ol>
              )}
            </div>

            {/* Sicherheitshinweise */}
            <div className="p-3 rounded mb-3 text-xs" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
              <p className="font-medium mb-1" style={{ color: 'var(--amber)' }}>Sicherheitshinweise</p>
              <ul className="space-y-1" style={{ color: 'var(--ink)' }}>
                <li>→ Einen Key pro Team oder Pilot anlegen — nicht einen Key für alle teilen.</li>
                <li>→ Key nur auf persönlichen, nicht auf gemeinsam genutzten Geräten eingeben.</li>
                <li>→ Browser-Extensions können gespeicherte Keys auslesen. Persönliches Browser-Profil verwenden.</li>
                <li>→ Bei Screensharing: DevTools schließen — der Key ist im Network-Tab sichtbar.</li>
                <li>→ Nach Pilotende oder Teamwechsel: Key hier löschen und im Dashboard widerrufen.</li>
              </ul>
            </div>

            {/* Was gesendet wird */}
            <div className="p-3 rounded mb-3 text-xs" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
              <p className="font-medium mb-1" style={{ color: 'var(--green-dark)' }}>Was gesendet wird</p>
              <p style={{ color: 'var(--ink)' }}>
                Nur bei aktivem KI-Button-Klick: Eure Texteingaben gehen als Prompt an die Anthropic API. Kein automatischer Versand. Keine Personennamen eintragen.
              </p>
            </div>

            {/* Session-Hinweis */}
            <div className="p-3 rounded mb-4 text-xs" style={{ background: 'var(--bg)', border: '1px solid var(--rule)' }}>
              <p style={{ color: 'var(--ink-faint)' }}>
                Der Key wird nur für diese Browser-Session gespeichert und beim Schließen des Tabs automatisch gelöscht.
                Notfall-Widerruf: <span style={{ fontFamily: 'var(--mono)' }}>console.anthropic.com</span> → Settings → API Keys → Revoke.
              </p>
            </div>

            {localKey && (
              <div className="mb-3 p-2 rounded text-xs" style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>
                Aktiver Key: {localKey.slice(0, 10)}…{localKey.slice(-4)}
              </div>
            )}

            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.trim().startsWith('sk-') && save()}
              placeholder="sk-ant-api03-..."
              className="w-full rounded p-3 text-sm mb-4"
              style={{ border: '1px solid var(--rule)', outline: 'none', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'var(--mono)' }}
            />

            <div className="flex gap-2">
              {localKey && (
                <button onClick={clear} className="text-xs py-2 px-3 rounded"
                        style={{ border: '1px solid var(--rule)', color: 'var(--ink-faint)', background: '#fff' }}>
                  Key löschen
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => { setInput(''); setOpen(false); setShowLimitSteps(false); }}
                        className="text-xs py-2 px-3 rounded"
                        style={{ border: '1px solid var(--rule)', color: 'var(--ink-faint)', background: '#fff' }}>
                  Abbrechen
                </button>
                <button onClick={save}
                        disabled={!input.trim().startsWith('sk-')}
                        className="text-xs py-2 px-4 rounded font-medium text-white disabled:opacity-40"
                        style={{ background: 'var(--green-dark)' }}>
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
