import { Commands } from '@/constants/commands';
import type { CommandEntry, CommandOutput } from '@/types/terminal';
import { Command } from '@/types/terminal';

export function newTerminalEntry(
  name: Command,
  output?: CommandOutput,
  option?: string,
  argName?: string,
  argValue?: string,
): CommandEntry {
  return {
    cmdName: name,
    output,
    option,
    argName,
    argValue,
    timestamp: Date.now(),
  };
}

export function unrecognizedTerminalEntry(name: string): CommandEntry {
  return newTerminalEntry(name as Command);
}

export function parseTerminalEntry(entry: string): CommandEntry {
  const split = entry.split(' ');
  const cmdName =
    Command[
      (Object.entries(Command).find(([, v]) => v === split[0]) ?? [
        '',
      ])[0] as keyof typeof Command
    ];
  const cmdInfo = Commands.find((cmd) => cmd.name === cmdName);

  if (!cmdName || !cmdInfo) return unrecognizedTerminalEntry(entry);

  let option: string | undefined;
  let argName: string | undefined;
  let argValue: string | undefined;

  if (split[1]?.includes('--') && split[1]?.includes('=')) {
    const argSplit = split[1].split('=');
    argName = argSplit[0].replace('--', '');
    argValue = argSplit[1];
  } else {
    option = split[1];
  }

  return newTerminalEntry(cmdName, cmdInfo.output, option, argName, argValue);
}

export function getTerminalEntryInput(entry: CommandEntry) {
  let pastInput = entry.cmdName as string;
  if (entry.option) {
    pastInput += ` ${entry.option}`;
  }
  if (entry.argName) {
    pastInput += ` --${entry.argName}=${entry.argValue}`;
  }
  return pastInput;
}
