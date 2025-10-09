import React from 'react';
import { useSimulator } from '../state/useSimulator';
import { KIND_LABELS } from '../domain/constants';

type ChipProps = { idx: number; label: string };
const Chip: React.FC<ChipProps> = ({ idx, label }) => (
  <span className="res-chip">
    <span className="res-step" aria-hidden>{idx}</span>
    {label}
  </span>
);

export const ProcessesTable: React.FC = () => {
  const { state, dispatch } = useSimulator();

  const move = (from: number, to: number) => {
    if (to < 0 || to >= state.processes.length) return;
    dispatch({ type: 'MOVE_PROCESS', from, to });
  };

  const remove = (id: string) => {
    dispatch({ type: 'REMOVE_PROCESS', id });
  };

  return (
    <div className="table-wrap table-wrap--boxed">
      <table className="data-table processes-table">
        <thead>
          <tr>
            <th>Proceso</th>
            <th>Recursos (orden de asignación)</th>
            <th className="num num--center prio-col">Prioridad</th>
            <th className="num num--center th-actions">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {state.processes.map((p, i) => (
            <tr key={p.id}>
              <td>{p.name}</td>

              <td>
                <div className="res-flow">
                  {p.allocationOrder.map((k, idx) => (
                    <Chip key={`${p.id}_${idx}`} idx={idx + 1} label={KIND_LABELS[k]} />
                  ))}
                </div>
              </td>

              {/* Prioridad */}
              <td className="num num--center prio-col">
                <span className="priority-badge" title="Prioridad">{i + 1}</span>
              </td>

              {/* Acciones */}
              <td className="num num--end act-col">
                <div className="actions-row">
                  <button
                    className="icon-btn"
                    aria-label="Subir prioridad"
                    title="Subir prioridad"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                  >
                    {/* Up chevron */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <button
                    className="icon-btn"
                    aria-label="Bajar prioridad"
                    title="Bajar prioridad"
                    onClick={() => move(i, i + 1)}
                    disabled={i === state.processes.length - 1}
                  >
                    {/* Down chevron */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 10l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <button
                    className="icon-btn danger"
                    aria-label={`Eliminar ${p.name}`}
                    title="Eliminar proceso"
                    onClick={() => remove(p.id)}
                  >
                    {/* Trash modern */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M7 6h10l-1 14a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 6z"
                            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
