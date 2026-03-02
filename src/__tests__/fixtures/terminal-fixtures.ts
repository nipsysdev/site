import HelpOutput from '@/components/cmd-outputs/HelpOutput';
import { Command, type CommandEntry } from '@/types/terminal';

export function buildCommandEntry(
  overrides: Partial<CommandEntry> = {},
): CommandEntry {
  return {
    timestamp: Date.now(),
    cmdName: Command.Help,
    output: HelpOutput,
    ...overrides,
  };
}
