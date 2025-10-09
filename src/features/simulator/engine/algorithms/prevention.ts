import type { ResourceKind } from '../../domain/types';

export function canGrantByPrevention(
  requested: ResourceKind,
  holding: Record<ResourceKind, number>,
  priorityOrder: ResourceKind[]
) {
  if (!priorityOrder || priorityOrder.length === 0) return true;
  const idxReq = priorityOrder.indexOf(requested);
  if (idxReq === -1) return true;

  // Si ya sostengo algun recurso con prioridad MENOR (indice mayor => menos prioritario),
  // y quiero pedir uno de prioridad MAYOR (indice menor), lo bloqueamos.
  for (const k of Object.keys(holding) as ResourceKind[]) {
    if ((holding[k] ?? 0) > 0) {
      const idxHold = priorityOrder.indexOf(k);
      if (idxHold > idxReq) {
        return false; // violaria el orden no-decreciente
      }
    }
  }
  return true;
}