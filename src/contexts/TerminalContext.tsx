import { AppRoute } from '@/types/routing'
import { CommandEntry } from '@/types/terminal'
import { createContext, useContext, useState } from 'react'

interface TerminalState {
  input: string
  submission: string
  simulatedCmd: string
  history: CommandEntry[]
  hasIntroduced: boolean
  hasRefreshed: boolean
  lastRouteReq: AppRoute | null
  oldRouteReq: AppRoute | null
  setInput: (value: string) => void
  setSubmission: (value: string) => void
  setSimulatedCmd: (value: string) => void
  setHistory: (value: CommandEntry[]) => void
  setHasIntroduced: (value: boolean) => void
  setHasRefreshed: (value: boolean) => void
  setLastRouteReq: (value: AppRoute | null) => void
  setOldRouteReq: (value: AppRoute | null) => void
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
}

const TerminalContext = createContext(initialState)

export const TerminalStateProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [state, setState] = useState<TerminalState>(initialState)

  const setInput = (value: string) =>
    setState((prev) => ({ ...prev, input: value }))
  const setSubmission = (value: string) =>
    setState((prev) => ({ ...prev, submission: value }))
  const setSimulatedCmd = (value: string) =>
    setState((prev) => ({ ...prev, simulatedCmd: value }))
  const setHistory = (newHistory: CommandEntry[]) =>
    setState((prev) => ({ ...prev, history: newHistory }))
  const setHasIntroduced = (value: boolean) =>
    setState((prev) => ({ ...prev, hasIntroduced: value }))
  const setHasRefreshed = (value: boolean) =>
    setState((prev) => ({ ...prev, hasRefreshed: value }))
  const setLastRouteReq = (value: AppRoute | null) =>
    setState((prev) => ({ ...prev, lastRouteReq: value }))
  const setOldRouteReq = (value: AppRoute | null) =>
    setState((prev) => ({ ...prev, oldRouteReq: value }))

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
  }

  return (
    <TerminalContext.Provider value={contextValue}>
      {children}
    </TerminalContext.Provider>
  )
}

export const useTerminalContext = () => {
  return useContext(TerminalContext)
}
