import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline';
};

export const Button: React.FC<Props> = ({ variant = 'solid', style, ...rest }) => {
  const base: React.CSSProperties = {
    font: 'inherit',
    borderRadius: 10,
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
  };

  const solid: React.CSSProperties = {
    background: 'var(--accent)',
    color: '#fff',
    border: '1px solid var(--accent)',
  };

  const outline: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--text)',        
    border: '1px solid var(--border)',
  };

  return (
    <button
      {...rest}
      style={{ ...base, ...(variant === 'solid' ? solid : outline), ...style }}
    />
  );
};