import { allTasks, cleanStores, keepMount } from 'nanostores';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCommandEntry } from '@/__tests__/fixtures/terminal-fixtures';
import type { RepoEntry } from '@/lib/repo/types';
import { createVfs } from '@/lib/repo/vfs';
import { $cwd, $repoTree } from '@/stores/repo-store';
import {
  $terminalHistory,
  $terminalHistoryIdx,
  $terminalHistoryVisibleIdx,
  $lastDisplayedCommand,
  $terminalInput,
  $terminalInputReadOnly,
  $terminalKeyEvent,
  $terminalPromptRef,
  $terminalSuggestions,
  autocomplete,
  resetTerminalInput,
  setNextHistoryEntry,
  setPreviousHistoryEntry,
  simulateInput,
  submitTerminalInput,
} from '@/stores/terminal-store';
import { Key } from '@/types/keyboard';
import { Command } from '@/types/terminal';

function createMockKeyboardEvent(
  key: string,
  options: Partial<ReactKeyboardEvent<Element>> = {},
): ReactKeyboardEvent<Element> {
  const event = {
    key,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    code: key,
    charCode: 0,
    keyCode: 0,
    which: 0,
    bubbles: false,
    cancelable: false,
    currentTarget: null as unknown as Element,
    target: null as unknown as Element,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    nativeEvent: null as unknown as globalThis.KeyboardEvent,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: () => {},
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    timeStamp: Date.now(),
    type: 'keydown',
    ...options,
  };
  return event as ReactKeyboardEvent<Element>;
}

function resetAllStores() {
  $terminalInput.set('');
  $terminalInputReadOnly.set(false);
  $lastDisplayedCommand.set('');
  $terminalHistory.set([]);
  $terminalHistoryIdx.set(-1);
  $terminalHistoryVisibleIdx.set(0);
  $terminalSuggestions.set(null);
  $terminalKeyEvent.set(null);
  $terminalPromptRef.set(null);
}

