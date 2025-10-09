import React from 'react';

type Row = { key: string; values: (string | number)[] };
type Accent =
  | 'violet' | 'blue' | 'teal' | 'emerald' | 'amber' | 'rose';

export const MatrixCard: React.FC<{
  title: string;
  head: string[];
  rows: Row[];
  note?: string;
  accent?: Accent; // ⬅️ nuevo
}> = ({ title, head, rows, note, accent = 'blue' }) => {
  return (
    <section className={`matrix-card panel matrix-card--accent-${accent}`}>
      <div className="matrix-card__header">
        <h4 className="matrix-card__title">{title}</h4>
        {note ? <div className="matrix-card__note">{note}</div> : null}
      </div>
      <div className="matrix-card__tablewrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="matrix-table__stub"></th>
              {head.map((h) => (
                <th key={h} className="matrix-table__th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="matrix-table__rowhead">{r.key}</td>
                {r.values.map((v, i) => (
                  <td key={i} className="matrix-table__td">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
