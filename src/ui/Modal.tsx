import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
};

export const Modal: React.FC<Props> = ({ open, onClose, title, children, maxWidth = 760 }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay)',          
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <section
        className="panel"                       
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          borderRadius: 12,
          padding: 16,
          color: 'var(--text)',                 
        }}
      >
        {title && (
          <h3 style={{ margin: 0, marginBottom: 12, color: 'var(--text)' }}>
            {title}
          </h3>
        )}
        <div>{children}</div>
      </section>
    </div>
  );
};