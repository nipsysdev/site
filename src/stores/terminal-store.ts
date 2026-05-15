import { atom, effect } from 'nanostores';
import type { KeyboardEvent, RefObject } from 'react';
import type { TerminalPromptRef } from '@/components/terminal/TerminalPrompt';
import { Commands } from '@/constants/commands';
import { Key } from '@/types/keyboard';
import type { CommandEntry } from '@/types/terminal';
import { getPastInputStr, parseTerminalEntry } from '@/utils/terminal-utils';

export const $terminalInput = atom('');
export const $terminalInputReadOnly = atom(false);
export const $terminalHistory = atom<CommandEntry[]>([]);
export const $terminalHistoryIdx = atom(-1);
export const $terminalHistoryVisibleIdx = atom(0);
export const $terminalSuggestions = atom<string[] | null>(null);
export const $terminalKeyEvent = atom<KeyboardEvent | null>(null);
export const $terminalPromptRef =
  atom<RefObject<TerminalPromptRef | null> | null>(null);
export const $scrollY = atom(0);

effect($terminalKeyEvent, (event) => {
  const isReadOnly = $terminalInputReadOnly.get();
  if (!event || isReadOnly) return;

  $terminalSuggestions.set(null);

  if (event.ctrlKey && event.key === Key.c) {
    resetTerminalInput();
    submitTerminalInput();
    return;
  }

  switch (event.key) {
    case Key.Enter:
      $terminalKeyEvent.set(null);
      submitTerminalInput();
      break;
    case Key.ArrowUp:
      setPreviousHistoryEntry();
      break;
    case Key.ArrowDown:
      setNextHistoryEntry();
      break;
    case Key.Tab:
      event.preventDefault();
      autocomplete();
  }
});

export function resetTerminalInput() {
  $terminalInput.set('');
  $terminalHistoryIdx.set(-1);
}

export function submitTerminalInput() {
  const currentInput = $terminalInput.get();
  const currentHistory = $terminalHistory.get();
  const terminalPromptRef = $terminalPromptRef.get();

  if (currentInput !== 'clear') {
    $terminalHistory.set([...currentHistory, parseTerminalEntry(currentInput)]);
  } else {
    $terminalHistoryVisibleIdx.set(currentHistory.length);
  }
  $terminalInput.set('');
  setTimeout(() => {
    terminalPromptRef?.current?.scrollIntoView();
  }, 100);
}

export function simulateInput(input: string) {
  let i = 0;
  $terminalInputReadOnly.set(true);

  const addChar = (cmd: string) => {
    if (!cmd || i >= cmd.length) {
      submitTerminalInput();
      $terminalInputReadOnly.set(false);
      return;
    }
    const currentInput = $terminalInput.get();
    $terminalInput.set(currentInput + cmd.charAt(i));
    i++;

    setTimeout(() => {
      addChar(cmd);
      $terminalPromptRef.get()?.current?.focus();
    }, 50);
  };

  $terminalInput.set('');
  addChar(input);
}

export function initializeTerminal(command: string) {
  $terminalHistory.set([]);
  $terminalHistoryIdx.set(-1);
  $terminalHistoryVisibleIdx.set(0);
  simulateInput(command);
}

export function setPreviousHistoryEntry() {
  const history = $terminalHistory.get();
  const historyIdx = $terminalHistoryIdx.get();
  if (!history.length || historyIdx === 0) return;
  const idx = historyIdx === -1 ? history.length - 1 : historyIdx - 1;
  const inputStr = getPastInputStr(history[idx]);
  $terminalInput.set(inputStr);
  $terminalPromptRef.get()?.current?.setCursorToIdx(inputStr.length);
  $terminalHistoryIdx.set(idx);
}

export function setNextHistoryEntry() {
  const history = $terminalHistory.get();
  const historyIdx = $terminalHistoryIdx.get();
  if (!history.length || historyIdx === -1) return;
  let idx = historyIdx;

  if (idx === history.length - 1) {
    resetTerminalInput();
    return;
  }

  idx++;
  const inputStr = getPastInputStr(history[idx]);
  $terminalInput.set(inputStr);
  $terminalPromptRef.get()?.current?.setCursorToIdx(inputStr.length);
  $terminalHistoryIdx.set(idx);
}

export function autocomplete() {
  const input = $terminalInput.get();
  const matchedCmds = Commands.map((cmd) => cmd.name).filter((cmd) => {
    console.log(cmd);
    return cmd.startsWith(input);
  });
  if (matchedCmds.length === 1) {
    $terminalInput.set(matchedCmds[0]);
  } else {
    $terminalSuggestions.set(matchedCmds);
    $terminalPromptRef.get()?.current?.scrollIntoView();
  }
}
