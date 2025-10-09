import type { Session } from '../../engine/session';
import { KIND_LABELS } from '../../domain/constants';

export type GNode = { id: string; label: string; kind: 'process' | 'resource' };
export type GEdge = {
  from: string; // id nodo origen
  to: string;   // id nodo destino
  kind: 'assign' | 'request' | 'waiting';
};

export type GraphData = {
  processes: GNode[];
  resources: GNode[];
  edges: GEdge[];
};

export function buildGraph(session: Session): GraphData {
  const processes: GNode[] = session.procs.map(p => ({
    id: p.id,
    label: p.name,
    kind: 'process'
  }));

  // recursos (uno por tipo)
  const resources: GNode[] = Object.keys(session.available).map(k => ({
    id: `R_${k}`,
    label: KIND_LABELS[k as keyof typeof KIND_LABELS],
    kind: 'resource'
  }));

  const edges: GEdge[] = [];

  // asignaciones actuales (R -> P)
  for (const p of session.procs) {
    for (const k of Object.keys(p.holding) as (keyof typeof session.available)[]) {
      if ((p.holding[k] ?? 0) > 0) {
        edges.push({ from: `R_${k}`, to: p.id, kind: 'assign' });
      }
    }
  }

  // solicitudes actuales (P -> R)   waiting si el proceso esta esperando ese recurso
  for (const p of session.procs) {
    if (p.state === 'done') continue;
    const need = p.order[p.ptr];
    if (!need) continue;
    const kind: GEdge['kind'] = p.state === 'waiting' ? 'waiting' : 'request';
    edges.push({ from: p.id, to: `R_${need}`, kind });
  }

  return { processes, resources, edges };
}
