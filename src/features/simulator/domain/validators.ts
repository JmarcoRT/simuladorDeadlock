import type { ResourceDef } from './types';

export function clampAmount(def: ResourceDef, value: number) {      //Valida que la cantidad de recursos este entre el minimo y maximo
  if (Number.isNaN(value)) return def.min;
  return Math.max(def.min, Math.min(def.max, Math.floor(value)));
}