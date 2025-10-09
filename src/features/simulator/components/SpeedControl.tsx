import React from 'react';
import { useSimulator } from '../state/useSimulator';

export const SpeedControl: React.FC = () => {
  const { state, dispatch } = useSimulator();
  const set = (v: number) => dispatch({ type: 'SET_SPEED', speedMs: v });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label>Tiempo por acción:</label>
      <input
        type="range"
        min={50}
        max={1000}
        step={50}
        value={state.speedMs}
        onChange={(e) => set(parseInt(e.target.value, 10))}
      />
      <div style={{ width: 70, textAlign: 'right' }}>{state.speedMs} ms</div>
    </div>
  );
};