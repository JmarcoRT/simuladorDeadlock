import React from 'react';

export const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <section
      className="panel"
      style={{
        borderRadius: 12,
        padding: 16,
      }}
    >
      {title && <h3 style={{ margin: 0, marginBottom: 12 }}>{title}</h3>}
      {children}
    </section>
  );
};