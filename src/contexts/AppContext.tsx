'use client'
import {
  createContext,
  KeyboardEvent,
  useCallback,
  useContext,
  useState,
} from 'react'

interface AppState {
  isTerminal: boolean
  isOldUiEnabled: boolean
  lastKeyDown: KeyboardEvent | null
  oldKeyDown: KeyboardEvent | null
  setIsTerminal: (value: boolean) => void
  setIsOldUiEnabled: (value: boolean) => void
  setLastKeyDown: (value: KeyboardEvent | null) => void
  setOldKeyDown: (value: KeyboardEvent | null) => void
}

const initialState: AppState = {
  isTerminal: false,
  isOldUiEnabled: false,
  lastKeyDown: null,
  oldKeyDown: null,
  setIsTerminal: () => {},
  setIsOldUiEnabled: () => {},
  setLastKeyDown: () => {},
  setOldKeyDown: () => {},
}

const AppContext = createContext(initialState)

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [state, setState] = useState<AppState>(initialState)

  const setIsTerminal = useCallback(
    (value: boolean) => setState((prev) => ({ ...prev, isTerminal: value })),
    [],
  )
  const setIsOldUiEnabled = useCallback(
    (value: boolean) =>
      setState((prev) => ({ ...prev, isOldUiEnabled: value })),
    [],
  )
  const setLastKeyDown = useCallback(
    (value: KeyboardEvent | null) =>
      setState((prev) => ({ ...prev, lastKeyDown: value })),
    [],
  )
  const setOldKeyDown = useCallback(
    (value: KeyboardEvent | null) =>
      setState((prev) => ({ ...prev, oldKeyDown: value })),
    [],
  )

  const contextValue = {
    ...state,
    setIsTerminal,
    setIsOldUiEnabled,
    setLastKeyDown,
    setOldKeyDown,
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

export const useAppContext = () => {
  return useContext(AppContext)
}
