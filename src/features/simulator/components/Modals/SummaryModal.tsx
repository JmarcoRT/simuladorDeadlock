import React from 'react';
import { Modal } from '../../../../ui/Modal';
import type { Session } from '../../engine/session';
import type { Scenario } from '../../domain/types';
import { getMetrics } from '../../engine/session';

export const SummaryModal: React.FC<{
  open: boolean;
  onClose: () => void;
  session: Session;
  scenario: Scenario;
  onExitToStart: () => void;
}> = ({ open, onClose, session, scenario, onExitToStart }) => {
  if (!open) return null;

  const stats = {
    recursosDefinidos: scenario.resources.reduce((a, r) => a + r.amount, 0),
    procesos: scenario.processes.length,
    deadlocks: session.deadlocksCount,
    algoritmo: session.algorithm ?? '—',
    ticksTranscurridos: session.t,
  };

  const m = getMetrics(session);

  const deadlocksPrevenidos = m.reorderEvents;

  const card: React.CSSProperties = {
    background: 'var(--bg-panel)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    borderRadius: 12,
    padding: 14,
  };

  const kpiItem: React.CSSProperties = {
    display: 'grid',
    gap: 4,
    padding: 12,
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-panel)',
    minWidth: 0,
  };

  const badge: React.CSSProperties = {
    display: 'inline-grid',
    placeItems: 'center',
    height: 28,
    padding: '0 10px',
    borderRadius: 999,
    background: 'var(--bg-muted)',
    border: '1px solid var(--border)',
    fontWeight: 600,
    color: 'var(--text)',
  };

  const rowLabel: React.CSSProperties = { color: 'var(--text-muted)' };
  const rowValue: React.CSSProperties = { textAlign: 'right', color: 'var(--text)', fontWeight: 600 };

  const Bar: React.FC<{ value: number; max?: number; title?: string }> = ({ value, max = Math.max(1, value), title }) => {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
      <div title={title} style={{ width: '100%', height: 8, background: 'var(--bg-muted)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', transition: 'width 200ms ease' }} />
      </div>
    );
  };

  const maxBar = Math.max(1, m.overhead, m.waitEvents, m.reorderEvents, m.deniedUnsafe, m.preemptionsTotal);

  return (
    <Modal open={open} onClose={onClose} title="Resumen de la simulación">
      <div style={{ display: 'grid', gap: 14 }}>
        {/* ENCABEZADO */}
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}>
          <div style={kpiItem}>
            <span style={rowLabel}>Recursos</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{stats.recursosDefinidos}</span>
          </div>
          <div style={kpiItem}>
            <span style={rowLabel}>Procesos</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{stats.procesos}</span>
          </div>
          <div style={kpiItem}>
            <span style={rowLabel}>Algoritmo</span>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{stats.algoritmo}</span>
          </div>
          <div style={kpiItem}>
            <span style={rowLabel}>Deadlocks</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{stats.deadlocks}</span>
          </div>
          <div style={kpiItem}>
            <span style={rowLabel}>Ticks</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{stats.ticksTranscurridos}</span>
          </div>
        </div>

        {/* METRICAS */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ color: 'var(--text)' }}>Métricas y overhead</strong>
            <span style={badge} title="Estimación de trabajo no productivo">
              Overhead: {m.overhead}
            </span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                  <span>Eventos de espera (wait)</span>
                  <strong>{m.waitEvents}</strong>
                </div>
                <Bar value={m.waitEvents} max={maxBar} title="Eventos de espera" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                  <span>Reordenes por prevención</span>
                  <strong>{m.reorderEvents}</strong>
                </div>
                <Bar value={m.reorderEvents} max={maxBar} title="Reordenes por prevención" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                  <span>Denegados por inseguridad (avoidance)</span>
                  <strong>{m.deniedUnsafe}</strong>
                </div>
                <Bar value={m.deniedUnsafe} max={maxBar} title="Solicitudes denegadas por estado inseguro" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                  <span>Preemptions totales</span>
                  <strong>{m.preemptionsTotal}</strong>
                </div>
                <Bar value={m.preemptionsTotal} max={maxBar} title="Preemptions totales" />
              </div>
            </div>

            {/* fila 5 (otros contadores) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, marginTop: 6 }}>
              <div style={{ ...kpiItem, padding: 10 }}>
                <span style={rowLabel}>Abortos manuales (detección)</span>
                <span style={{ ...rowValue, textAlign: 'left' }}>{m.abortosManuales}</span>
              </div>
              <div style={{ ...kpiItem, padding: 10 }}>
                <span style={rowLabel}>Deadlocks prevenidos</span>
                <span style={{ ...rowValue, textAlign: 'left' }}>{deadlocksPrevenidos}</span>
              </div>
              <div style={{ ...kpiItem, padding: 10 }}>
                <span style={rowLabel}>Deadlocks totales</span>
                <span style={{ ...rowValue, textAlign: 'left' }}>{m.deadlocks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button onClick={onExitToStart}>Salir (reiniciar)</button>
          <button onClick={onClose}>Atrás (seguir ajustando)</button>
        </div>
      </div>
    </Modal>
  );
};
