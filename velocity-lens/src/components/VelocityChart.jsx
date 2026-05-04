import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { EVENT_TYPES } from '../data/eventTypes.js';

function EventTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded p-3 text-xs shadow-lg max-w-xs"
         style={{ background: '#fff', border: '1px solid var(--rule)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--ink)' }}>Sprint {d.sprintNumber}</p>
      <p style={{ color: 'var(--green-dark)' }}>Committed: {d.committed} SP</p>
      <p style={{ color: 'var(--ink-soft)' }}>Delivered: {d.delivered} SP</p>
      {d.events?.length > 0 && (
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--rule)' }}>
          {d.events.map((e, i) => (
            <p key={i} style={{ color: 'var(--ink-soft)' }}>
              [{EVENT_TYPES[e.type]?.label ?? e.type}] {e.description}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function EventDot(props) {
  const { cx, cy, payload } = props;
  if (!payload?.events?.length) return null;
  return <circle cx={cx} cy={cy} r={5} fill="var(--amber)" stroke="#fff" strokeWidth={2} />;
}

export function VelocityChart({ sprints }) {
  if (sprints.length < 2) {
    return (
      <div className="py-8 text-center p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
          Chart ab 2 gespeicherten Sprints verfügbar.
        </p>
      </div>
    );
  }

  const data = sprints.map(s => ({
    sprintNumber: s.sprintNumber,
    name: `S${s.sprintNumber}`,
    committed: Number(s.velocity.committed) || null,
    delivered: Number(s.velocity.delivered) || null,
    events: s.events
  }));

  return (
    <div className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
      <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: 'var(--ink-faint)' }}>
        <span className="flex items-center gap-1">
          <span style={{ display: 'inline-block', width: 24, height: 2, background: 'var(--green-dark)' }} /> Committed
        </span>
        <span className="flex items-center gap-1">
          <span style={{ display: 'inline-block', width: 24, height: 2, background: 'var(--ink-faint)', borderTop: '2px dashed var(--ink-faint)' }} /> Delivered
        </span>
        <span className="flex items-center gap-1">
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)' }} /> Ereignis
        </span>
        <span className="ml-auto" style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>Kein Zielwert — kein Team-Vergleich</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="var(--rule)" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} />
          <Tooltip content={<EventTooltip />} />
          <Line type="monotone" dataKey="committed" stroke="var(--green-dark)"
                strokeWidth={2} dot={<EventDot />} activeDot={{ r: 5 }} connectNulls />
          <Line type="monotone" dataKey="delivered" stroke="var(--ink-faint)"
                strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
