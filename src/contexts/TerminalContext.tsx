import { createContext, useCallback, useContext, useState } from 'react';
import type { AppRoute } from '@/types/routing';
import type { CommandEntry } from '@/types/terminal';

interface TerminalState {
  input: string;
  submission: string;
  simulatedCmd: string;
  history: CommandEntry[];
  hasIntroduced: boolean;
  hasRefreshed: boolean;
  lastRouteReq: AppRoute | null;
  oldRouteReq: AppRoute | null;
  setInput: (value: string) => void;
  setSubmission: (value: string) => void;
  setSimulatedCmd: (value: string) => void;
  setHistory: (value: CommandEntry[]) => void;
  setHasIntroduced: (value: boolean) => void;
  setHasRefreshed: (value: boolean) => void;
  setLastRouteReq: (value: AppRoute | null) => void;
  setOldRouteReq: (value: AppRoute | null) => void;
}

const initialState: TerminalState = {
  input: '',
  submission: '',
  simulatedCmd: '',
  history: [],
  hasIntroduced: false,
  hasRefreshed: false,
  lastRouteReq: null,
  oldRouteReq: null,
  setInput: () => {},
  setSubmission: () => {},
  setSimulatedCmd: () => {},
  setHistory: () => {},
  setHasIntroduced: () => {},
  setHasRefreshed: () => {},
  setLastRouteReq: () => {},
  setOldRouteReq: () => {},
};

const TerminalContext = createContext(initialState);

export const TerminalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<TerminalState>(initialState);

  const setInput = useCallback(
    (value: string) => setState((prev) => ({ ...prev, input: value })),
    [],
  );

  const setSubmission = useCallback(
    (value: string) => setState((prev) => ({ ...prev, submission: value })),
    [],
  );

  const setSimulatedCmd = useCallback(
    (value: string) => setState((prev) => ({ ...prev, simulatedCmd: value })),
    [],
  );

  const setHistory = useCallback(
    (newHistory: CommandEntry[]) =>
      setState((prev) => ({ ...prev, history: newHistory })),
    [],
  );

  const setHasIntroduced = useCallback(
    (value: boolean) => setState((prev) => ({ ...prev, hasIntroduced: value })),
    [],
  );

  const setHasRefreshed = useCallback(
    (value: boolean) => setState((prev) => ({ ...prev, hasRefreshed: value })),
    [],
  );

  const setLastRouteReq = useCallback(
    (value: AppRoute | null) =>
      setState((prev) => ({ ...prev, lastRouteReq: value })),
    [],
  );

  const setOldRouteReq = useCallback(
    (value: AppRoute | null) =>
      setState((prev) => ({ ...prev, oldRouteReq: value })),
    [],
  );

  const contextValue = {
    ...state,
    setInput,
    setSubmission,
    setSimulatedCmd,
    setHistory,
    setHasIntroduced,
    setHasRefreshed,
    setLastRouteReq,
    setOldRouteReq,
  };

  return (
    <TerminalContext.Provider value={contextValue}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminalContext = () => {
  return useContext(TerminalContext);
};
