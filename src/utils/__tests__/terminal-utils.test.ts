import { describe, expect, it, vi } from 'vitest';
import type { CommandEntry } from '@/types/terminal';
import { Command } from '@/types/terminal';

// Mock the Commands array
vi.mock('@/constants/commands', () => ({
  Commands: [
    {
      name: 'clear',
    },
    {
      name: 'help',
      output: vi.fn(),
    },
    {
      name: 'contact',
      output: vi.fn(),
    },
    {
      name: 'whoami',
      output: vi.fn(),
    },
    {
      name: 'set-lang',
      options: ['en', 'fr'],
    },
  ],
}));

import {
  getTerminalEntryInput,
  newTerminalEntry,
  parseTerminalEntry,
  unrecognizedTerminalEntry,
} from '@/utils/terminal-utils';

describe('terminal-utils', () => {
  describe('newTerminalEntry', () => {
    it('should create a basic terminal entry', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = newTerminalEntry(Command.Clear);

      expect(entry).toEqual({
        cmdName: Command.Clear,
        output: undefined,
        option: undefined,
        argName: undefined,
        argValue: undefined,
        timestamp: mockDate,
      });

      vi.restoreAllMocks();
    });

    it('should create a terminal entry with output', () => {
      const mockDate = 1234567890;
      const mockOutput = vi.fn();
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = newTerminalEntry(Command.Help, mockOutput);

      expect(entry).toEqual({
        cmdName: Command.Help,
        output: mockOutput,
        option: undefined,
        argName: undefined,
        argValue: undefined,
        timestamp: mockDate,
      });

      vi.restoreAllMocks();
    });

    it('should create a terminal entry with all parameters', () => {
      const mockDate = 1234567890;
      const mockOutput = vi.fn();
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = newTerminalEntry(
        Command.SetLang,
        mockOutput,
        'en',
        'lang',
        'english',
      );

      expect(entry).toEqual({
        cmdName: Command.SetLang,
        output: mockOutput,
        option: 'en',
        argName: 'lang',
        argValue: 'english',
        timestamp: mockDate,
      });

      vi.restoreAllMocks();
    });
  });

  describe('unrecognizedTerminalEntry', () => {
    it('should create an unrecognized terminal entry', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = unrecognizedTerminalEntry('invalid-command');

      expect(entry).toEqual({
        cmdName: 'invalid-command' as Command,
        output: undefined,
        option: undefined,
        argName: undefined,
        argValue: undefined,
        timestamp: mockDate,
      });

      vi.restoreAllMocks();
    });
  });

  describe('parseTerminalEntry', () => {
    it('should parse a simple command', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = parseTerminalEntry('clear');

      expect(entry.cmdName).toBe(Command.Clear);
      expect(entry.option).toBeUndefined();
      expect(entry.argName).toBeUndefined();
      expect(entry.argValue).toBeUndefined();
      expect(entry.timestamp).toBe(mockDate);

      vi.restoreAllMocks();
    });

    it('should parse a command with option', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = parseTerminalEntry('set-lang en');

      expect(entry.cmdName).toBe(Command.SetLang);
      expect(entry.option).toBe('en');
      expect(entry.argName).toBeUndefined();
      expect(entry.argValue).toBeUndefined();
      expect(entry.timestamp).toBe(mockDate);

      vi.restoreAllMocks();
    });

    it('should parse a command with argument', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = parseTerminalEntry('set-lang --lang=french');

      expect(entry.cmdName).toBe(Command.SetLang);
      expect(entry.option).toBeUndefined();
      expect(entry.argName).toBe('lang');
      expect(entry.argValue).toBe('french');
      expect(entry.timestamp).toBe(mockDate);

      vi.restoreAllMocks();
    });

    it('should return unrecognized entry for invalid command', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = parseTerminalEntry('invalid-command');

      expect(entry.cmdName).toBe('invalid-command' as Command);
      expect(entry.option).toBeUndefined();
      expect(entry.argName).toBeUndefined();
      expect(entry.argValue).toBeUndefined();
      expect(entry.timestamp).toBe(mockDate);

      vi.restoreAllMocks();
    });

    it('should handle empty input', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = parseTerminalEntry('');

      expect(entry.cmdName).toBe('' as Command);
      expect(entry.timestamp).toBe(mockDate);

      vi.restoreAllMocks();
    });

    it('should handle command with multiple spaces', () => {
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      const entry = parseTerminalEntry('help   extra   args');

      expect(entry.cmdName).toBe(Command.Help);
      expect(entry.option).toBe(''); // split(' ') with multiple spaces creates empty strings

      vi.restoreAllMocks();
    });
  });

  describe('getTerminalEntryInput', () => {
    it('should return just command name for basic entry', () => {
      const entry: CommandEntry = {
        cmdName: Command.Clear,
        timestamp: 123456,
      };

      expect(getTerminalEntryInput(entry)).toBe('clear');
    });

    it('should return command with option', () => {
      const entry: CommandEntry = {
        cmdName: Command.SetLang,
        option: 'en',
        timestamp: 123456,
      };

      expect(getTerminalEntryInput(entry)).toBe('set-lang en');
    });

    it('should return command with argument', () => {
      const entry: CommandEntry = {
        cmdName: Command.SetLang,
        argName: 'lang',
        argValue: 'french',
        timestamp: 123456,
      };

      expect(getTerminalEntryInput(entry)).toBe('set-lang --lang=french');
    });

    it('should return command with both option and argument', () => {
      const entry: CommandEntry = {
        cmdName: Command.SetLang,
        option: 'en',
        argName: 'lang',
        argValue: 'english',
        timestamp: 123456,
      };

      expect(getTerminalEntryInput(entry)).toBe('set-lang en --lang=english');
    });

    it('should handle entry with only argName but no argValue', () => {
      const entry: CommandEntry = {
        cmdName: Command.SetLang,
        argName: 'lang',
        timestamp: 123456,
      };

      expect(getTerminalEntryInput(entry)).toBe('set-lang --lang=undefined');
    });

    it('should handle entry with only argValue but no argName', () => {
      const entry: CommandEntry = {
        cmdName: Command.SetLang,
        argValue: 'english',
        timestamp: 123456,
      };

      expect(getTerminalEntryInput(entry)).toBe('set-lang');
    });
  });
});
