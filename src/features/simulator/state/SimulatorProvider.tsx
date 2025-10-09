import React, { useReducer, useMemo, useEffect } from 'react';
import { reducer } from './reducer';
import type { Action } from './reducer';
import { loadScenario, saveScenario } from './persistence';
import { EMPTY_SCENARIO } from '../domain/constants';
import { SimulatorContext } from './SimulatorContext';

export const SimulatorProvider: React.FC<React.PropsWithChildren> = ({ children }) => {       //provee el contexto del simulador
  const initial = loadScenario() ?? EMPTY_SCENARIO;
  const [state, dispatchBase] = useReducer(reducer, initial);

  const dispatch: React.Dispatch<Action> = (a) => {
    dispatchBase(a);
  };

  useEffect(() => { saveScenario(state); }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
};