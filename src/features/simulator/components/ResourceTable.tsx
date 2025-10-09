import React from 'react';
import { useSimulator } from '../state/useSimulator';
import { RESOURCE_CATALOG, KIND_LABELS } from '../domain/constants';
import { clampAmount } from '../domain/validators';

export const ResourceTable: React.FC = () => {
  const { state, dispatch } = useSimulator();
  const qtyByKind = new Map(state.resources.map(r => [r.kind, r.amount]));

  return (
    <>
      <div className="table-wrap table-wrap--hug table-wrap--left table-wrap--contour">
        <table className="data-table data-table--resource">
          {/* control ancho por columna */}
          <colgroup>
            <col style={{ minWidth: 160 }} />  {/* Recurso */}
            <col style={{ minWidth: 120 }} />  {/* Código */}
            <col style={{ minWidth: 320 }} />  {/* Tipo funcional */}
            <col style={{ minWidth: 120 }} />  {/* Cantidad */}
          </colgroup>

          <thead>
            <tr>
              <th>Recurso</th>
              <th>Código</th>
              <th>Tipo funcional</th>
              <th className="num">
                <span className="col-start">Cantidad</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {RESOURCE_CATALOG.map(def => {
              const amount = qtyByKind.get(def.kind) ?? def.min;

              const setAmount = (next: number) => {
                const clamped = clampAmount(def, next);
                dispatch({ type: 'SET_RESOURCE', kind: def.kind, amount: clamped });
              };

              return (
                <tr key={def.kind}>
                  <td>{KIND_LABELS[def.kind]}</td>
                  <td>{def.code}</td>
                  <td>{def.functional}</td>
                  <td className="num">
                    <input
                      aria-label={`Cantidad de ${KIND_LABELS[def.kind]}`}
                      type="number"
                      min={def.min}
                      max={def.max}
                      value={amount}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setAmount(Number.isNaN(v) ? amount : v);
                      }}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setAmount(Number.isNaN(v) ? amount : v);
                      }}
                      style={{ width: 88 }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
        Nota: los valores se limitan automáticamente entre el mínimo y máximo permitidos por cada recurso.
      </div>
    </>
  );
};
