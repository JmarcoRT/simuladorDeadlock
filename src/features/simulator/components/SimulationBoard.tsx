import React from 'react';
import type { ProcRuntime, Session } from '../engine/session';
import { KIND_LABELS } from '../domain/constants';

function StatusBadge({ state }: { state: ProcRuntime['state'] }) {
  const map: Record<ProcRuntime['state'], { bg: string; txt: string; label: string }> = {
    ready:   { bg: 'var(--badge-ready-bg)', txt: 'var(--badge-ready-text)', label: 'ready' },
    waiting: { bg: 'var(--badge-wait-bg)',  txt: 'var(--badge-wait-text)',  label: 'waiting' },
    done:    { bg: 'var(--badge-done-bg)',  txt: 'var(--badge-done-text)',  label: 'done' },
  };
  const m = map[state];
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 12,
      background: m.bg,
      color: m.txt,
      border: '1px solid transparent'
    }}>{m.label}</span>
  );
}

function Pill({ label, state }: { label: string; state: 'granted' | 'waiting' | 'pending' }) {
  const styles: Record<typeof state, React.CSSProperties> = {
    granted: { background: 'var(--pill-success-bg)', borderColor: 'var(--pill-success-border)', color: 'var(--pill-success-text)' },
    waiting: { background: 'var(--pill-warn-bg)',    borderColor: 'var(--pill-warn-border)',    color: 'var(--pill-warn-text)' },
    pending: { background: 'var(--pill-pending-bg)', borderColor: 'var(--pill-pending-border)', color: 'var(--pill-pending-text)' },
  };
  return (
    <div style={{
      padding: '8px 10px',
      borderRadius: 10,
      border: '1px solid',
      ...styles[state],
      minWidth: 110,
      textAlign: 'center'
    }}>{label}</div>
  );
}

const ProcRow: React.FC<{ p: ProcRuntime }> = ({ p }) => {
  const waiting = p.state === 'waiting';
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 12,
      background: 'var(--bg-panel)',
      outline: waiting ? `2px solid var(--proc-wait-outline)` : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>{p.name}</div>
        <StatusBadge state={p.state} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {p.order.map((k, idx) => {
          const granted = idx < p.ptr;
          const isCurrent = idx === p.ptr;
          const state: 'granted'|'waiting'|'pending' =
            granted ? 'granted' : (isCurrent && p.state === 'waiting' ? 'waiting' : 'pending');
          return <Pill key={`${p.id}_${idx}`} label={KIND_LABELS[k]} state={state} />;
        })}
      </div>
    </div>
  );
};

export const SimulationBoard: React.FC<{ session: Session; running?: boolean }> = ({ session, running }) => {
  const globalStatus = session.deadlock ? 'Deadlock (pausado)' : (running ? 'Running' : 'Paused');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ fontSize: 12, color: session.deadlock ? '#dc2626' : '#6b7280' }}>
        Estado: {globalStatus} · Tick: {session.t}
      </div>
      {session.procs.map(p => (
        <ProcRow key={p.id} p={p} />
      ))}
      <div style={{ fontSize: 12, color: '#6b7280' }}>
        Disponibles: {Object.entries(session.available).map(([k, v]) => `${KIND_LABELS[k as keyof typeof KIND_LABELS]}=${v}`).join(' · ')}
      </div>
    </div>
  );
};
