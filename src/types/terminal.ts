import type { ComponentType } from 'react';
import type { Translator } from '@/i18n/intl';

export enum Command {
  Clear = 'clear',
  Contact = 'contact',
  Help = 'help',
  Intro = 'intro',
  Web3Mission = 'web3-mission',
  SetLang = 'set-lang',
  Whoami = 'whoami',
}

export interface CommandEntry {
  timestamp: number;
  cmdName: Command;
  output?: CommandOutput;
  option?: string;
  argName?: string;
  argValue?: string;
}

export interface CommandOutputProps {
  entry: CommandEntry;
  t: Translator;
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
}
