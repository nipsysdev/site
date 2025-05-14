import { Translator } from '@/i18n/intl'
import { ComponentType } from 'react'

export enum Command {
  Clear = 'clear',
  Contact = 'contact',
  Help = 'help',
  Intro = 'intro',
  Mission = 'mission',
  SetLang = 'set-lang',
  Whoami = 'whoami',
}

export interface CommandEntry {
  timestamp: number
  cmdName: Command
  output?: CommandOutput
  fullscreen?: boolean
  option?: string
  argName?: string
  argValue?: string
}

export interface CommandOutputProps {
  entry: CommandEntry
  t: Translator
}

export type CommandOutput = ComponentType<CommandOutputProps>

export interface CommandArgument {
  name: string
  options?: string[]
}

export interface CommandInfo {
  name: Command
  output?: CommandOutput
  fullscreen?: boolean
  arguments?: CommandArgument[]
  options?: string[]
}
