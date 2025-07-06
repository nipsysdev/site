'use client';

import type { KeyboardEvent } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

interface AppState {
	isTerminal: boolean;
	lastKeyDown: KeyboardEvent | null;
	oldKeyDown: KeyboardEvent | null;
	setIsTerminal: (value: boolean) => void;
	setLastKeyDown: (value: KeyboardEvent | null) => void;
	setOldKeyDown: (value: KeyboardEvent | null) => void;
}

const initialState: AppState = {
	isTerminal: false,
	lastKeyDown: null,
	oldKeyDown: null,
	setIsTerminal: () => {},
	setLastKeyDown: () => {},
	setOldKeyDown: () => {},
};

const AppContext = createContext(initialState);

export const AppStateProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [state, setState] = useState<AppState>(initialState);

	const setIsTerminal = useCallback(
		(value: boolean) => setState((prev) => ({ ...prev, isTerminal: value })),
		[],
	);
	const setLastKeyDown = useCallback(
		(value: KeyboardEvent | null) =>
			setState((prev) => ({ ...prev, lastKeyDown: value })),
		[],
	);
	const setOldKeyDown = useCallback(
		(value: KeyboardEvent | null) =>
			setState((prev) => ({ ...prev, oldKeyDown: value })),
		[],
	);

	const contextValue = {
		...state,
		setIsTerminal,
		setLastKeyDown,
		setOldKeyDown,
	};

	return (
		<AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
	);
};

export const useAppContext = () => {
	return useContext(AppContext);
};
