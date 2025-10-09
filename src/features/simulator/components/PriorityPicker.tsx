import React from 'react';
import { useSimulator } from '../state/useSimulator';
import type { ResourceKind } from '../domain/types';
import { KIND_LABELS } from '../domain/constants';

type Props = {
  value: ResourceKind[];
  onChange: (order: ResourceKind[]) => void;
};

export const PriorityPicker: React.FC<Props> = ({ value, onChange }) => {
  const { state } = useSimulator();

  // Recursos "disponibles" son los que el usuario definió con cantidad >= 1
  const availableKinds: ResourceKind[] = state.resources
    .filter(r => r.amount > 0)
    .map(r => r.kind);

  const [selected, setSelected] = React.useState<ResourceKind | ''>('');

  const remaining = availableKinds.filter(k => !value.includes(k));
  const allChosen = remaining.length === 0;

  const add = () => {
    if (!selected) return;
    if (value.includes(selected)) return;
    onChange([...value, selected]);
    setSelected('');
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  const clear = () => onChange([]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>Agregar al orden:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as ResourceKind)}
        >
          <option value="">Selecciona un recurso…</option>
          {remaining.map(k => (
            <option key={k} value={k}>{KIND_LABELS[k]}</option>
          ))}
        </select>
        <button onClick={add} disabled={!selected}>Añadir</button>
        <button onClick={clear} disabled={value.length === 0}>Limpiar</button>
      </div>

      <div>
        <div style={{ marginBottom: 6, fontWeight: 600 }}>
          Orden de prioridad ({value.length}/{availableKinds.length})
        </div>

        {value.length === 0 ? (
          <small style={{ color: '#6b7280' }}>
            Aún no has añadido recursos. Debes incluir todos los recursos disponibles sin repetir.
          </small>
        ) : (
          <ol style={{ display: 'grid', gap: 8, paddingLeft: 18 }}>
            {value.map((k, i) => (
              <li key={`${k}_${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8, minWidth: 180
                }}>
                  {i + 1}. {KIND_LABELS[k]}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
                  <button onClick={() => move(i, +1)} disabled={i === value.length - 1} aria-label="Bajar">↓</button>
                  <button onClick={() => removeAt(i)} aria-label="Quitar">x</button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {allChosen ? (
        <div style={{ fontSize: 12, color: '#16a34a' }}>
          ¡Listo! Ya priorizaste todos los recursos disponibles.
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#f59e0b' }}>
          Te faltan por agregar: {remaining.map(k => KIND_LABELS[k]).join(', ') || '—'}
        </div>
      )}
    </div>
  );
};