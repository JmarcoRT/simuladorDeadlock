import React from 'react';

const baseStyle: React.CSSProperties = {
  color: 'var(--text-muted)',   
  lineHeight: 1.6,
};
const strongStyle: React.CSSProperties = {
  color: 'var(--text)',        
  fontWeight: 600,
};

export const AlgoInfo: React.FC<{ variant: 'AVOIDANCE' | 'DETECTION' }> = ({ variant }) => {
  if (variant === 'AVOIDANCE') {
    return (
      <div style={baseStyle}>
        El sistema preparará internamente las <strong style={strongStyle}>matrices y vectores</strong> necesarios
        para la simulación de Evitación. No necesitas hacer nada aquí.
      </div>
    );
  }
  // DETECTION
  return (
    <div style={baseStyle}>
      En la siguiente pantalla podrás <strong style={strongStyle}>liberar manualmente</strong> un proceso para
      resolver el deadlock cuando ocurra. Aquí no hay configuración adicional.
    </div>
  );
};
