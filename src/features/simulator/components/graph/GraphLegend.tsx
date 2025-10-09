import React from 'react';

export const GraphLegend: React.FC = () => {
  const Item: React.FC<{ colorVar: string; label: string; keyId: string }> = ({ colorVar, label, keyId }) => {
    const markerId = `legend-arrow-${keyId}`;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="40" height="14" style={{ color: `var(${colorVar})` }}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
            </marker>
          </defs>
          <line
            x1="0" y1="7" x2="28" y2="7"
            stroke="currentColor" strokeWidth="2.5"
            markerEnd={`url(#${markerId})`}
          />
        </svg>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        top: 16,
        width: 210,                           
        padding: 12,
        borderRadius: 12,
        background: 'var(--graph-legend-bg)',
        border: '1px solid var(--graph-legend-border)',
        boxShadow: 'var(--shadow)',
        zIndex: 2
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Leyenda</div>
      <div style={{ display: 'grid', gap: 10 }}>
        <Item colorVar="--graph-edge-assign"  label="Asignación (R → P)" keyId="assign" />
        <Item colorVar="--graph-edge-request" label="Solicitud (P → R)" keyId="req" />
        <Item colorVar="--graph-edge-wait"    label="Solicitud en espera" keyId="wait" />
      </div>
    </div>
  );
};
