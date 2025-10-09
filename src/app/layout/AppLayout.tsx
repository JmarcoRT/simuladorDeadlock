import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Stepper } from './Stepper';

export const AppLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: '56px 1fr',
        background: 'var(--bg-app)',
        isolation: 'isolate',
      }}
    >
      <Header />
      <div style={{ display: 'grid', gridTemplateColumns: '240px 300px 1fr', gap: 16, padding: 16 }}>
        <aside className="panel" style={{ borderRadius: 12, padding: 16 }}>
          <Sidebar />
        </aside>
        <nav className="panel" style={{ borderRadius: 12, padding: 0 }}>
          <Stepper />
        </nav>
        <main className="panel" style={{ borderRadius: 12, padding: 24 }}>
          {/* <<< Nuevo contenedor que limita el ancho de las cards >>> */}
          <div className="content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};