import { describe, expect, it } from 'vitest';
import type {
  CommandArgument,
  CommandEntry,
  CommandInfo,
  CommandOutputProps,
} from '@/types/terminal';
import { Command } from '@/types/terminal';

describe('terminal types', () => {
  describe('Command enum', () => {
    it('should have all expected command values', () => {
      expect(Command.BuildInfo).toBe('build-info');
      expect(Command.Clear).toBe('clear');
      expect(Command.Contact).toBe('contact');
      expect(Command.Help).toBe('help');
      expect(Command.Intro).toBe('intro');
      expect(Command.Web3Mission).toBe('web3-mission');
      expect(Command.SetLang).toBe('set-lang');
      expect(Command.Whoami).toBe('whoami');
    });

    it('should have exactly 8 commands', () => {
      const commandValues = Object.values(Command);
      expect(commandValues).toHaveLength(8);
    });

    it('should have string values for all commands', () => {
      Object.values(Command).forEach((command) => {
        expect(typeof command).toBe('string');
        expect(command.length).toBeGreaterThan(0);
      });
    });

    it('should use kebab-case for multi-word commands', () => {
      expect(Command.Web3Mission).toBe('web3-mission');
      expect(Command.SetLang).toBe('set-lang');
    });

    it('should not have duplicate values', () => {
      const commandValues = Object.values(Command);
      const uniqueValues = [...new Set(commandValues)];
      expect(commandValues.length).toBe(uniqueValues.length);
    });
  });

  describe('CommandEntry interface', () => {
    it('should accept valid CommandEntry object', () => {
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Clear,
      };

      expect(entry.timestamp).toBeTypeOf('number');
      expect(entry.cmdName).toBe(Command.Clear);
    });

    it('should accept CommandEntry with all optional properties', () => {
      const mockOutput = () => null;

      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Help,
        output: mockOutput,
        option: 'test-option',
        argName: 'test-arg',
        argValue: 'test-value',
      };

      expect(entry.output).toBe(mockOutput);
      expect(entry.option).toBe('test-option');
      expect(entry.argName).toBe('test-arg');
      expect(entry.argValue).toBe('test-value');
    });

    it('should work with numeric argValue', () => {
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.SetLang,
        argValue: '123',
      };

      expect(entry.argValue).toBe('123');
    });
  });

  describe('CommandOutputProps interface', () => {
    it('should accept valid CommandOutputProps object', () => {
      const mockTranslator = (key: string) => key;
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Help,
      };

      const props: CommandOutputProps = {
        entry,
        t: mockTranslator,
      };

      expect(props.entry).toBe(entry);
      expect(props.t).toBe(mockTranslator);
      expect(typeof props.t).toBe('function');
    });
  });

  describe('CommandArgument interface', () => {
    it('should accept valid CommandArgument object', () => {
      const arg: CommandArgument = {
        name: 'language',
      };

      expect(arg.name).toBe('language');
      expect(arg.options).toBeUndefined();
    });

    it('should accept CommandArgument with options', () => {
      const arg: CommandArgument = {
        name: 'language',
        options: ['en', 'fr', 'de'],
      };

      expect(arg.name).toBe('language');
      expect(Array.isArray(arg.options)).toBe(true);
      expect(arg.options).toHaveLength(3);
    });
  });

  describe('CommandInfo interface', () => {
    it('should accept valid CommandInfo object with minimal properties', () => {
      const info: CommandInfo = {
        name: Command.Clear,
      };

      expect(info.name).toBe(Command.Clear);
      expect(info.output).toBeUndefined();
      expect(info.arguments).toBeUndefined();
      expect(info.options).toBeUndefined();
    });

    it('should accept CommandInfo with all properties', () => {
      const mockOutput = () => null;
      const mockArguments: CommandArgument[] = [
        { name: 'lang', options: ['en', 'fr'] },
      ];

      const info: CommandInfo = {
        name: Command.SetLang,
        output: mockOutput,
        arguments: mockArguments,
        options: ['en', 'fr'],
      };

      expect(info.name).toBe(Command.SetLang);
      expect(info.output).toBe(mockOutput);
      expect(info.arguments).toBe(mockArguments);
      expect(Array.isArray(info.options)).toBe(true);
    });
  });
});
