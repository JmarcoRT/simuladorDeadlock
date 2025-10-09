import type { ResourceDef, ResourceKind, Scenario } from './types'; //importamos las interfaces y tipos

export const RESOURCE_CATALOG: ResourceDef[] = [
  { kind: 'CPU',          code: 'CPU',          functional: 'Procesamiento',              min: 1,  max: 16 },
  { kind: 'DISK',         code: 'DISK',         functional: 'I/O',                        min: 1,  max: 16 },
  { kind: 'NET',          code: 'RED',          functional: 'I/O (comunicación)',         min: 1,  max: 16 },
  { kind: 'MUTEX',        code: 'MUTEX',        functional: 'Sincronización exclusiva',   min: 1,  max: 32 },
  { kind: 'SEMAPHORE',    code: 'SEMAFORO',     functional: 'Sincronización contable',    min: 1,  max: 32 },
  { kind: 'FD_LIMIT',     code: 'FD_LIMIT',     functional: 'Recurso de sistema',         min: 1,  max: 64 },
  { kind: 'THREAD_LIMIT', code: 'THREAD_LIMIT', functional: 'Recurso de concurrencia',    min: 1,  max: 64 },
];

export const DEFAULT_SPEED_MS = 300;    // velocidad por defecto de la simulacion

export const EMPTY_SCENARIO: Scenario = {
  resources: RESOURCE_CATALOG.map(r => ({ kind: r.kind, amount: r.min })),  //estado inicial toma la cantidad minima de cada recurso
  processes: [],
  algorithm: null,
  speedMs: DEFAULT_SPEED_MS,
};

export const KIND_LABELS: Record<ResourceKind, string> = {  // etiquetas para mostrar en la UI
  CPU: 'CPU',
  DISK: 'Disco',
  NET: 'Red',
  MUTEX: 'Mutex',
  SEMAPHORE: 'Semáforo',
  FD_LIMIT: 'Archivos',
  THREAD_LIMIT: 'Hilos por proceso',
};