describe('terminal-store', () => {
  beforeEach(async () => {
    vi.useFakeTimers();

    keepMount($terminalInput);

    await allTasks();

    await vi.runAllTimersAsync();

    resetAllStores();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanStores($terminalInput);
  });

  describe('Store Reset Behavior', () => {
    it('resets all stores to initial state after operations', () => {
      $terminalInput.set('some command');
      $terminalHistory.set([buildCommandEntry({ cmdName: Command.Help })]);
      $terminalHistoryIdx.set(0);
      $terminalSuggestions.set(['help', 'whoami']);
      $terminalInputReadOnly.set(true);

      resetAllStores();

      expect($terminalInput.get()).toBe('');
      expect($terminalHistory.get()).toEqual([]);
      expect($terminalHistoryIdx.get()).toBe(-1);
      expect($terminalHistoryVisibleIdx.get()).toBe(0);
      expect($terminalSuggestions.get()).toBeNull();
      expect($terminalInputReadOnly.get()).toBe(false);
    });

    it('maintains clean state between test operations', () => {
      $terminalInput.set('test');
      submitTerminalInput();

      resetAllStores();

      expect($terminalInput.get()).toBe('');
      expect($terminalHistory.get()).toEqual([]);
    });
  });

  describe('resetTerminalInput', () => {
    it('clears terminal input', () => {
      $terminalInput.set('some input');

      resetTerminalInput();

      expect($terminalInput.get()).toBe('');
    });

    it('resets history index to -1', () => {
      $terminalHistoryIdx.set(5);

      resetTerminalInput();

      expect($terminalHistoryIdx.get()).toBe(-1);
    });

    it('does not modify history', () => {
      const history = [buildCommandEntry({ cmdName: Command.Help })];
      $terminalHistory.set(history);

      resetTerminalInput();

      expect($terminalHistory.get()).toEqual(history);
    });
  });

  describe('submitTerminalInput', () => {
    it('adds entry to history for valid command', () => {
      $terminalInput.set('help');
      $terminalHistory.set([]);

      submitTerminalInput();

      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].cmdName).toBe(Command.Help);
    });

    it('preserves input value after submission (single-prompt model)', () => {
      $terminalInput.set('help');

      submitTerminalInput();

      expect($terminalInput.get()).toBe('help ');
    });

    it('blurs the prompt ref after submission', () => {
      const blur = vi.fn();
      $terminalPromptRef.set({
        current: {
          blur,
          focus: vi.fn(),
          scrollIntoView: vi.fn(),
          setCursorToIdx: vi.fn(),
        },
      } as unknown as {
        current: {
          blur: () => void;
          focus: () => void;
          scrollIntoView: () => void;
          setCursorToIdx: (index: number) => void;
        } | null;
      });
      $terminalInput.set('help');

      submitTerminalInput();

      expect(blur).toHaveBeenCalled();
      expect($terminalInput.get()).toBe('help ');
    });

    it('sets $lastDisplayedCommand to the submitted value before blur', () => {
      $terminalInput.set('whoami');
      $lastDisplayedCommand.set('welcome');

      submitTerminalInput();

      expect($lastDisplayedCommand.get()).toBe('whoami ');
      expect($terminalInput.get()).toBe('whoami ');
    });

    it('adds entry to existing history', () => {
      $terminalHistory.set([buildCommandEntry({ cmdName: Command.Whoami })]);
      $terminalInput.set('contact');

      submitTerminalInput();

      const history = $terminalHistory.get();
      expect(history).toHaveLength(2);
      expect(history[1].cmdName).toBe(Command.Contact);
    });

    it('handles unknown command', () => {
      $terminalInput.set('unknown-command');

      submitTerminalInput();

      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].cmdName).toBe('unknown-command');
    });

    it('handles empty input', () => {
      $terminalInput.set('');

      submitTerminalInput();

      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].cmdName).toBe('');
      expect($terminalInput.get()).toBe('');
      expect($lastDisplayedCommand.get()).toBe('');
    });

    it('appends a trailing space to the displayed value after submit', () => {
      $terminalInput.set('welcome');

      submitTerminalInput();

      expect($terminalInput.get()).toBe('welcome ');
      expect($lastDisplayedCommand.get()).toBe('welcome ');
    });

    it('does not add an extra trailing space if one is already present', () => {
      $terminalInput.set('ls -l ');

      submitTerminalInput();

      expect($terminalInput.get()).toBe('ls -l ');
      expect($lastDisplayedCommand.get()).toBe('ls -l ');
    });

    it('records the original rawInput without trailing space in history', () => {
      $terminalInput.set('welcome');

      submitTerminalInput();

      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].rawInput).toBe('welcome');
    });
  });

  describe('cd command', () => {
    const CD_ENTRIES: RepoEntry[] = [
      { path: 'README.md', type: 'blob', size: 10 },
      { path: 'src/index.ts', type: 'blob', size: 5 },
    ];

    beforeEach(() => {
      $repoTree.set({
        vfs: createVfs(CD_ENTRIES),
        commit: 'abc',
        loading: false,
        error: null,
      });
      $cwd.set('/');
      $terminalHistory.set([]);
    });

    afterEach(() => {
      $repoTree.set({ vfs: null, commit: null, loading: true, error: null });
      $cwd.set('/');
    });

    it('changes directory and records the before-cwd on the entry', () => {
      $terminalInput.set('cd src');

      submitTerminalInput();

      expect($cwd.get()).toBe('/src');
      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].cmdName).toBe(Command.Cd);
      expect(history[0].error).toBeUndefined();
      expect(history[0].cwd).toBe('/');
    });

    it('records an error and leaves cwd unchanged for a missing target', () => {
      $terminalInput.set('cd nope');

      submitTerminalInput();

      expect($cwd.get()).toBe('/');
      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].cmdName).toBe(Command.Cd);
      expect(history[0].error).toMatch(/cd:.*no such file or directory/);
      expect(history[0].cwd).toBe('/');
    });

    it('goes home on no argument from a subdirectory', () => {
      $cwd.set('/src');
      $terminalInput.set('cd');

      submitTerminalInput();

      expect($cwd.get()).toBe('/');
      const history = $terminalHistory.get();
      expect(history[0].cmdName).toBe(Command.Cd);
      expect(history[0].error).toBeUndefined();
      expect(history[0].cwd).toBe('/src');
    });
  });

  describe('History Navigation', () => {
    beforeEach(() => {
      $terminalHistory.set([
        buildCommandEntry({ cmdName: Command.Help, timestamp: 1000 }),
        buildCommandEntry({ cmdName: Command.Whoami, timestamp: 2000 }),
        buildCommandEntry({ cmdName: Command.Contact, timestamp: 3000 }),
      ]);
    });

    describe('setPreviousHistoryEntry', () => {
      it('navigates to most recent entry from initial state (idx -1)', () => {
        $terminalHistoryIdx.set(-1);

        setPreviousHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(2);
        expect($terminalInput.get()).toBe('contact');
      });

      it('navigates to previous entry', () => {
        $terminalHistoryIdx.set(2);

        setPreviousHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(1);
        expect($terminalInput.get()).toBe('whoami');
      });

      it('stops at first entry (idx 0)', () => {
        $terminalHistoryIdx.set(0);

        setPreviousHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(0);
      });

      it('does nothing with empty history', () => {
        $terminalHistory.set([]);
        $terminalHistoryIdx.set(-1);

        setPreviousHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(-1);
      });
    });

    describe('setNextHistoryEntry', () => {
      it('navigates to next entry', () => {
        $terminalHistoryIdx.set(0);

        setNextHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(1);
        expect($terminalInput.get()).toBe('whoami');
      });

      it('navigates through all entries', () => {
        $terminalHistoryIdx.set(1);

        setNextHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(2);
        expect($terminalInput.get()).toBe('contact');
      });

      it('resets at end of history', () => {
        $terminalHistoryIdx.set(2);

        setNextHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(-1);
        expect($terminalInput.get()).toBe('');
      });

      it('does nothing from initial state (idx -1)', () => {
        $terminalHistoryIdx.set(-1);

        setNextHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(-1);
      });

      it('does nothing with empty history', () => {
        $terminalHistory.set([]);
        $terminalHistoryIdx.set(-1);

        setNextHistoryEntry();

        expect($terminalHistoryIdx.get()).toBe(-1);
      });
    });
  });

  describe('autocomplete', () => {
    it('completes to single matching command', () => {
      $terminalInput.set('hel');

      autocomplete();

      expect($terminalInput.get()).toBe('help');
    });

    it('completes "who" to whoami', () => {
      $terminalInput.set('who');

      autocomplete();

      expect($terminalInput.get()).toBe('whoami');
    });

    it('shows suggestions for multiple matches', () => {
      $terminalInput.set('w');

      autocomplete();

      const suggestions = $terminalSuggestions.get();
      expect(suggestions).not.toBeNull();
      expect(suggestions?.length).toBeGreaterThan(1);
      expect(suggestions).toContain('whoami');
    });

    it('shows empty suggestions for no matches', () => {
      $terminalInput.set('xyz');

      autocomplete();

      const suggestions = $terminalSuggestions.get();
      expect(suggestions).not.toBeNull();
      expect(suggestions).toEqual([]);
    });

    it('shows all commands for empty input', () => {
      $terminalInput.set('');

      autocomplete();

      const suggestions = $terminalSuggestions.get();
      expect(suggestions).not.toBeNull();
      expect(suggestions?.length).toBeGreaterThan(1);
    });

    it('completes build-info command', () => {
      $terminalInput.set('build');

      autocomplete();

      expect($terminalInput.get()).toBe('build-info');
    });
  });

  describe('autocomplete (path completion)', () => {
    const PATH_ENTRIES: RepoEntry[] = [
      { path: 'README.md', type: 'blob', size: 100 },
      { path: 'package.json', type: 'blob', size: 50 },
      { path: 'src', type: 'tree' },
      { path: 'src/index.ts', type: 'blob', size: 20 },
      { path: 'src/app', type: 'tree' },
      { path: 'src/lib', type: 'tree' },
    ];

    beforeEach(() => {
      $repoTree.set({
        vfs: createVfs(PATH_ENTRIES),
        commit: 'abc',
        loading: false,
        error: null,
      });
      $cwd.set('/');
      $terminalInput.set('');
      $terminalSuggestions.set(null);
    });

    afterEach(() => {
      $repoTree.set({ vfs: null, commit: null, loading: true, error: null });
      $cwd.set('/');
    });

    it('completes a file path for cat', () => {
      $terminalInput.set('cat READ');

      autocomplete();

      expect($terminalInput.get()).toBe('cat README.md');
      expect($terminalSuggestions.get()).toBeNull();
    });

    it('completes a directory path for cd with a trailing slash', () => {
      $terminalInput.set('cd sr');

      autocomplete();

      expect($terminalInput.get()).toBe('cd src/');
    });

    it('cd only completes directories (files are ignored)', () => {
      $terminalInput.set('cd READ');

      autocomplete();

      expect($terminalInput.get()).toBe('cd READ');
      expect($terminalSuggestions.get()).toEqual([]);
    });

    it('shows "no match" when no file or folder matches', () => {
      $terminalInput.set('cat zzz');

      autocomplete();

      expect($terminalInput.get()).toBe('cat zzz');
      expect($terminalSuggestions.get()).toEqual([]);
    });

    it('ls completes both files and directories', () => {
      $terminalInput.set('ls sr');

      autocomplete();

      expect($terminalInput.get()).toBe('ls src/');
    });

    it('shows multiple suggestions when ambiguous', () => {
      $terminalInput.set('cat src/');

      autocomplete();

      expect($terminalInput.get()).toBe('cat src/');
      const suggestions = $terminalSuggestions.get();
      expect(suggestions).not.toBeNull();
      expect(suggestions).toEqual(
        expect.arrayContaining(['app', 'index.ts', 'lib']),
      );
    });

    it('does not path-complete non-path commands (help)', () => {
      $terminalInput.set('help READ');

      autocomplete();

      expect($terminalInput.get()).toBe('help READ');
      expect($terminalSuggestions.get()).toBeNull();
    });

    it('resolves completion relative to the current cwd', () => {
      $cwd.set('/src');
      $terminalInput.set('cat ap');

      autocomplete();

      expect($terminalInput.get()).toBe('cat app/');
    });

    it('does not complete flags', () => {
      $terminalInput.set('ls -');

      autocomplete();

      expect($terminalInput.get()).toBe('ls -');
      expect($terminalSuggestions.get()).toBeNull();
    });

    it('does nothing when the filesystem is not loaded', () => {
      $repoTree.set({ vfs: null, commit: null, loading: true, error: null });
      $terminalInput.set('cat READ');

      autocomplete();

      expect($terminalInput.get()).toBe('cat READ');
      expect($terminalSuggestions.get()).toBeNull();
    });
  });

  describe('Keyboard Event Effects', () => {
    it('submits input on Enter key', async () => {
      $terminalInput.set('help');
      $terminalHistory.set([]);

      $terminalKeyEvent.set(createMockKeyboardEvent(Key.Enter));

      await allTasks();
      await vi.runAllTimersAsync();

      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].cmdName).toBe(Command.Help);
    });

    it('does not submit when read-only', async () => {
      $terminalInput.set('help');
      $terminalInputReadOnly.set(true);
      $terminalHistory.set([]);

      $terminalKeyEvent.set(createMockKeyboardEvent(Key.Enter));

      await allTasks();
      await vi.runAllTimersAsync();

      expect($terminalHistory.get()).toHaveLength(0);
    });

    it('clears suggestions on any key event', async () => {
      $terminalSuggestions.set(['suggestion1', 'suggestion2']);

      $terminalKeyEvent.set(createMockKeyboardEvent('a'));

      await allTasks();
      await vi.runAllTimersAsync();

      expect($terminalSuggestions.get()).toBeNull();
    });

    it('resets and submits on Ctrl+C', async () => {
      $terminalInput.set('some typing');
      $terminalHistory.set([]);

      $terminalKeyEvent.set(createMockKeyboardEvent(Key.c, { ctrlKey: true }));

      await allTasks();
      await vi.runAllTimersAsync();

      expect($terminalInput.get()).toBe('');
      const history = $terminalHistory.get();
      expect(history).toHaveLength(1);
      expect(history[0].cmdName).toBe('');
    });

    it('navigates history on ArrowUp', async () => {
      $terminalHistory.set([
        buildCommandEntry({ cmdName: Command.Help }),
        buildCommandEntry({ cmdName: Command.Whoami }),
      ]);
      $terminalHistoryIdx.set(-1);

      $terminalKeyEvent.set(createMockKeyboardEvent(Key.ArrowUp));

      await allTasks();
      await vi.runAllTimersAsync();

      expect($terminalHistoryIdx.get()).toBe(1);
      expect($terminalInput.get()).toBe('whoami');
    });

    it('navigates history on ArrowDown', async () => {
      $terminalHistory.set([
        buildCommandEntry({ cmdName: Command.Help }),
        buildCommandEntry({ cmdName: Command.Whoami }),
      ]);
      $terminalHistoryIdx.set(0);

      $terminalKeyEvent.set(createMockKeyboardEvent(Key.ArrowDown));

      await allTasks();
      await vi.runAllTimersAsync();

      expect($terminalHistoryIdx.get()).toBe(1);
      expect($terminalInput.get()).toBe('whoami');
    });

    it('triggers autocomplete on Tab', async () => {
      $terminalInput.set('hel');

      const event = createMockKeyboardEvent(Key.Tab);
      $terminalKeyEvent.set(event);

      await allTasks();
      await vi.runAllTimersAsync();

      expect($terminalInput.get()).toBe('help');
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid consecutive submissions', () => {
      $terminalInput.set('help');
      submitTerminalInput();

      $terminalInput.set('whoami');
      submitTerminalInput();

      $terminalInput.set('contact');
      submitTerminalInput();

      const history = $terminalHistory.get();
      expect(history).toHaveLength(3);
      expect(history[0].cmdName).toBe(Command.Help);
      expect(history[1].cmdName).toBe(Command.Whoami);
      expect(history[2].cmdName).toBe(Command.Contact);
    });

    it('handles history navigation with commands that have options', () => {
      const entry = buildCommandEntry({
        cmdName: Command.Help,
        args: { positional: ['detailed'], flags: [], options: {} },
        rawInput: 'help detailed',
      });
      $terminalHistory.set([entry]);
      $terminalHistoryIdx.set(-1);

      setPreviousHistoryEntry();

      expect($terminalInput.get()).toBe('help detailed');
    });

    it('handles history navigation with commands that have arguments', () => {
      const entry = buildCommandEntry({
        cmdName: Command.Help,
        args: { positional: [], flags: [], options: { format: 'json' } },
        rawInput: 'help --format=json',
      });
      $terminalHistory.set([entry]);
      $terminalHistoryIdx.set(-1);

      setPreviousHistoryEntry();

      expect($terminalInput.get()).toBe('help --format=json');
    });
  });
});

