// src/features/simulator/engine/algorithms/avoidance.ts
import type { ResourceKind } from '../../domain/types';
import type { Session } from '../session';
import { RESOURCE_CATALOG } from '../../domain/constants';

export type Vector = Record<ResourceKind, number>;
export type Matrix = Record<string, Vector>;

export type SafetyStep = {
  work: Vector;                // Work despues del paso
  finishedProcId?: string;     // proceso que "termino" en este paso 
};

export type SafetyTrace = {
  tick: number;
  processId: string;
  processName: string;
  requestedKind: ResourceKind;
  total: Vector;
  availableBefore: Vector;
  allocationBefore: Matrix;
  max: Matrix;
  needBefore: Matrix;
  // Solicitud evaluada
  requestVector: Vector;
  // Pasos del algoritmo de seguridad
  workSteps: SafetyStep[];
  safe: boolean;
  safeSequence?: string[];
  reason?: string;
  // Si seguro
  availableAfter?: Vector;
  allocationAfter?: Matrix;
  needAfter?: Matrix;
};

// Orden de columnas (recursos) estable: el del catalogo
const KINDS: ResourceKind[] = RESOURCE_CATALOG.map(r => r.kind);

// ---------- Utilidades ----------
function zeroVector(): Vector {
  const v = {} as Vector;
  for (const k of KINDS) v[k] = 0;
  return v;
}
function cloneVector(src: Vector): Vector {
  const v = {} as Vector;
  for (const k of KINDS) v[k] = src[k] ?? 0;
  return v;
}
function addVectors(a: Vector, b: Vector): Vector {
  const out = {} as Vector;
  for (const k of KINDS) out[k] = (a[k] ?? 0) + (b[k] ?? 0);
  return out;
}
function subVectors(a: Vector, b: Vector): Vector {
  const out = {} as Vector;
  for (const k of KINDS) out[k] = (a[k] ?? 0) - (b[k] ?? 0);
  return out;
}
function leq(a: Vector, b: Vector): boolean {
  for (const k of KINDS) {
    if ((a[k] ?? 0) > (b[k] ?? 0)) return false;
  }
  return true;
}

// ---------- Construccion de matrices desde la Session ----------
export function buildMatrices(session: Session) {
  // Allocation por proceso
  const allocation: Matrix = {};
  for (const p of session.procs) {
    const row = zeroVector();
    for (const k of Object.keys(p.holding) as ResourceKind[]) {
      row[k] = p.holding[k] ?? 0;
    }
    allocation[p.id] = row;
  }

  // Total = Available + sum(Allocation)
  // (session no guarda Total explicito)
  const total = cloneVector(session.available);
  for (const pid of Object.keys(allocation)) {
    for (const k of KINDS) total[k] += allocation[pid][k] ?? 0;
  }

  // Max por proceso: derivado del allocationOrder del runtime (p.order)
  const max: Matrix = {};
  for (const p of session.procs) {
    const row = zeroVector();
    for (const k of p.order) row[k] = (row[k] ?? 0) + 1;
    max[p.id] = row;
  }

  // Need = Max - Allocation
  const need: Matrix = {};
  for (const p of session.procs) {
    const row = zeroVector();
    for (const k of KINDS) {
      row[k] = (max[p.id][k] ?? 0) - (allocation[p.id][k] ?? 0);
    }
    need[p.id] = row;
  }

  return {
    kinds: KINDS,
    procIds: session.procs.map(p => p.id),
    total,
    available: cloneVector(session.available),
    allocation,
    max,
    need,
  };
}

