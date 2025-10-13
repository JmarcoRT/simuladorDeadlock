import {
  initSession,
  step,
  abortProcess,
  getMetrics,
  type Session,
} from '../features/simulator/engine/session';

import type {
  Scenario,
  ProcessDef,
  ResourceKind,
  AlgorithmType,
} from '../features/simulator/domain/types';

/* -----------------------------
   Helpers basicos de construccion
-------------------------------- */

function res(kind: ResourceKind, amount: number) {
  return { kind, amount };
}
function proc(id: string, name: string, allocationOrder: ResourceKind[]): ProcessDef {
  return { id, name, allocationOrder };
}
function scenarioOf(
  resources: { kind: ResourceKind; amount: number }[],
  processes: ProcessDef[],
  algorithm: AlgorithmType | null = null,
  preventionPriority: ResourceKind[] = [],
): Scenario {
  return {
    resources,
    processes,
    algorithm,
    preventionPriority,
    speedMs: 1, 
  } as Scenario;
}

/* -----------------------------
   Runner generico de un escenario
-------------------------------- */

type RunOptions = {
  maxTicks?: number;
  autoAbortOnDeadlock?: boolean; 
};

function runScenario(label: string, sc: Scenario, opts: RunOptions = {}) {
  const { maxTicks = 500, autoAbortOnDeadlock = true } = opts;

  let session: Session = initSession(sc);
  let aborted = 0;

  while (session.t < maxTicks) {
    const beforeT = session.t;
    session = step(session);

    // terminar si todos terminaron
    if (session.procs.every(p => p.state === 'done')) break;

    // deadlock (solo aplica si algorithm === 'DETECTION')
    if (session.deadlock) {
      console.log(`[${label}] DEADLOCK @ tick ${session.t}`);
      if (!autoAbortOnDeadlock) break;

      // elegimos una victima simple: primer proceso no-done
      const victim = session.procs.find(p => p.state !== 'done');
      if (victim) {
        session = abortProcess(session, victim.id);
        aborted += 1;
      } else {
        break;
      }
    }

    // guard quit (no deberia ocurrir)
    if (session.t === beforeT) break;
  }

  const m = getMetrics(session);

  // resumen compacto
  console.log(`\n>>> Resultado: ${label}`);
  console.log(`Algoritmo: ${session.algorithm ?? 'N/A'}`);
  console.log(`Ticks totales: ${session.t}`);
  console.log(`Deadlocks detectados: ${m.deadlocks}`);
  console.log(`Deadlocks prevenidos: ${m.deadlocksPrevenidos}`); // mapea a reordenes
  console.log(`Overhead estimado: ${m.overhead}`);
  console.log(`Procesos abortados/afectados: ${aborted}`);
  console.log(`Esperas (wait): ${m.waitEvents}`);
  console.log(`Reordenes por prevencion: ${m.reorderEvents}`);
  console.log(`Denegados por inseguridad: ${m.deniedUnsafe}`);
  console.log('----------------------------------------\n');
}

/* -----------------------------
   Escenario 1: Ciclo simple (2 procesos, 2 recursos)
   3 pruebas preestablecidas
-------------------------------- */

function suiteSimpleCycle() {
  console.log('\n=== Escenario 1: Ciclo simple (2 procesos, 2 recursos) ===\n');

  // Prueba 1: ciclo clasico que provoca deadlock (Deteccion)
  const sc1 = scenarioOf(
    [res('CPU', 1), res('DISK', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'DISK']),
      proc('p2', 'proceso_2', ['DISK', 'CPU']),
    ],
    'DETECTION',
  );
  runScenario('S1-P1: ciclo clasico (deteccion)', sc1, { autoAbortOnDeadlock: true });

  // Prueba 2: mismo ciclo pero con prevencion
  const sc2 = scenarioOf(
    [res('CPU', 1), res('DISK', 1)],
    [
      proc('p1', 'proceso_1', ['DISK', 'CPU']),
      proc('p2', 'proceso_2', ['CPU', 'DISK']),
    ],
    'PREVENTION',
    ['CPU', 'DISK'], // prioridad/orden global de recursos
  );
  runScenario('S1-P2: variante con prevencion', sc2, { autoAbortOnDeadlock: true });

  // Prueba 3: aumenta la capacidad de DISK a 2 (no deberia haber deadlock)
  const sc3 = scenarioOf(
    [res('CPU', 1), res('DISK', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'DISK']),
      proc('p2', 'proceso_2', ['DISK', 'CPU']),
    ],
    'AVOIDANCE',
  );
  runScenario('S1-P3: variante con evitacion', sc3, { autoAbortOnDeadlock: true });
}

/* -----------------------------
   Escenario 2: Ciclos complejos con multiples recursos
   3 pruebas preestablecidas
-------------------------------- */

