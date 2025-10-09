import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulator } from '../../simulator/state/useSimulator';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ResourceTable } from '../components/ResourceTable';
import { ProcessBuilder } from '../components/ProcessBuilder';
import { ProcessesTable } from '../components/ProcessList';

export const Step1Define: React.FC = () => {
  const nav = useNavigate();
  const { state } = useSimulator();

  const canContinue = state.processes.length > 0;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Definir recursos y procesos</h2>

      <Card title="Recursos disponibles">
        <ResourceTable />
      </Card>

      <Card title="Crear proceso">
        <ProcessBuilder />
      </Card>

      <Card title="Procesos definidos">
        <ProcessesTable />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={() => nav('/step/2')} disabled={!canContinue}>
          Siguiente →
        </Button>
      </div>
    </div>
  );
};