// ---------- Algoritmo de seguridad ----------
function safetyCheck(available: Vector, allocation: Matrix, need: Matrix, procIds: string[]) {
  const work = cloneVector(available);
  const finish: Record<string, boolean> = {};
  const steps: SafetyStep[] = [];
  const seq: string[] = [];

  // procesos already-done: Need==0 y Allocation==0
  for (const pid of procIds) {
    let allZero = true;
    for (const k of KINDS) {
      if ((need[pid][k] ?? 0) !== 0 || (allocation[pid][k] ?? 0) !== 0) {
        allZero = false; break;
      }
    }
    finish[pid] = allZero; // si esta todo en cero, ya termino
  }

  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const pid of procIds) {
      if (finish[pid]) continue;
      if (leq(need[pid], work)) {
        // este proceso podria terminar
        const newWork = addVectors(work, allocation[pid]);
        steps.push({ work: cloneVector(newWork), finishedProcId: pid });
        for (const k of KINDS) work[k] = newWork[k];
        finish[pid] = true;
        seq.push(pid);
        progressed = true;
      }
    }
  }

  const safe = procIds.every(pid => finish[pid]);
  if (!safe) {
    steps.push({ work: cloneVector(work) }); // snapshot final (nadie mas termina)
  }

  return { safe, steps, sequence: seq };
}

// ---------- Simular concesion y chequear seguridad ----------
export function simulateGrantAndCheckSafe(
  session: Session,
  procId: string,
  kind: ResourceKind
): { safe: boolean; trace: SafetyTrace } {
  const { kinds, procIds, total, available, allocation, max, need } = buildMatrices(session);

  // Datos del proceso
  const p = session.procs.find(x => x.id === procId)!;
  const request = zeroVector();
  request[kind] = 1;

  // Validaciones: Request ≤ Need y Request ≤ Available
  if (!leq(request, need[procId])) {
    const trace: SafetyTrace = {
      tick: session.t,
      processId: p.id,
      processName: p.name,
      requestedKind: kind,
      total,
      availableBefore: available,
      allocationBefore: allocation,
      max,
      needBefore: need,
      requestVector: request,
      workSteps: [],
      safe: false,
      reason: 'La solicitud excede el NEED restante del proceso.',
    };
    return { safe: false, trace };
  }
  if (!leq(request, available)) {
    const trace: SafetyTrace = {
      tick: session.t,
      processId: p.id,
      processName: p.name,
      requestedKind: kind,
      total,
      availableBefore: available,
      allocationBefore: allocation,
      max,
      needBefore: need,
      requestVector: request,
      workSteps: [],
      safe: false,
      reason: 'No hay disponibilidad suficiente (AVAILABLE).',
    };
    return { safe: false, trace };
  }

  // Construir matrices
  const availH = subVectors(available, request);

  const allocH: Matrix = {};
  const needH: Matrix = {};
  for (const id of procIds) {
    allocH[id] = { ...allocation[id] };
    needH[id] = { ...need[id] };
  }
  allocH[procId][kind] = (allocH[procId][kind] ?? 0) + 1;
  needH[procId][kind] = Math.max(0, (needH[procId][kind] ?? 0) - 1);

  // Safety check
  const sc = safetyCheck(availH, allocH, needH, procIds);

  const trace: SafetyTrace = {
    tick: session.t,
    processId: p.id,
    processName: p.name,
    requestedKind: kind,
    total,
    availableBefore: available,
    allocationBefore: allocation,
    max,
    needBefore: need,
    requestVector: request,
    workSteps: sc.steps,
    safe: sc.safe,
    safeSequence: sc.safe ? sc.sequence : undefined,
    reason: sc.safe ? undefined : 'Estado inseguro: no existe secuencia que finalice todos los procesos.',
    availableAfter: sc.safe ? availH : undefined,
    allocationAfter: sc.safe ? allocH : undefined,
    needAfter: sc.safe ? needH : undefined,
  };

  return { safe: sc.safe, trace };
}

// ---------- Compatibilidad con tu import actual ----------
export function isSafeAfterGrant(hypothetical: Session, _procId: string, _kind: ResourceKind): boolean {
  // Usa las matrices y corre el safety check
  const m = buildMatrices(hypothetical);
  const sc = safetyCheck(m.available, m.allocation, m.need, m.procIds);
  return sc.safe;
}
