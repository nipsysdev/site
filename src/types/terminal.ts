import type { ComponentType } from 'react';

export enum Command {
  BuildInfo = 'build-info',
  Cat = 'cat',
  Cd = 'cd',
  Contact = 'contact',
  Gallery = 'gallery',
  Help = 'help',
  Ls = 'ls',
  Pwd = 'pwd',
  Resume = 'resume',
  Status = 'status',
  Welcome = 'welcome',
  Whoami = 'whoami',
}

export interface ParsedArguments {
  /** Positional operands, e.g. file/directory paths. 'src' in `ls src` */
  positional: string[];
  /** Boolean flags, normalized without dashes: 'l' from -l or -la; 'all' from --all */
  flags: string[];
  /** Key-value options: { format: 'json' } from --format=json */
  options: Record<string, string>;
}

export interface CommandEntry {
  timestamp: number;
  cmdName: Command;
  output?: CommandOutput;
  args: ParsedArguments;
  rawInput: string;
  /** Working directory at submit time — used to render the per-line prompt path. */
  cwd?: string;
  /** Command error surfaced to the terminal (e.g. cd failures). */
  error?: string;
}

export interface CommandOutputProps {
  entry: CommandEntry;
}

export type CommandOutput = ComponentType<CommandOutputProps>;

export interface CommandArgument {
  name: string;
  options?: string[];
}

export interface CommandInfo {
  name: Command;
  output?: CommandOutput;
  arguments?: CommandArgument[];
  options?: string[];
  /** Positional argument hint shown after the command name, e.g. "[path]" or "<file>". */
  usage?: string;
}
