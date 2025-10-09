import type { AlgorithmType, ProcessDef, ResourceKind, Scenario } from '../domain/types';
import { canGrantByPrevention } from './algorithms/prevention';
import { simulateGrantAndCheckSafe, type SafetyTrace } from './algorithms/avoidance';

/** Estado de ejecucion de un proceso durante la simulacion */
export type ProcRuntime = {
  id: string;
  name: string;
  order: ResourceKind[];
  ptr: number;
  holding: Record<ResourceKind, number>;
  state: 'ready' | 'waiting' | 'done';
  cooldown?: number;
  preemptions?: number;
};

export type ActionLog = {
  t: number;
  msg: string;
};

/** Estado global de la simulacion en curso */
export type Session = {
  t: number;
  available: Record<ResourceKind, number>;
  procs: ProcRuntime[];
  logs: ActionLog[];
  deadlock: boolean;
  deadlocksCount: number;
  algorithm: AlgorithmType | null;
  preventionOrder: ResourceKind[];
  rrIndex: number;
  preventedDeadlocksCount?: number;
  avoidanceTrace?: SafetyTrace | null;

  manualAbortCount?: number;   // abortos manuales (DETECTION)
  waitEvents?: number;         // veces que algun proceso quedo en espera
  reorderEvents?: number;      // reordenes por PREVENTION
  deniedUnsafe?: number;       // solicitudes denegadas por AVOIDANCE (estado inseguro)
};

function initAvailable(s: Scenario): Record<ResourceKind, number> {
  const avail = {} as Record<ResourceKind, number>;
  s.resources.forEach(r => { avail[r.kind] = r.amount; });
  return avail;
}

export function initSession(s: Scenario): Session {
  return {
    t: 0,
    available: initAvailable(s),
    procs: s.processes.map<ProcRuntime>((p: ProcessDef) => ({
      id: p.id,
      name: p.name,
      order: [...p.allocationOrder],
      ptr: 0,
      holding: {} as Record<ResourceKind, number>,
      state: p.allocationOrder.length ? 'ready' : 'done',
      cooldown: 0,
      preemptions: 0,
    })),
    logs: [],
    deadlock: false,
    deadlocksCount: 0,
    algorithm: s.algorithm,
    preventionOrder: s.preventionPriority ?? [],
    rrIndex: 0,
    preventedDeadlocksCount: 0,
    avoidanceTrace: null,

        manualAbortCount: 0,
    waitEvents: 0,
    reorderEvents: 0,
    deniedUnsafe: 0,
  };
}

/** Libera todos los recursos que sostiene un proceso. */
function releaseAll(session: Session, p: ProcRuntime) {
  for (const k of Object.keys(p.holding) as ResourceKind[]) {
    session.available[k] += p.holding[k];
  }
  p.holding = {} as Record<ResourceKind, number>;
}

/** API publica para DETECTION (liberar proceso manualmente) */
export function releaseProcess(session: Session, procId: string): Session {
  const next = structuredClone(session) as Session;
  const p = next.procs.find(x => x.id === procId);
  if (!p) return next;
  releaseAll(next, p);
  p.state = 'done';
  next.logs.push({ t: next.t, msg: `Release: Liberado manualmente: ${p.name}` });
  next.deadlock = false;
  return next;
}

