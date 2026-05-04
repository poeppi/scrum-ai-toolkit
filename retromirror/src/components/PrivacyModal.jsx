export function PrivacyModal({ onAccept }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
         style={{ background: 'rgba(26,23,20,0.6)' }}>
      <div className="rounded-lg max-w-md w-full p-6 shadow-xl"
           style={{ background: '#fff', border: '1px solid var(--rule)' }}>
        <h2 className="font-semibold text-lg mb-1" style={{ color: 'var(--ink)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Bevor ihr startet
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
          RetroMirror speichert Daten ausschließlich lokal in eurem Browser.
        </p>
        <ul className="text-sm space-y-2 mb-4" style={{ color: 'var(--ink-soft)' }}>
          <li>→ Alle Daten bleiben auf diesem Gerät (localStorage)</li>
          <li>→ Kein Personenbezug wird gespeichert oder exportiert</li>
          <li>→ API-Aufrufe gehen anonymisiert an die Claude API</li>
          <li>→ Kein Management-Export vorgesehen</li>
        </ul>
        <p className="text-sm mb-4 p-3 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
          Dieses Tool speichert keine Namen und erstellt keine Profile. In kleinen Teams sind Texteingaben trotzdem oft erkennbar — das liegt in der Natur enger Zusammenarbeit, nicht am Tool. Wenn euer Team noch kein hohes gegenseitiges Vertrauen hat, ist ein erfahrener Facilitator der bessere Einstieg.
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--ink-faint)' }}>
          Rechtsgrundlagen: DSGVO Art. 5 · BetrVG §87 Abs. 1 Nr. 6
        </p>
        <button
          onClick={onAccept}
          className="w-full py-2 rounded text-sm font-medium text-white"
          style={{ background: 'var(--green-dark)' }}
        >
          Verstanden — weiter
        </button>
      </div>
    </div>
  );
}
