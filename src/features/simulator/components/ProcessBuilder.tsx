import React from 'react';
import { useSimulator } from '../state/useSimulator';
import { KIND_LABELS } from '../domain/constants';
import type { ResourceKind } from '../domain/types';
import { uid } from '../../../utils/id';

export const ProcessBuilder: React.FC = () => {         //Permite armar el orden de recursos de un proceso y luego crear el proceso.
  const { state, dispatch } = useSimulator();
  const [name, setName] = React.useState(`proceso_${state.processes.length + 1}`);
  const [order, setOrder] = React.useState<ResourceKind[]>([]);
  const [selected, setSelected] = React.useState<ResourceKind>('CPU');

  const availableKinds = state.resources.map(r => r.kind);

  const add = () => setOrder(prev => [...prev, selected]);
  const removeIndex = (idx: number) => setOrder(prev => prev.filter((_, i) => i !== idx));
  const clear = () => setOrder([]);

  const createProcess = () => {
    if (order.length === 0) return;
    dispatch({
      type: 'ADD_PROCESS',
      process: { id: uid('proc'), name, allocationOrder: order },
    });
    setName(`proceso_${state.processes.length + 2}`);
    setOrder([]);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>Nombre:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del proceso" />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>Agregar recurso:</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value as ResourceKind)}>
          {availableKinds.map(k => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
        </select>
        <button onClick={add}>Añadir</button>
        <button onClick={clear}>Limpiar orden</button>
      </div>

      <div>
        <div style={{ marginBottom: 6, fontWeight: 600 }}>Orden de asignación</div>
        {order.length === 0 ? (
          <small style={{ color: '#6b7280' }}>Aún no has añadido recursos al orden.</small>
        ) : (
          <ol style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 18 }}>
            {order.map((k, i) => (
              <li key={`${k}_${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  {i + 1}. {KIND_LABELS[k]}
                </span>
                <button onClick={() => removeIndex(i)} aria-label="Quitar">x</button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div>
        <button onClick={createProcess} disabled={order.length === 0}>Crear proceso</button>
      </div>
    </div>
  );
};