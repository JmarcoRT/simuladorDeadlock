import { useContext } from 'react';
import { SimulatorContext } from './SimulatorContext';

export function useSimulator() {                //permite usar el contexto del simulador
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider');
  return ctx;
}
