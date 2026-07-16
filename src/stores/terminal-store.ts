import { atom, effect } from 'nanostores';
import type { KeyboardEvent, RefObject } from 'react';
import type { TerminalPromptRef } from '@/components/terminal/TerminalPrompt';
import { Commands } from '@/constants/commands';
import { completePath } from '@/lib/repo/complete';
import { $cwd, $repoTree, changeDirectory } from '@/stores/repo-store';
import { Key } from '@/types/keyboard';
import { Command, type CommandEntry } from '@/types/terminal';
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
  const parsed = parseTerminalEntry(currentInput);

  if (parsed.cmdName === Command.Clear) {
    $terminalHistoryVisibleIdx.set(currentHistory.length);
  } else if (parsed.cmdName === Command.Cd) {
    const cwdBefore = $cwd.get();
    const target = parsed.args.positional[0] ?? '';
    const result = changeDirectory(target);
    const entry: CommandEntry = { ...parsed, cwd: cwdBefore };
    if (!result.ok) {
      entry.error = `cd: ${result.error}`;
    }
    $terminalHistory.set([...currentHistory, entry]);
  } else {
    $terminalHistory.set([...currentHistory, { ...parsed, cwd: $cwd.get() }]);
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
  $cwd.set('/');
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

/** Commands whose arguments are filesystem paths (eligible for path completion). */
const PATH_COMMANDS = new Set<Command>([Command.Cd, Command.Cat, Command.Ls]);

export function autocomplete() {
  const input = $terminalInput.get();
  const lastSpace = input.lastIndexOf(' ');

  // No space yet → complete command names.
  if (lastSpace === -1) {
    const matchedCmds = Commands.map((cmd) => cmd.name).filter((cmd) =>
      cmd.startsWith(input),
    );
    if (matchedCmds.length === 1) {
      $terminalInput.set(matchedCmds[0]);
    } else {
      $terminalSuggestions.set(matchedCmds);
      $terminalPromptRef.get()?.current?.scrollIntoView();
    }
    return;
  }

  // A space is present → complete the last token as a path, but only for
  // commands that take path arguments (cd / ls / cat).
  const cmdToken = input.slice(0, input.indexOf(' '));
  const command = Object.values(Command).find((value) => value === cmdToken) as
    | Command
    | undefined;

  if (!command || !PATH_COMMANDS.has(command)) {
    $terminalSuggestions.set(null);
    return;
  }

  const token = input.slice(lastSpace + 1);
  if (token.startsWith('-')) {
    // Flags are not completed.
    $terminalSuggestions.set(null);
    return;
  }

  const { vfs } = $repoTree.get();
  if (!vfs) {
    $terminalSuggestions.set(null);
    return;
  }

  const result = completePath(
    vfs,
    $cwd.get(),
    token,
    command === Command.Cd ? 'dir' : 'all',
  );

  if (result.completed !== undefined) {
    $terminalInput.set(`${input.slice(0, lastSpace + 1)}${result.completed}`);
    $terminalSuggestions.set(null);
  } else if (result.suggestions.length > 0) {
    $terminalSuggestions.set(result.suggestions);
    $terminalPromptRef.get()?.current?.scrollIntoView();
  } else {
    // No matching file/folder — surface "no match" (empty array) like the
    // command-name path does, instead of silently rendering nothing.
    $terminalSuggestions.set([]);
  }
}
