import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HelpOutput from '@/components/cmd-outputs/HelpOutput';
import { Command, type CommandEntry } from '@/types/terminal';
import {
  getDisplayHost,
  getPastInputStr,
  getTerminalEntryInput,
  isRecognizedCommand,
  newTerminalEntry,
  parseArguments,
  parseTerminalEntry,
  tokenize,
  unrecognizedTerminalEntry,
} from '@/utils/terminal-utils';

describe('terminal-utils', () => {
  describe('Entry Creation Functions', () => {
    describe('newTerminalEntry', () => {
      it('creates entry with all fields provided', () => {
        const beforeTime = Date.now();
        const entry = newTerminalEntry(
          Command.Help,
          HelpOutput,
          { positional: ['detailed'], flags: [], options: { format: 'json' } },
          'help detailed --format=json',
        );
        const afterTime = Date.now();

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.output).toBe(HelpOutput);
        expect(entry.args.positional).toEqual(['detailed']);
        expect(entry.args.options).toEqual({ format: 'json' });
        expect(entry.rawInput).toBe('help detailed --format=json');
        expect(entry.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(entry.timestamp).toBeLessThanOrEqual(afterTime);
      });

      it('creates entry with minimal fields (command only)', () => {
        const entry = newTerminalEntry(Command.Welcome);

        expect(entry.cmdName).toBe(Command.Welcome);
        expect(entry.output).toBeUndefined();
        expect(entry.args.positional).toEqual([]);
        expect(entry.args.flags).toEqual([]);
        expect(entry.args.options).toEqual({});
        expect(entry.rawInput).toBe('');
      });

      it('creates entry with command and output only', () => {
        const entry = newTerminalEntry(Command.Help, HelpOutput);

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.output).toBe(HelpOutput);
        expect(entry.args.positional).toEqual([]);
        expect(entry.rawInput).toBe('');
      });

      it('creates entry with command and args only', () => {
        const entry = newTerminalEntry(Command.Help, undefined, {
          positional: ['verbose'],
          flags: [],
          options: {},
        });

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.output).toBeUndefined();
        expect(entry.args.positional).toEqual(['verbose']);
      });

      it('always includes a timestamp', () => {
        const entry = newTerminalEntry(Command.Help);
        expect(entry.timestamp).toBeTypeOf('number');
        expect(entry.timestamp).toBeGreaterThan(0);
      });
    });

    describe('unrecognizedTerminalEntry', () => {
      it('creates entry with unknown command name', () => {
        const entry = unrecognizedTerminalEntry('foobar');

        expect(entry.cmdName).toBe('foobar');
        expect(entry.output).toBeUndefined();
        expect(entry.args.positional).toEqual([]);
        expect(entry.args.flags).toEqual([]);
        expect(entry.args.options).toEqual({});
        expect(entry.rawInput).toBe('foobar');
      });

      it('creates entry with empty string command', () => {
        const entry = unrecognizedTerminalEntry('');

        expect(entry.cmdName).toBe('');
        expect(entry.output).toBeUndefined();
        expect(entry.rawInput).toBe('');
      });

      it('creates entry with special characters in command', () => {
        const entry = unrecognizedTerminalEntry('foo-bar-baz');

        expect(entry.cmdName).toBe('foo-bar-baz');
        expect(entry.rawInput).toBe('foo-bar-baz');
      });

      it('includes timestamp', () => {
        const entry = unrecognizedTerminalEntry('unknown');
        expect(entry.timestamp).toBeTypeOf('number');
      });

      it('has empty args and rawInput equal to name', () => {
        const entry = unrecognizedTerminalEntry('not-a-command');

        expect(entry.args).toEqual({
          positional: [],
          flags: [],
          options: {},
        });
        expect(entry.rawInput).toBe('not-a-command');
      });
    });
  });

  describe('tokenize', () => {
    it('splits simple space-separated tokens', () => {
      expect(tokenize('help detailed')).toEqual(['help', 'detailed']);
    });

    it('collapses multiple spaces', () => {
      expect(tokenize('help   detailed')).toEqual(['help', 'detailed']);
    });

    it('handles leading and trailing whitespace', () => {
      expect(tokenize('  help  ')).toEqual(['help']);
    });

    it('respects single quotes', () => {
      expect(tokenize("cat 'my file.txt'")).toEqual(['cat', 'my file.txt']);
    });

    it('respects double quotes', () => {
      expect(tokenize('cat "my file.txt"')).toEqual(['cat', 'my file.txt']);
    });

    it('returns empty array for empty string', () => {
      expect(tokenize('')).toEqual([]);
    });

    it('returns empty array for whitespace-only string', () => {
      expect(tokenize('   ')).toEqual([]);
    });

    it('preserves single quotes inside double quotes', () => {
      expect(tokenize('echo "it\'s here"')).toEqual(['echo', "it's here"]);
    });

    it('preserves double quotes inside single quotes', () => {
      expect(tokenize('echo \'say "hi"\'')).toEqual(['echo', 'say "hi"']);
    });
  });

  describe('parseArguments', () => {
    it('returns positional args only', () => {
      expect(parseArguments(['src', 'app', 'page.tsx'])).toEqual({
        positional: ['src', 'app', 'page.tsx'],
        flags: [],
        options: {},
      });
    });

    it('splits grouped short flags -la into [l, a]', () => {
      expect(parseArguments(['-la'])).toEqual({
        positional: [],
        flags: ['l', 'a'],
        options: {},
      });
    });

    it('handles separate short flags -l -a', () => {
      expect(parseArguments(['-l', '-a'])).toEqual({
        positional: [],
        flags: ['l', 'a'],
        options: {},
      });
    });

    it('handles long flag --all', () => {
      expect(parseArguments(['--all'])).toEqual({
        positional: [],
        flags: ['all'],
        options: {},
      });
    });

    it('handles key=value option --key=value', () => {
      expect(parseArguments(['--format=json'])).toEqual({
        positional: [],
        flags: [],
        options: { format: 'json' },
      });
    });

    it('treats -- as end-of-options marker', () => {
      expect(parseArguments(['--', '--weird', '-x'])).toEqual({
        positional: ['--weird', '-x'],
        flags: [],
        options: {},
      });
    });

    it('mixes grouped short flags and positional args', () => {
      expect(parseArguments(['-la', 'src'])).toEqual({
        positional: ['src'],
        flags: ['l', 'a'],
        options: {},
      });
    });

    it('combines flags, options, and positional args', () => {
      expect(parseArguments(['-l', '--format=json', 'src'])).toEqual({
        positional: ['src'],
        flags: ['l'],
        options: { format: 'json' },
      });
    });

    it('returns empty result for empty tokens', () => {
      expect(parseArguments([])).toEqual({
        positional: [],
        flags: [],
        options: {},
      });
    });

    it('treats a lone dash as a positional arg', () => {
      expect(parseArguments(['-'])).toEqual({
        positional: ['-'],
        flags: [],
        options: {},
      });
    });
  });

  describe('Entry Parsing Functions', () => {
    describe('parseTerminalEntry', () => {
      it('parses help command', () => {
        const entry = parseTerminalEntry('help');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.args.positional).toEqual([]);
      });

      it('parses whoami command', () => {
        expect(parseTerminalEntry('whoami').cmdName).toBe(Command.Whoami);
      });

      it('parses contact command', () => {
        expect(parseTerminalEntry('contact').cmdName).toBe(Command.Contact);
      });

      it('parses build-info command', () => {
        expect(parseTerminalEntry('build-info').cmdName).toBe(
          Command.BuildInfo,
        );
      });

      it('parses welcome command', () => {
        expect(parseTerminalEntry('welcome').cmdName).toBe(Command.Welcome);
      });

      it('parses status command', () => {
        expect(parseTerminalEntry('status').cmdName).toBe(Command.Status);
      });

      it('parses gallery command', () => {
        expect(parseTerminalEntry('gallery').cmdName).toBe(Command.Gallery);
      });

      it('parses resume command', () => {
        expect(parseTerminalEntry('resume').cmdName).toBe(Command.Resume);
      });

      it('parses command with positional arg', () => {
        const entry = parseTerminalEntry('help detailed');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.args.positional).toEqual(['detailed']);
      });

      it('parses command with --key=value option', () => {
        const entry = parseTerminalEntry('help --format=json');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.args.options).toEqual({ format: 'json' });
      });

      it('returns unrecognized entry for unknown command', () => {
        const entry = parseTerminalEntry('foobar');

        expect(entry.cmdName).toBe('foobar');
        expect(entry.output).toBeUndefined();
      });

      it('returns full trimmed input as cmdName for unknown multi-word command', () => {
        const entry = parseTerminalEntry('foo bar');

        expect(entry.cmdName).toBe('foo bar');
      });

      it('handles empty string', () => {
        const entry = parseTerminalEntry('');

        expect(entry.cmdName).toBe('');
        expect(entry.output).toBeUndefined();
      });

      it('handles whitespace-only string', () => {
        const entry = parseTerminalEntry('   ');

        expect(entry.cmdName).toBe('');
      });

      it('collapses multiple spaces between tokens', () => {
        const entry = parseTerminalEntry('help   detailed');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.args.positional).toEqual(['detailed']);
      });

      it('parses Unix-style grouped short flags -la src via a registered command', () => {
        const entry = parseTerminalEntry('help -la src');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.args.flags).toEqual(['l', 'a']);
        expect(entry.args.positional).toEqual(['src']);
      });

      it('parses ls -la src into command, flags, and positional', () => {
        const entry = parseTerminalEntry('ls -la src');

        expect(entry.cmdName).toBe(Command.Ls);
        expect(entry.args.flags).toEqual(['l', 'a']);
        expect(entry.args.positional).toEqual(['src']);
      });

      it('parses cat with a file path positional arg', () => {
        const entry = parseTerminalEntry('cat src/app/page.tsx');

        expect(entry.cmdName).toBe(Command.Cat);
        expect(entry.args.positional).toEqual(['src/app/page.tsx']);
      });

      it('parses cd with a relative target positional arg', () => {
        const entry = parseTerminalEntry('cd ../lib');

        expect(entry.cmdName).toBe(Command.Cd);
        expect(entry.args.positional).toEqual(['../lib']);
      });

      it('parses quoted file path as single positional arg via a registered command', () => {
        const entry = parseTerminalEntry('help "my file.txt"');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.args.positional).toEqual(['my file.txt']);
      });

      it('respects -- end-of-options marker via a registered command', () => {
        const entry = parseTerminalEntry('help -- --weird');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.args.flags).toEqual([]);
        expect(entry.args.positional).toEqual(['--weird']);
      });

      it('includes timestamp in parsed entry', () => {
        const entry = parseTerminalEntry('help');
        expect(entry.timestamp).toBeTypeOf('number');
      });

      it('sets rawInput equal to trimmed input', () => {
        const entry = parseTerminalEntry('  help detailed  ');

        expect(entry.rawInput).toBe('help detailed');
      });

      it('attaches the registered output component for valid commands', () => {
        const entry = parseTerminalEntry('help');
        expect(entry.output).toBe(HelpOutput);
      });
    });
  });

  describe('Input String Functions', () => {
    describe('getTerminalEntryInput', () => {
      it('returns rawInput when present', () => {
        const entry = {
          cmdName: Command.Help,
          args: { positional: [], flags: [], options: {} },
          rawInput: 'help detailed --format=json',
          timestamp: Date.now(),
        };

        expect(getTerminalEntryInput(entry)).toBe(
          'help detailed --format=json',
        );
      });

      it('falls back to cmdName when rawInput is empty', () => {
        const entry = {
          cmdName: Command.Help,
          args: { positional: [], flags: [], options: {} },
          rawInput: '',
          timestamp: Date.now(),
        };

        expect(getTerminalEntryInput(entry)).toBe('help');
      });
    });

    describe('getPastInputStr', () => {
      it('returns rawInput when present', () => {
        const entry = {
          cmdName: Command.Help,
          args: { positional: [], flags: [], options: {} },
          rawInput: 'help detailed',
          timestamp: Date.now(),
        };

        expect(getPastInputStr(entry)).toBe('help detailed');
      });

      it('falls back to cmdName when rawInput is empty', () => {
        const entry = {
          cmdName: Command.Help,
          args: { positional: [], flags: [], options: {} },
          rawInput: '',
          timestamp: Date.now(),
        };

        expect(getPastInputStr(entry)).toBe('help');
      });
    });

    describe('getTerminalEntryInput and getPastInputStr parity', () => {
      it('match each other for several entries', () => {
        const entries: CommandEntry[] = [
          {
            cmdName: Command.Help,
            args: { positional: [], flags: [], options: {} },
            rawInput: 'help',
            timestamp: Date.now(),
          },
          {
            cmdName: Command.Help,
            args: {
              positional: ['detailed'],
              flags: [],
              options: {},
            },
            rawInput: 'help detailed',
            timestamp: Date.now(),
          },
          {
            cmdName: Command.Help,
            args: {
              positional: [],
              flags: [],
              options: { format: 'json' },
            },
            rawInput: '',
            timestamp: Date.now(),
          },
        ];

        for (const entry of entries) {
          expect(getPastInputStr(entry)).toBe(getTerminalEntryInput(entry));
        }
      });
    });
  });

  describe('isRecognizedCommand', () => {
    it('returns true for a registered command', () => {
      expect(isRecognizedCommand(Command.Help)).toBe(true);
    });

    it('returns true for the repo-browsing commands', () => {
      expect(isRecognizedCommand(Command.Pwd)).toBe(true);
      expect(isRecognizedCommand(Command.Ls)).toBe(true);
      expect(isRecognizedCommand(Command.Cd)).toBe(true);
      expect(isRecognizedCommand(Command.Cat)).toBe(true);
    });

    it('returns false for an unrecognized cast string', () => {
      expect(isRecognizedCommand('foobar' as Command)).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isRecognizedCommand('' as Command)).toBe(false);
    });
  });

  describe('Display Host Functions', () => {
    describe('getDisplayHost', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
      });

      it('returns localhost when window is undefined (server-side)', () => {
        vi.stubGlobal('window', undefined);

        expect(getDisplayHost()).toBe('localhost');
      });

      it('returns full host for regular domains', () => {
        vi.stubGlobal('window', {
          location: { host: 'xav.gwei.site:443' },
        });

        expect(getDisplayHost()).toBe('xav.gwei.site');
      });

      it('returns host without port when no port specified', () => {
        vi.stubGlobal('window', {
          location: { host: 'xav.gwei.site' },
        });

        expect(getDisplayHost()).toBe('xav.gwei.site');
      });

      it('strips first part from IPNS hosts', () => {
        vi.stubGlobal('window', {
          location: {
            host: 'k51qzi5uqu5dkkciu33khkzbcmxtyhn2i3v.ipns.xav.gwei.site',
          },
        });

        expect(getDisplayHost()).toBe('ipns.xav.gwei.site');
      });

      it('strips first part from IPFS hosts', () => {
        vi.stubGlobal('window', {
          location: {
            host: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.xav.gwei.site',
          },
        });

        expect(getDisplayHost()).toBe('ipfs.xav.gwei.site');
      });

      it('returns full host when IPNS/IPFS but no subdomain parts', () => {
        vi.stubGlobal('window', {
          location: {
            host: 'ipns.xav.gwei.site',
          },
        });

        expect(getDisplayHost()).toBe('xav.gwei.site');
      });

      it('handles localhost with port', () => {
        vi.stubGlobal('window', {
          location: { host: 'localhost:3000' },
        });

        expect(getDisplayHost()).toBe('localhost');
      });
    });
  });
});
