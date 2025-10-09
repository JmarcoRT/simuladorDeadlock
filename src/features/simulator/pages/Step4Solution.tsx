import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { useSimulator } from '../../simulator/state/useSimulator';

import { initSession, step, abortProcess } from '../engine/session';
import type { Session } from '../engine/session';

import { SpeedControl } from '../components/SpeedControl';
import { SimulationBoard } from '../components/SimulationBoard';
import { useInterval } from '../../../hooks/useInterval';
import { ActionsLogModal } from '../components/Modals/ActionsLogModal';
import { GraphModal } from '../components/Modals/GraphModal';
import { MatricesModal } from '../components/Modals/MatricesModal';
import { SummaryModal } from '../components/Modals/SummaryModal';
import { ReleaseProcessModal } from '../components/Modals/ReleaseProcessModal';

export const Step4Solution: React.FC = () => {
  const nav = useNavigate();
  const { state, dispatch } = useSimulator();        

  const [session, setSession] = React.useState<Session>(() => initSession(state));
  const [running, setRunning] = React.useState(true);

  const [openLog, setOpenLog] = React.useState(false);
  const [openGraph, setOpenGraph] = React.useState(false);
  const [openMatrices, setOpenMatrices] = React.useState(false);
  const [openSummary, setOpenSummary] = React.useState(false);
  const [openRelease, setOpenRelease] = React.useState(false);

  React.useEffect(() => {
    setSession(initSession(state));
    setRunning(true);
  }, [state]);

  useInterval(() => {
    setSession((prev) => step(prev));
  }, running ? state.speedMs : null);

  const allDone = session.procs.every(p => p.state === 'done');

  const onFinish = () => {
    setOpenSummary(true);
    setRunning(false);
  };

  const onExitToStart = () => {
    dispatch({ type: 'CLEAR_ALGORITHM' });          
    setOpenSummary(false);
    nav('/step/1');
  };

  // Para DETECTION: abortar proceso manualmente (con modal) cuando hay deadlock
  const canAbort = session.algorithm === 'DETECTION' && session.deadlock;

  const onConfirmAbort = (procId: string) => {
    setSession(prev => abortProcess(prev, procId));
    setOpenRelease(false);
    setRunning(true);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Visualizar solución</h2>

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

      <Card title="Ejecución">
        <SimulationBoard session={session} running={running} />
      </Card>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={() => setOpenLog(true)}>Ver flujo de acciones</Button>
        <Button variant="outline" onClick={() => setOpenGraph(true)}>Ver grafo de asignación</Button>
        {session.algorithm === 'AVOIDANCE' && (
          <Button variant="outline" onClick={() => setOpenMatrices(true)}>Ver matrices</Button>
        )}
        {canAbort && (
          <Button variant="outline" onClick={() => setOpenRelease(true)}>Abortar proceso…</Button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Button variant="outline" onClick={() => nav('/step/3')}>← Atrás</Button>
        <Button onClick={onFinish} disabled={!allDone}>Terminar</Button>
      </div>

      {/* Modales */}
      <ActionsLogModal open={openLog} onClose={() => setOpenLog(false)} logs={session.logs} />
      <GraphModal open={openGraph} onClose={() => setOpenGraph(false)} session={session} />
      <MatricesModal open={openMatrices} onClose={() => setOpenMatrices(false)} session={session} />
      <SummaryModal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        session={session}
        scenario={state}
        onExitToStart={onExitToStart}
      />
      <ReleaseProcessModal
        open={openRelease}
        onClose={() => setOpenRelease(false)}
        session={session}
        onConfirm={onConfirmAbort}
      />
    </div>
  );
};
