import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Item: React.FC<{ to: string; label: string }> = ({ to, label }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        padding: '12px 14px',
        borderRadius: 10,
        textDecoration: 'none',
        color: 'var(--text)',
        background: active ? 'var(--accent-ghost)' : 'transparent',
        border: active ? '1px solid var(--accent)' : '1px solid transparent',
        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      {label}
    </Link>
  );
};

export const Sidebar: React.FC = () => (
  <div style={{ display: 'grid', gap: 8 }}>
    <Item to="/step/1" label="Iniciar simulación" />
    <Item to="/help" label="Ayuda / Instrucciones" />
  </div>
);