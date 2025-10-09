import { EMPTY_SCENARIO } from '../domain/constants';
import { clearScenario } from './persistence';
import type { AlgorithmType, ProcessDef, ResourceKind, Scenario } from '../domain/types';

export type Action =
  | { type: 'SET_RESOURCE'; kind: ResourceKind; amount: number }
  | { type: 'ADD_PROCESS'; process: ProcessDef }
  | { type: 'REMOVE_PROCESS'; id: string }
  | { type: 'MOVE_PROCESS'; from: number; to: number }
  | { type: 'SET_ALGORITHM'; algorithm: AlgorithmType | null }
  | { type: 'SET_PREVENTION_PRIORITY'; order: ResourceKind[] }
  | { type: 'SET_SPEED'; speedMs: number }
  | { type: 'CLEAR_ALGORITHM' }                   // 👈 NUEVO
  | { type: 'RESET' };

export function reducer(state: Scenario, action: Action): Scenario {
  switch (action.type) {
    case 'SET_RESOURCE':
      return {
        ...state,
        resources: state.resources.map(r =>
          r.kind === action.kind ? { ...r, amount: action.amount } : r
        ),
      };
    case 'ADD_PROCESS':
      return { ...state, processes: [...state.processes, action.process] };
    case 'REMOVE_PROCESS':
      return { ...state, processes: state.processes.filter(p => p.id !== action.id) };
    case 'SET_ALGORITHM':
      return { ...state, algorithm: action.algorithm };
    case 'SET_PREVENTION_PRIORITY':
      return { ...state, preventionPriority: action.order };
    case 'SET_SPEED':
      return { ...state, speedMs: action.speedMs };
    case 'MOVE_PROCESS': {
      const list = [...state.processes];
      const { from, to } = action;
      if (to < 0 || to >= list.length) return state;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { ...state, processes: list };
    }
    case 'CLEAR_ALGORITHM': {                      // 👈 NUEVO
      return { ...state, algorithm: null, preventionPriority: [] };
    }
    case 'RESET':
      clearScenario();
      return { ...EMPTY_SCENARIO };
    default:
      return state;
  }
}