// Helper: prioridad (indice). Si no esta en la lista, lo mandamos al final.
function priorityIndex(order: ResourceKind[], k: ResourceKind): number {
  const i = order.indexOf(k);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

type GrantResult = 'granted' | 'waiting' | 'preempted' | 'reordered';

/** Ejecuta la politica de concesión para el proceso p respecto de su necesidad actual. */
function tryGrant(session: Session, p: ProcRuntime, needFromOrder: ResourceKind | undefined): GrantResult {
  // cooldown: si esta enfriando, no actua este tick
  if ((p.cooldown ?? 0) > 0) return 'waiting';

  // === PREVENCION: elegir dinamicamente el recurso que respete la prioridad ===
  let need = needFromOrder;
  if (session.algorithm === 'PREVENTION') {
    const priority = session.preventionOrder;

    // prioridad maxima de lo que sostiene
    let maxHeld = -1;
    for (const k of Object.keys(p.holding) as ResourceKind[]) {
      if ((p.holding[k] ?? 0) > 0) {
        maxHeld = Math.max(maxHeld, priorityIndex(priority, k));
      }
    }

    const remaining = p.order.slice(p.ptr);
    const candidates = remaining
      .filter(r => priorityIndex(priority, r) >= maxHeld)
      .sort((a, b) => priorityIndex(priority, a) - priorityIndex(priority, b));

    if (candidates.length === 0) {
      // preempt
      const heldKinds = Object.keys(p.holding) as ResourceKind[];
      releaseAll(session, p);
      p.ptr = 0;
      p.state = 'ready';
      p.cooldown = Math.max(1, (p.cooldown ?? 0));
      p.preemptions = (p.preemptions ?? 0) + 1;
      session.preventedDeadlocksCount = (session.preventedDeadlocksCount ?? 0) + 1;

      session.logs.push({
        t: session.t,
        msg: `Prevention: se abortó ${p.name} (no hay solicitud restante que respete la prioridad; sostenía ${heldKinds.join(', ') || 'nada'}).`,
      });
      return 'preempted';
    }

    const chosen = candidates[0];

    if (needFromOrder !== chosen) {
      // Traer el elegido al frente (swap con el actual en ptr)
      const j = p.order.indexOf(chosen, p.ptr);
      if (j > -1) {
        const tmp = p.order[p.ptr];
        p.order[p.ptr] = p.order[j];
        p.order[j] = tmp;
        need = p.order[p.ptr];

        // Consumir el tick solo reordenando
        session.logs.push({
          t: session.t,
          msg: `Prevention: ${p.name} reordenó; próximo a solicitar ${need}.`,
        });
        session.reorderEvents = (session.reorderEvents ?? 0) + 1; 
        return 'reordered';
      }
    } else {
      need = needFromOrder;
    }

    // Validacion
    if (need && !canGrantByPrevention(need, p.holding, priority)) {
      const heldKinds = Object.keys(p.holding) as ResourceKind[];
      releaseAll(session, p);
      p.ptr = 0;
      p.state = 'ready';
      p.cooldown = Math.max(1, (p.cooldown ?? 0));
      p.preemptions = (p.preemptions ?? 0) + 1;
      session.preventedDeadlocksCount = (session.preventedDeadlocksCount ?? 0) + 1;
      session.logs.push({
        t: session.t,
        msg: `Prevention: se abortó ${p.name} por violar prioridad al pedir ${need}${heldKinds.length ? ` sosteniendo ${heldKinds.join(', ')}` : ''}.`,
      });
      return 'preempted';
    }
  }

  // Si no hay "need" (proceso ya terminaba), espera
  if (!need) return 'waiting';

  // === AVOIDANCE: simulacion de estado seguro ===
  if (session.algorithm === 'AVOIDANCE') {
    session.avoidanceTrace = null; // limpia traza por tick
    const free = session.available[need!] ?? 0;
    if (free <= 0) return 'waiting';

    const { safe, trace } = simulateGrantAndCheckSafe(session, p.id, need!);
    session.avoidanceTrace = trace; // guarda para el modal

    if (!safe) {
      // No mezcles logs aqui: devolvemos 'waiting' y el step() registra el "Wait:"
      session.deniedUnsafe = (session.deniedUnsafe ?? 0) + 1;
      return 'waiting';
    }
    // Si es seguro, seguimos a la concesion real más abajo
  }

  // === DISPONIBILIDAD (comun) ===
  const free = session.available[need] ?? 0;
  if (free <= 0) return 'waiting';

  // === CONCEDER ===
  session.available[need] = free - 1;
  p.holding[need] = (p.holding[need] ?? 0) + 1;
  const wasPtr = p.ptr;
  p.ptr += 1;
  p.state = p.ptr >= p.order.length ? 'done' : 'ready';

  // Log de grant (siempre)
  session.logs.push({ t: session.t, msg: `Grant: ${p.name} obtuvo ${need} (paso ${wasPtr + 1})` });

  // si termino, libera todo y loguea finish en su propia linea
  if (p.state === 'done') {
    releaseAll(session, p);
    session.logs.push({ t: session.t, msg: `Finish: ${p.name} finalizó y liberó sus recursos` });
  }

  return 'granted';
}

/**
 * Avanza exactamente **una acción** por tick (grant, preempt, reorder o wait) con fairness round-robin.
 * - DETECTION: puede quedar en deadlock real si nadie progresa (se loguea).
 * - PREVENTION/AVOIDANCE: no hay deadlock real; si nadie progresa, se registra un "Info".
 */
export function step(session: Session): Session {
  if (session.deadlock) return session;

  const next = structuredClone(session) as Session;
  next.t += 1;

  // Enfriamientos (no cuentan como accion)
  for (const p of next.procs) {
    if ((p.cooldown ?? 0) > 0) p.cooldown = Math.max(0, (p.cooldown ?? 0) - 1);
  }

  const n = next.procs.length;
  if (n === 0) return next;

  let actionTaken: GrantResult | null = null;
  let waitLoggedThisTick = false; 

  // Una vuelta completa RR
  for (let k = 0; k < n; k++) {
    const i = (next.rrIndex + k) % n;
    const p = next.procs[i];
    if (p.state === 'done') continue;

    const need = p.order[p.ptr];
    const res = tryGrant(next, p, need);

    if (res === 'granted' || res === 'preempted' || res === 'reordered') {
      actionTaken = res;
      break; 
    }

    // waiting: registrar UNA vez por tick y seguir buscando accion real
    if (!waitLoggedThisTick) {
      next.logs.push({ t: next.t, msg: `Wait: ${p.name} espera ${need}` });
      next.waitEvents = (next.waitEvents ?? 0) + 1;
      waitLoggedThisTick = true;
    }
    p.state = 'waiting';
    // no rompemos; seguimos intentando con otros procesos
  }

  // Avanza el RR para el proximo tick
  next.rrIndex = (next.rrIndex + 1) % n;

  const remaining = next.procs.some(p => p.state !== 'done');

  if (!actionTaken && remaining) {
    // Nadie pudo progresar en toda la vuelta RR.
    const isBaselineOrDetection =
      next.algorithm === null || next.algorithm === 'DETECTION';

    if (isBaselineOrDetection) {
      //  Paso 2 (algorithm=null) y en Deteccion, declaramos deadlock
      next.deadlock = true;
      next.deadlocksCount += 1;
      next.logs.push({ t: next.t, msg: `Deadlock: detectado` });
    } else {
      // En Prevencion/Avoidance (Paso 4): no hay deadlock real; solo informamos
      next.logs.push({ t: next.t, msg: `Info: Todos esperando (no hubo acción este tick)` });
    }
  }


  return next;
}


// Abortar proceso (deteccion): libera todo, marca done y corta el deadlock
export function abortProcess(session: Session, procId: string): Session {
  const next = structuredClone(session) as Session;
  const idx = next.procs.findIndex(x => x.id === procId);
  if (idx === -1) return next;

  const p = next.procs[idx];

  // 1) liberar todos los recursos que sostenia
  for (const k of Object.keys(p.holding) as ResourceKind[]) {
    next.available[k] += p.holding[k];
  }
  p.holding = {} as Record<ResourceKind, number>;

  // 2) reiniciar su ejecucion
  p.ptr = 0;
  p.state = 'ready';        
  p.cooldown = 1;           

  // 3) moverlo al final de la cola round-robin
  next.procs.splice(idx, 1);
  next.procs.push(p);
  // ajustar rrIndex para no saltarse a nadie si movimos a la izquierda de rrIndex
  if (idx <= next.rrIndex && next.rrIndex > 0) next.rrIndex -= 1;

  // 4) cortar el estado de deadlock (ya liberamos)
  next.deadlock = false;

  // 5) log para el badge “Aborto”
  next.logs.push({ t: next.t, msg: `Abort: ${p.name} abortado, liberó sus recursos` });
  next.manualAbortCount = (next.manualAbortCount ?? 0) + 1;
  return next;
}

export function getMetrics(session: Session) {
  const preemptionsTotal = session.procs.reduce((acc, p) => acc + (p.preemptions ?? 0), 0);
  const waitEvents = session.waitEvents ?? 0;
  const reorderEvents = session.reorderEvents ?? 0;
  const deniedUnsafe = session.deniedUnsafe ?? 0;

  const overhead = waitEvents + reorderEvents + deniedUnsafe + preemptionsTotal;

  return {
    deadlocks: session.deadlocksCount,
    abortosManuales: session.manualAbortCount ?? 0,
    deadlocksPrevenidos: session.preventedDeadlocksCount ?? 0,
    preemptionsTotal,
    waitEvents,
    reorderEvents,
    deniedUnsafe,
    overhead,
  };
}