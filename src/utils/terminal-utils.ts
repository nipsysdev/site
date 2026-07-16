import { Commands } from '@/constants/commands';
import type {
  CommandEntry,
  CommandOutput,
  ParsedArguments,
} from '@/types/terminal';
import { Command } from '@/types/terminal';

const EMPTY_ARGS: ParsedArguments = { positional: [], flags: [], options: {} };

export function newTerminalEntry(
  name: Command,
  output?: CommandOutput,
  args: ParsedArguments = EMPTY_ARGS,
  rawInput = '',
): CommandEntry {
  return { cmdName: name, output, args, rawInput, timestamp: Date.now() };
}

export function unrecognizedTerminalEntry(name: string): CommandEntry {
  return {
    cmdName: name as Command,
    output: undefined,
    args: { positional: [], flags: [], options: {} },
    rawInput: name,
    timestamp: Date.now(),
  };
}

/** Split an input line into tokens, respecting single and double quotes and collapsing whitespace. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === ' ' && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

/** Parse the non-command tokens into positional args, flags, and options (getopt-style). */
export function parseArguments(tokens: string[]): ParsedArguments {
  const positional: string[] = [];
  const flags: string[] = [];
  const options: Record<string, string> = {};
  let endOfOptions = false;
  for (const token of tokens) {
    if (endOfOptions) {
      positional.push(token);
      continue;
    }
    if (token === '--') {
      endOfOptions = true;
      continue;
    }
    if (token.startsWith('--')) {
      const body = token.slice(2);
      const eq = body.indexOf('=');
      if (eq >= 0) {
        options[body.slice(0, eq)] = body.slice(eq + 1);
      } else {
        flags.push(body);
      }
      continue;
    }
    if (token.startsWith('-') && token.length > 1) {
      for (const c of token.slice(1)) flags.push(c);
      continue;
    }
    positional.push(token);
  }
  return { positional, flags, options };
}

export function parseTerminalEntry(entry: string): CommandEntry {
  const raw = entry.trim();
  const tokens = tokenize(raw);
  const cmdToken = tokens[0] ?? '';
  const cmdName = Object.values(Command).find((v) => v === cmdToken) as
    | Command
    | undefined;
  const cmdInfo = cmdName
    ? Commands.find((cmd) => cmd.name === cmdName)
    : undefined;

  if (!cmdName || !cmdInfo) {
    return unrecognizedTerminalEntry(raw);
  }
  return {
    cmdName,
    output: cmdInfo.output,
    args: parseArguments(tokens.slice(1)),
    rawInput: raw,
    timestamp: Date.now(),
  };
}

export function getTerminalEntryInput(entry: CommandEntry): string {
  return entry.rawInput || (entry.cmdName as string);
}

export function getDisplayHost(): string {
  if (typeof window === 'undefined') {
    return 'localhost';
  }
  const fullHost = window.location.host.split(':')[0];
  if (fullHost.includes('ipns') || fullHost.includes('ipfs')) {
    const parts = fullHost.split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : fullHost;
  }
  return fullHost;
}

export function getPastInputStr(entry: CommandEntry): string {
  return entry.rawInput || (entry.cmdName as string);
}

/** True if the name matches a registered command (vs. unrecognized free text). */
export function isRecognizedCommand(name: Command): boolean {
  return Commands.some((cmd) => cmd.name === name);
}