describe('simulateInput function', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    keepMount($terminalInput);
    await allTasks();
    await vi.runAllTimersAsync();
    resetAllStores();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanStores($terminalInput);
  });

  it('types characters one by one with 50ms delay', async () => {
    $terminalInput.set('');
    $terminalHistory.set([]);

    simulateInput('help');

    expect($terminalInputReadOnly.get()).toBe(true);

    expect($terminalInput.get()).toBe('h');

    await vi.advanceTimersByTimeAsync(50);
    expect($terminalInput.get()).toBe('he');

    await vi.advanceTimersByTimeAsync(50);
    expect($terminalInput.get()).toBe('hel');

    await vi.advanceTimersByTimeAsync(50);
    expect($terminalInput.get()).toBe('help');

    await vi.advanceTimersByTimeAsync(50);
    // Single-prompt model: input value is preserved after submit (shows the
    // command just executed); the prompt is blurred instead of cleared.
    expect($terminalInput.get()).toBe('help ');
    expect($terminalInputReadOnly.get()).toBe(false);

    const history = $terminalHistory.get();
    expect(history).toHaveLength(1);
    expect(history[0].cmdName).toBe(Command.Help);
  });

  it('sets input to read-only during simulation', () => {
    $terminalInput.set('');
    $terminalInputReadOnly.set(false);

    simulateInput('test');

    expect($terminalInputReadOnly.get()).toBe(true);
  });

  it('releases read-only after completion', async () => {
    $terminalInput.set('');
    $terminalInputReadOnly.set(false);

    simulateInput('test');

    expect($terminalInputReadOnly.get()).toBe(true);

    await vi.advanceTimersByTimeAsync(300);

    expect($terminalInputReadOnly.get()).toBe(false);
  });

  it('clears input before starting', async () => {
    $terminalInput.set('existing text');

    simulateInput('help');

    expect($terminalInput.get()).toBe('h');
  });

  it('handles empty string', async () => {
    $terminalHistory.set([]);

    simulateInput('');

    await vi.advanceTimersByTimeAsync(100);

    expect($terminalInputReadOnly.get()).toBe(false);
    expect($terminalHistory.get()).toHaveLength(1);
  });
});
