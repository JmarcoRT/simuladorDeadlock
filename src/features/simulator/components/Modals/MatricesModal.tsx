import React from 'react';
import { Modal } from '../../../../ui/Modal';
import { buildMatrices } from '../../engine/algorithms/avoidance';
import type { Session } from '../../engine/session';
import { MatrixCard } from '../matrices/Matrix';

const Chip: React.FC<{ kind: 'safe' | 'danger'; children: React.ReactNode }> = ({ kind, children }) => (
  <span className={`chip ${kind === 'safe' ? 'chip--safe' : 'chip--danger'}`}>{children}</span>
);

export const MatricesModal: React.FC<{
  open: boolean;
  onClose: () => void;
  session: Session;
}> = ({ open, onClose, session }) => {
  if (!open) return null;

  const m = buildMatrices(session);
  const kinds = m.kinds;
  const namesById = Object.fromEntries(session.procs.map((p) => [p.id, p.name]));

  const rowsFromMatrix = (mx: any) =>
    m.procIds.map((pid) => ({ key: namesById[pid] ?? pid, values: kinds.map((k) => mx[pid][k]) }));

  const rowFromVector = (title: string, v: any) => [{ key: title, values: kinds.map((k) => v[k]) }];

  // traza del chequeo 
  const trace = session.avoidanceTrace ?? null;

  return (
    <Modal open={open} onClose={onClose} title="Matrices (Algoritmo del banquero)">
      <div style={{ display: 'grid', gap: 16, maxHeight: '65vh', overflow: 'auto' }}>
        {/* Encabezado compacto de estado */}
        <section className="panel" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 600 }}>Estado:</div>
            {trace ? (
              <>
                {trace.safe ? <Chip kind="safe">Seguro</Chip> : <Chip kind="danger">Inseguro</Chip>}
                <div style={{ opacity: 0.8 }}>
                  {trace.processName} solicitó <b>{trace.requestedKind}</b>
                </div>
                {trace.safe && trace.safeSequence && (
                  <div style={{ opacity: 0.8 }}>
                    Secuencia segura:&nbsp;<b>{trace.safeSequence.map((id) => namesById[id]).join(' → ')}</b>
                  </div>
                )}
                {!trace.safe && trace.reason && <div style={{ opacity: 0.85 }}>{trace.reason}</div>}
              </>
            ) : (
              <div style={{ opacity: 0.8 }}>Aún no se ha evaluado ninguna solicitud en este tick.</div>
            )}
          </div>
        </section>

        {/* Matrices y vectores con estilo */}
        <MatrixCard
          title="Recursos totales"
          head={kinds}
          rows={rowFromVector('Total', m.total)}
          accent="violet"
        />

        <MatrixCard
          title="Disponibles (Available)"
          head={kinds}
          rows={rowFromVector('Available', m.available)}
          accent="blue"
        />

        <MatrixCard
          title="Máximo por proceso (Max)"
          head={kinds}
          rows={rowsFromMatrix(m.max)}
          note="Reclamo máximo derivado del orden de asignación."
          accent="emerald"
        />

        <MatrixCard
          title="En uso (Allocation)"
          head={kinds}
          rows={rowsFromMatrix(m.allocation)}
          accent="amber"
        />

        <MatrixCard
          title="Necesarios (Need = Max − Allocation)"
          head={kinds}
          rows={rowsFromMatrix(m.need)}
          accent="rose"
        />
      </div>
    </Modal>
  );
};
