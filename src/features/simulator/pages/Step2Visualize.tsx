import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { useSimulator } from '../../simulator/state/useSimulator';
import { initSession, step} from '../engine/session';
import type { Session } from '../engine/session';
import { SpeedControl } from '../components/SpeedControl';
import { SimulationBoard } from '../components/SimulationBoard';
import { useInterval } from '../../../hooks/useInterval';
import { ActionsLogModal } from '../components/Modals/ActionsLogModal';
import { GraphModal } from '../components/Modals/GraphModal';

export const Step2Visualize: React.FC = () => {
  const nav = useNavigate();
  const { state } = useSimulator();

  const [session, setSession] = React.useState<Session>(() => initSession(state));
  const [running, setRunning] = React.useState(true);
  const [openLog, setOpenLog] = React.useState(false);
  const [openGraph, setOpenGraph] = React.useState(false);

  // reinicia la sesion si cambian procesos/recursos/velocidad al entrar
  React.useEffect(() => {
    setSession(initSession(state));
    setRunning(true);
  }, [state]);

  // TICK
  useInterval(() => {
    setSession((prev) => {
      const next = step(prev);
      // pausa automatica si hay deadlock
      if (next.deadlock) setRunning(false);
      return next;
    });
  }, running ? state.speedMs : null);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Visualizar deadlocks</h2>

      <Card title="Tiempo por acción">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SpeedControl />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={() => setRunning(r => !r)}>
              {running ? 'Pausar' : 'Reanudar'}
            </Button>
            <Button variant="outline" onClick={() => setSession(initSession(state))}>
              Reiniciar
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Procesos y recursos">
        <SimulationBoard session={session} running={running} />
      </Card>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="outline" onClick={() => setOpenLog(true)}>Ver flujo de acciones</Button>
        <Button variant="outline" onClick={() => setOpenGraph(true)}>Ver grafo de asignación</Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Button variant="outline" onClick={() => nav('/step/1')}>← Atrás</Button>
        <Button onClick={() => nav('/step/3')}>Siguiente →</Button>
      </div>

      <ActionsLogModal open={openLog} onClose={() => setOpenLog(false)} logs={session.logs} />
      <GraphModal open={openGraph} onClose={() => setOpenGraph(false)} session={session} />
    </div>
  );
};