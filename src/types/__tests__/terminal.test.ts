import { describe, expect, it } from 'vitest';
import type {
  CommandArgument,
  CommandEntry,
  CommandInfo,
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
      expect(Command.Web2work).toBe('web2work');
      expect(Command.Web3work).toBe('web3work');
      expect(Command.Contribs).toBe('contribs');
      expect(Command.SetLang).toBe('set-lang');
      expect(Command.Whoami).toBe('whoami');
    });
  });

  describe('CommandEntry interface', () => {
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
  });

  describe('CommandArgument interface', () => {
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
