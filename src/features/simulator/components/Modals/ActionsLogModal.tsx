import React from 'react';
import { Modal } from '../../../../ui/Modal';
import type { ActionLog } from '../../engine/session';

type LogKind =
  | 'grant'
  | 'wait'
  | 'finish'
  | 'deadlock'
  | 'abort'
  | 'prevention'
  | 'info';

function classify(msg: string): LogKind {
  const m = msg.toLowerCase().trim();

  // Usamos prefijos estables que ya generamos desde session.ts:
  // "Grant: ...", "Wait: ...", "Finish: ...", "Deadlock: ...", "Abort: ...", "Info: ..."
  if (m.startsWith('grant:')) return 'grant';
  if (m.startsWith('wait:')) return 'wait';
  if (m.startsWith('finish:')) return 'finish';
  if (m.startsWith('deadlock:')) return 'deadlock';
  if (m.startsWith('abort:')) return 'abort';

  // Mensajes de prevencion (cuando apliquen en paso 4)
  if (m.includes('deadlock prevenido') || m.startsWith('prevention:')) return 'prevention';

  return 'info';
}

const Badge: React.FC<{ kind: LogKind }> = ({ kind }) => {
  const label: Record<LogKind, string> = {
    grant: 'Concedido',
    wait: 'Espera',
    finish: 'Finaliza',
    deadlock: 'Deadlock',
    abort: 'Abortado',
    prevention: 'Prevención',
    info: 'Info',
  };
  return <span className={`log-badge log-badge--${kind}`}>{label[kind]}</span>;
};

export const ActionsLogModal: React.FC<{
  open: boolean;
  onClose: () => void;
  logs: ActionLog[];
}> = ({ open, onClose, logs }) => {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Flujo de acciones">
      <div className="log-box">
        <ul className="log-list">
          {logs.map((l, i) => {
            const k = classify(l.msg);
            return (
              <li key={i} className="log-item">
                <code className="log-time">[{l.t}]</code>
                <Badge kind={k} />
                <span className="log-msg">{l.msg}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
};
