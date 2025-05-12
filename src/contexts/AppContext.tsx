'use client'
import { createContext, useContext, useState } from 'react'

interface AppState {
  isTerminal: boolean
  setIsTerminal: (value: boolean) => void
}

const initialState: AppState = {
  isTerminal: false,
  setIsTerminal: () => {},
}

const AppContext = createContext(initialState)

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [state, setState] = useState<AppState>(initialState)

  const setIsTerminal = (value: boolean) =>
    setState((prev) => ({ ...prev, isTerminal: value }))

  const contextValue = {
    ...state,
    setIsTerminal,
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

export const useAppContext = () => {
  return useContext(AppContext)
}
