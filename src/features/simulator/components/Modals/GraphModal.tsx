import React from 'react';
import { Modal } from '../../../../ui/Modal';
import type { Session } from '../../engine/session';
import { buildGraph } from '../graph/buildGraph';
import { GraphView } from '../graph/GraphView';

export const GraphModal: React.FC<{
  open: boolean;
  onClose: () => void;
  session: Session;
}> = ({ open, onClose, session }) => {
  if (!open) return null;

  const data = buildGraph(session);

  return (
    <Modal open={open} onClose={onClose} title="Grafo de asignación">
      {/* Contenedor y scroll vertical */}
      <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 8 }}>
        <GraphView
          data={data}
          shapes={{ process: 'circle', resource: 'rect' }}
          height={560}           
          session={session}
        />
      </div>
    </Modal>
  );
};
