import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-panel)',
      }}
    >
      {/* Titulo */}
      <h1 className="app-title" style={{ margin: 0 }}>
        Simulador de <span>Deadlocks</span>
      </h1>

      <div style={{ marginLeft: 'auto' }}>
        <ThemeToggle />
      </div>
    </header>
  );
};
