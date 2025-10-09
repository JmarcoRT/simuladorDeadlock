import { createContext } from 'react';
import type { Scenario } from '../domain/types';
import type { Action } from './reducer';

export type Ctx = {         // define el contexto del simulador
  state: Scenario;
  dispatch: React.Dispatch<Action>;
};

export const SimulatorContext = createContext<Ctx | null>(null);
