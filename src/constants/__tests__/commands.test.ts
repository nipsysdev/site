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
  });
});