function suiteComplexCycle() {
  console.log('\n=== Escenario 2: Ciclos complejos con multiples recursos ===\n');

  // Prueba 1: ciclo de 3 procesos y 3 recursos (Deteccion)
  // p1: CPU -> DISK, p2: DISK -> MUTEX, p3: MUTEX -> CPU  -> ciclo
  const sc1 = scenarioOf(
    [res('CPU', 1), res('DISK', 1), res('MUTEX', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'DISK']),
      proc('p2', 'proceso_2', ['DISK', 'MUTEX']),
      proc('p3', 'proceso_3', ['MUTEX', 'CPU']),
    ],
    'DETECTION',
  );
  runScenario('S2-P1: ciclo 3x3 (deteccion)', sc1, { autoAbortOnDeadlock: true });

  // Prueba 2: misma topologia pero con PREVENTION y prioridad que rompe el ciclo
  // prioridad: CPU < DISK < MUTEX (pedir recursos en este orden)
  const sc2 = scenarioOf(
    [res('CPU', 1), res('DISK', 1), res('MUTEX', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'DISK']),
      proc('p2', 'proceso_2', ['DISK', 'MUTEX']),
      proc('p3', 'proceso_3', ['MUTEX', 'CPU']),
    ],
    'PREVENTION',
    ['CPU', 'DISK', 'MUTEX'],
  );
  runScenario('S2-P2: prevencion por prioridad (prevention)', sc2, { autoAbortOnDeadlock: true });

  // Prueba 3: misma topologia con AVOIDANCE (evita estados inseguros)
  const sc3 = scenarioOf(
    [res('CPU', 1), res('DISK', 1), res('MUTEX', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'DISK']),
      proc('p2', 'proceso_2', ['DISK', 'MUTEX']),
      proc('p3', 'proceso_3', ['MUTEX', 'CPU']),
    ],
    'AVOIDANCE',
  );
  runScenario('S2-P3: evitar estados inseguros (avoidance)', sc3, { autoAbortOnDeadlock: true });
}

/* -----------------------------
   Escenario 3: Recursos escasos bajo alta demanda
   3 pruebas preestablecidas
-------------------------------- */

function suiteScarcity() {
  console.log('\n=== Escenario 3: Escasez bajo alta demanda ===\n');

  // Prueba 1: 4 procesos compiten por CPU y DISK (prevencion)
  const sc1 = scenarioOf(
    [res('CPU', 1), res('DISK', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'DISK']), // A: CPU→DISK
      proc('p2', 'proceso_2', ['DISK', 'CPU']), // B: DISK→CPU  ← ciclo A↔B posible
      proc('p3', 'proceso_3', ['CPU', 'DISK']),
      proc('p4', 'proceso_4', ['DISK', 'CPU']),
    ],
   'PREVENTION',
    ['CPU', 'DISK'],
  );
  runScenario('S3-P1 (revisada): ordenes cruzados (deteccion)', sc1, { autoAbortOnDeadlock: true });

  // Prueba 2: misma carga, se agrega MUTEX al flujo para todos
  const sc2 = scenarioOf(
    [res('CPU', 1), res('DISK', 1), res('MUTEX', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'MUTEX', 'DISK']),   // A: CPU→MUTEX→DISK
      proc('p2', 'proceso_2', ['MUTEX', 'DISK', 'CPU']),   // B: MUTEX→DISK→CPU
      proc('p3', 'proceso_3', ['DISK', 'CPU', 'MUTEX']),   // C: DISK→CPU→MUTEX
      proc('p4', 'proceso_4', ['CPU', 'MUTEX', 'DISK']),
    ],
    'AVOIDANCE',
  );
  runScenario('S3-P2 (revisada): ciclo de 3 (evitacion)', sc2, { autoAbortOnDeadlock: true });

  // Prueba 3: misma carga con PREVENTION y prioridad que reduce contencion
  const sc3 = scenarioOf(
    [res('CPU', 1), res('DISK', 1), res('MUTEX', 1)],
    [
      proc('p1', 'proceso_1', ['CPU', 'MUTEX', 'DISK']),
      proc('p2', 'proceso_2', ['MUTEX', 'DISK', 'CPU']),
      proc('p3', 'proceso_3', ['DISK', 'CPU', 'MUTEX']),
      proc('p4', 'proceso_4', ['CPU', 'MUTEX', 'DISK']),
    ],
    'PREVENTION',
    ['CPU', 'MUTEX', 'DISK'], // orden total impide espera circular
  );
  runScenario('S3-P3 (revisada): prevencion rompe el ciclo', sc3, { autoAbortOnDeadlock: true });
}

/* -----------------------------
   Main
-------------------------------- */

function main() {
  suiteSimpleCycle();
  suiteComplexCycle();
  suiteScarcity();
  console.log('\nFin de las pruebas.\n');
}

main();