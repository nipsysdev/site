import HelpOutput from '@/components/cmd-outputs/HelpOutput';
import {
  Command,
  type CommandEntry,
  type ParsedArguments,
} from '@/types/terminal';

const EMPTY_ARGS: ParsedArguments = { positional: [], flags: [], options: {} };

export function buildCommandEntry(
  overrides: Partial<CommandEntry> = {},
): CommandEntry {
  const { cmdName = Command.Help, ...rest } = overrides;
  return {
    timestamp: Date.now(),
    cmdName,
    output: HelpOutput,
    args: EMPTY_ARGS,
    rawInput: cmdName as string,
    ...rest,
  };
}
