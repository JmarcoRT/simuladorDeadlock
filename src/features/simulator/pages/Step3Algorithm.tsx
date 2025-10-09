import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { useSimulator } from '../../simulator/state/useSimulator';
import type { AlgorithmType, ResourceKind } from '../domain/types';
import { PriorityPicker } from '../components/PriorityPicker';
import { AlgoInfo } from '../components/AlgoInfo';

export const Step3Algorithm: React.FC = () => {
  const nav = useNavigate();
  const { state, dispatch } = useSimulator();

  const setAlgo = (alg: AlgorithmType) => {
    dispatch({ type: 'SET_ALGORITHM', algorithm: alg });
    // Si cambia de algoritmo, limpiamos prioridad de prevencion para evitar estados viejos
    if (alg !== 'PREVENTION') {
      dispatch({ type: 'SET_PREVENTION_PRIORITY', order: [] as ResourceKind[] });
    }
  };

  // Recursos "disponibles" (cantidad >= 1)
  const availableKinds: ResourceKind[] = state.resources
    .filter(r => r.amount > 0)
    .map(r => r.kind);

  const order = state.preventionPriority ?? [];
  const setOrder = (o: ResourceKind[]) =>
    dispatch({ type: 'SET_PREVENTION_PRIORITY', order: o });

  const canContinue =
    state.algorithm === 'PREVENTION'
      ? order.length === availableKinds.length && availableKinds.length > 0
      : Boolean(state.algorithm);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Definir algoritmo de solución</h2>

      <Card>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ minWidth: 100 }}>Algoritmo:</div>
          <select
            value={state.algorithm ?? ''}
            onChange={(e) => setAlgo(e.target.value as AlgorithmType)}
          >
            <option value="" disabled>Selecciona...</option>
            <option value="PREVENTION">Prevención</option>
            <option value="AVOIDANCE">Evitación</option>
            <option value="DETECTION">Detección</option>
          </select>
        </div>
      </Card>

      {state.algorithm === 'PREVENTION' && (
        <Card title="Definir orden de prioridad (Prevención)">
          <PriorityPicker value={order} onChange={setOrder} />
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            El orden define qué recursos tienen prioridad para evitar circular wait.
          </div>
        </Card>
      )}

      {state.algorithm === 'AVOIDANCE' && (
        <Card title="Evitación">
          <AlgoInfo variant="AVOIDANCE" />
        </Card>
      )}

      {state.algorithm === 'DETECTION' && (
        <Card title="Detección">
          <AlgoInfo variant="DETECTION" />
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Button variant="outline" onClick={() => nav('/step/2')}>← Atrás</Button>
        <Button onClick={() => nav('/step/4')} disabled={!canContinue}>Siguiente →</Button>
      </div>
    </div>
  );
};