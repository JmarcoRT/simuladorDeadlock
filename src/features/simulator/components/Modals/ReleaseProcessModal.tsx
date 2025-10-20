import React from 'react';
import { Modal } from '../../../../ui/Modal';
import type { Session } from '../../engine/session';
import { KIND_LABELS } from '../../domain/constants';
import type { ResourceKind } from '../../domain/types';

export const ReleaseProcessModal: React.FC<{
  open: boolean;
  onClose: () => void;
  session: Session;
  onConfirm: (procId: string) => void;
}> = ({ open, onClose, session, onConfirm }) => {
  if (!open) return null;

  const candidates = session.procs.filter(p => p.state !== 'done');

  return (
    <Modal open={open} onClose={onClose} title="Abortar proceso">
      {candidates.length === 0 ? (
        <p>No hay procesos para liberar.</p>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {candidates.map(p => (
            <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Espera actual: {p.order[p.ptr] ? KIND_LABELS[p.order[p.ptr]] : '—'}
                    {' · '}
                    Sostiene: {Object.keys(p.holding).length
                      ? Object.entries(p.holding)
                          .map(([k, v]) => `${KIND_LABELS[k as ResourceKind]}(${v})`)
                          .join(', ')
                      : '—'}
                  </div>
                </div>
                <div>
                    <button onClick={() => onConfirm(p.id)} aria-label={`Abortar ${p.name}`}>
                      Abortar
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};