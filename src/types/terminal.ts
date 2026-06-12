import type { ComponentType } from 'react';

export enum Command {
  BuildInfo = 'build-info',
  Clear = 'clear',
  Contact = 'contact',
  Gallery = 'gallery',
  Help = 'help',
  Status = 'status',
  Welcome = 'welcome',
  Whoami = 'whoami',
  Resume = 'resume',
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
