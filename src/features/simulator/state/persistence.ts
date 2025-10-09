import type { Scenario } from '../domain/types';

const KEY = 'sim-deadlocks:scenario';

export function saveScenario(s: Scenario) {             // guardamos el escenario en localStorage
  try { 
    localStorage.setItem(KEY, JSON.stringify(s)); 
  } catch(err) {
    console.error('Error al acceder a localStorage:', err);
  }    
}

export function loadScenario(): Scenario | null {   // cargamos el escenario desde localStorage
  try {
    const raw = localStorage.getItem(KEY);              
    return raw ? (JSON.parse(raw) as Scenario) : null;
  } catch { return null; }
}

export function clearScenario() {         // borramos el escenario de localStorage
  try { 
    localStorage.removeItem(KEY); 
  } catch(err) {
    console.error('Error al limpiar el localStorage:', err);
  }
}