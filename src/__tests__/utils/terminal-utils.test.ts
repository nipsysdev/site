import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HelpOutput from '@/components/cmd-outputs/HelpOutput';
import { Command } from '@/types/terminal';
import {
  getDisplayHost,
  getPastInputStr,
  getTerminalEntryInput,
  newTerminalEntry,
  parseTerminalEntry,
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
          'detailed',
          'format',
          'json',
        );
        const afterTime = Date.now();

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.output).toBe(HelpOutput);
        expect(entry.option).toBe('detailed');
        expect(entry.argName).toBe('format');
        expect(entry.argValue).toBe('json');
        expect(entry.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(entry.timestamp).toBeLessThanOrEqual(afterTime);
      });

      it('creates entry with minimal fields (command only)', () => {
        const entry = newTerminalEntry(Command.Welcome);

        expect(entry.cmdName).toBe(Command.Welcome);
        expect(entry.output).toBeUndefined();
        expect(entry.option).toBeUndefined();
        expect(entry.argName).toBeUndefined();
        expect(entry.argValue).toBeUndefined();
      });

      it('creates entry with command and output only', () => {
        const entry = newTerminalEntry(Command.Help, HelpOutput);

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.output).toBe(HelpOutput);
        expect(entry.option).toBeUndefined();
        expect(entry.argName).toBeUndefined();
      });

      it('creates entry with command and option only', () => {
        const entry = newTerminalEntry(Command.Help, undefined, 'verbose');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.output).toBeUndefined();
        expect(entry.option).toBe('verbose');
      });

      it('creates entry with command and argument', () => {
        const entry = newTerminalEntry(
          Command.Help,
          undefined,
          undefined,
          'format',
          'json',
        );

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.argName).toBe('format');
        expect(entry.argValue).toBe('json');
        expect(entry.option).toBeUndefined();
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
        expect(entry.option).toBeUndefined();
        expect(entry.argName).toBeUndefined();
        expect(entry.argValue).toBeUndefined();
      });

      it('creates entry with empty string command', () => {
        const entry = unrecognizedTerminalEntry('');

        expect(entry.cmdName).toBe('');
        expect(entry.output).toBeUndefined();
      });

      it('creates entry with special characters in command', () => {
        const entry = unrecognizedTerminalEntry('foo-bar-baz');

        expect(entry.cmdName).toBe('foo-bar-baz');
      });

      it('includes timestamp', () => {
        const entry = unrecognizedTerminalEntry('unknown');
        expect(entry.timestamp).toBeTypeOf('number');
      });
    });
  });

  describe('Entry Parsing Functions', () => {
    describe('parseTerminalEntry', () => {
      it('parses simple command without options or arguments', () => {
        const entry = parseTerminalEntry('help');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.option).toBeUndefined();
        expect(entry.argName).toBeUndefined();
        expect(entry.argValue).toBeUndefined();
      });

      it('parses command with option', () => {
        const entry = parseTerminalEntry('help detailed');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.option).toBe('detailed');
        expect(entry.argName).toBeUndefined();
      });

      it('parses command with argument using --name=value syntax', () => {
        const entry = parseTerminalEntry('help --format=json');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.argName).toBe('format');
        expect(entry.argValue).toBe('json');
        expect(entry.option).toBeUndefined();
      });

      it('returns unrecognized entry for unknown command', () => {
        const entry = parseTerminalEntry('foobar');

        expect(entry.cmdName).toBe('foobar');
        expect(entry.output).toBeUndefined();
      });

      it('handles empty string', () => {
        const entry = parseTerminalEntry('');

        expect(entry.cmdName).toBe('');
        expect(entry.output).toBeUndefined();
      });

      it('handles command with multiple spaces', () => {
        const entry = parseTerminalEntry('help   detailed');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.option).toBe(''); // Empty string from split
      });

      it('parses whoami command', () => {
        const entry = parseTerminalEntry('whoami');

        expect(entry.cmdName).toBe(Command.Whoami);
      });

      it('parses contact command', () => {
        const entry = parseTerminalEntry('contact');

        expect(entry.cmdName).toBe(Command.Contact);
      });

      it('parses contribs command', () => {
        const entry = parseTerminalEntry('contribs');

        expect(entry.cmdName).toBe(Command.Contribs);
      });

      it('parses web2work command', () => {
        const entry = parseTerminalEntry('web2work');

        expect(entry.cmdName).toBe(Command.Web2work);
      });

      it('parses web3work command', () => {
        const entry = parseTerminalEntry('web3work');

        expect(entry.cmdName).toBe(Command.Web3work);
      });

      it('parses build-info command', () => {
        const entry = parseTerminalEntry('build-info');

        expect(entry.cmdName).toBe(Command.BuildInfo);
      });

      it('parses clear command', () => {
        const entry = parseTerminalEntry('clear');

        expect(entry.cmdName).toBe(Command.Clear);
      });

      it('parses welcome command', () => {
        const entry = parseTerminalEntry('welcome');

        expect(entry.cmdName).toBe(Command.Welcome);
      });

      it('correctly processes help command with output', () => {
        const entry = parseTerminalEntry('help');

        expect(entry.cmdName).toBe(Command.Help);
        expect(entry.timestamp).toBeTypeOf('number');
      });

      it('includes timestamp in parsed entry', () => {
        const entry = parseTerminalEntry('help');
        expect(entry.timestamp).toBeTypeOf('number');
      });
    });
  });

  describe('Input String Functions', () => {
    describe('getTerminalEntryInput', () => {
      it('returns command name only for simple entry', () => {
        const entry = {
          cmdName: Command.Help,
          timestamp: Date.now(),
        };

        expect(getTerminalEntryInput(entry)).toBe('help');
      });

      it('includes option when present', () => {
        const entry = {
          cmdName: Command.Help,
          option: 'detailed',
          timestamp: Date.now(),
        };

        expect(getTerminalEntryInput(entry)).toBe('help detailed');
      });

      it('includes argument when present', () => {
        const entry = {
          cmdName: Command.Help,
          argName: 'format',
          argValue: 'json',
          timestamp: Date.now(),
        };

        expect(getTerminalEntryInput(entry)).toBe('help --format=json');
      });

      it('includes both option and argument when present', () => {
        const entry = {
          cmdName: Command.Help,
          option: 'detailed',
          argName: 'format',
          argValue: 'json',
          timestamp: Date.now(),
        };

        expect(getTerminalEntryInput(entry)).toBe(
          'help detailed --format=json',
        );
      });
    });

    describe('getPastInputStr', () => {
      it('returns command name only for simple entry', () => {
        const entry = {
          cmdName: Command.Help,
          timestamp: Date.now(),
        };

        expect(getPastInputStr(entry)).toBe('help');
      });

      it('includes option when present', () => {
        const entry = {
          cmdName: Command.Help,
          option: 'detailed',
          timestamp: Date.now(),
        };

        expect(getPastInputStr(entry)).toBe('help detailed');
      });

      it('includes argument when present', () => {
        const entry = {
          cmdName: Command.Help,
          argName: 'format',
          argValue: 'json',
          timestamp: Date.now(),
        };

        expect(getPastInputStr(entry)).toBe('help --format=json');
      });

      it('matches getTerminalEntryInput behavior', () => {
        const entries = [
          { cmdName: Command.Help, timestamp: Date.now() },
          { cmdName: Command.Help, option: 'detailed', timestamp: Date.now() },
          {
            cmdName: Command.Help,
            argName: 'format',
            argValue: 'json',
            timestamp: Date.now(),
          },
        ];

        for (const entry of entries) {
          expect(getPastInputStr(entry)).toBe(getTerminalEntryInput(entry));
        }
      });
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
          location: { host: 'nipsys.dev:443' },
        });

        expect(getDisplayHost()).toBe('nipsys.dev');
      });

      it('returns host without port when no port specified', () => {
        vi.stubGlobal('window', {
          location: { host: 'nipsys.dev' },
        });

        expect(getDisplayHost()).toBe('nipsys.dev');
      });

      it('strips first part from IPNS hosts', () => {
        vi.stubGlobal('window', {
          location: {
            host: 'k51qzi5uqu5dkkciu33khkzbcmxtyhn2i3v.ipns.nipsys.dev',
          },
        });

        expect(getDisplayHost()).toBe('ipns.nipsys.dev');
      });

      it('strips first part from IPFS hosts', () => {
        vi.stubGlobal('window', {
          location: {
            host: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.nipsys.dev',
          },
        });

        expect(getDisplayHost()).toBe('ipfs.nipsys.dev');
      });

      it('returns full host when IPNS/IPFS but no subdomain parts', () => {
        vi.stubGlobal('window', {
          location: {
            host: 'ipns.nipsys.dev',
          },
        });

        expect(getDisplayHost()).toBe('nipsys.dev');
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
