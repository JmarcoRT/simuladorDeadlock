export type ResourceKind =
  | 'CPU'
  | 'DISK'
  | 'NET'
  | 'MUTEX'
  | 'SEMAPHORE'
  | 'FD_LIMIT'
  | 'THREAD_LIMIT';

export type AlgorithmType = 'PREVENTION' | 'AVOIDANCE' | 'DETECTION';

export interface ResourceDef {
  kind: ResourceKind;
  code: string;            // p.ej. "CPU"
  functional: string;      // p.ej. "Procesamiento"
  min: number;
  max: number;
}

export interface ResourceQty {
  kind: ResourceKind;
  amount: number;          // cantidad elegida por usuario
}

export interface ProcessDef {
  id: string;
  name: string;
  priority?: number;
  allocationOrder: ResourceKind[]; // orden elegido por usuario
}

export interface Scenario {
  resources: ResourceQty[];
  processes: ProcessDef[];
  algorithm: AlgorithmType | null;
  preventionPriority?: ResourceKind[]; // si elige PREVENTION
  speedMs: number; // tiempo por accion
}

export type SimulationStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'DONE';