let c = 0;
export function uid(prefix = 'p') {             //Genera ids unicos para procesos
  c += 1;
  return `${prefix}${Date.now().toString(36)}_${c}`;
}