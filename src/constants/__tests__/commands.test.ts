import { describe, expect, it } from 'vitest';
import { Commands } from '@/constants/commands';
import { Command } from '@/types/terminal';

describe('commands', () => {
  describe('Commands array', () => {
    it('should contain all expected commands', () => {
      const commandNames = Commands.map((cmd) => cmd.name);

      expect(commandNames).toContain(Command.Clear);
      expect(commandNames).toContain(Command.Contact);
      expect(commandNames).toContain(Command.Help);
      expect(commandNames).toContain(Command.Intro);
      expect(commandNames).toContain(Command.SetLang);
      expect(commandNames).toContain(Command.Whoami);
      expect(commandNames).toContain(Command.Web3Mission);
    });

    it('should have correct structure for Clear command', () => {
      const clearCommand = Commands.find((cmd) => cmd.name === Command.Clear);

      expect(clearCommand).toBeDefined();
      expect(clearCommand?.name).toBe(Command.Clear);
      expect(clearCommand?.output).toBeUndefined();
    });

    it('should have output for commands that need it', () => {
      const commandsWithOutput = [
        Command.Contact,
        Command.Help,
        Command.Intro,
        Command.Whoami,
        Command.Web3Mission,
      ];

      commandsWithOutput.forEach((cmdName) => {
        const command = Commands.find((cmd) => cmd.name === cmdName);
        expect(command?.output).toBeDefined();
      });
    });

    it('should have options for SetLang command', () => {
      const setLangCommand = Commands.find(
        (cmd) => cmd.name === Command.SetLang,
      );

      expect(setLangCommand).toBeDefined();
      expect(setLangCommand?.options).toBeDefined();
      expect(Array.isArray(setLangCommand?.options)).toBe(true);
      expect(setLangCommand?.options?.length).toBeGreaterThan(0);
    });

    it('should not have duplicate commands', () => {
      const commandNames = Commands.map((cmd) => cmd.name);
      const uniqueCommandNames = [...new Set(commandNames)];

      expect(commandNames.length).toBe(uniqueCommandNames.length);
    });

    it('should have valid command names that match Command enum', () => {
      const validCommands = Object.values(Command);

      Commands.forEach((cmd) => {
        expect(validCommands).toContain(cmd.name);
      });
    });

    it('should have all commands from Command enum', () => {
      const commandNames = Commands.map((cmd) => cmd.name);
      const enumCommands = Object.values(Command);

      enumCommands.forEach((enumCmd) => {
        expect(commandNames).toContain(enumCmd);
      });
    });
  });
});
