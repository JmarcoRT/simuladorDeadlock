import React from 'react';
import { SimulatorProvider } from '../../features/simulator/state/SimulatorProvider';

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <SimulatorProvider>
      {children}
    </SimulatorProvider>
  );
};
