import { Commands } from '@/constants/commands'
import { Command, CommandEntry, CommandOutput } from '@/types/terminal'

export class TerminalUtils {
  static newEntry(
    name: Command,
    output?: CommandOutput,
    fullscreen?: boolean,
    option?: string,
    argName?: string,
    argValue?: string,
  ): CommandEntry {
    return {
      cmdName: name,
      output,
      fullscreen,
      option,
      argName,
      argValue,
      timestamp: Date.now(),
    }
  }

  static unrecognizedEntry(name: string): CommandEntry {
    return this.newEntry(name as Command)
  }

  static parseEntry(entry: string): CommandEntry {
    const split = entry.split(' ')
    const cmdName =
      Command[
        (Object.entries(Command).find(([, v]) => v === split[0]) ?? [
          '',
        ])[0] as keyof typeof Command
      ]
    const cmdInfo = Commands.find((cmd) => cmd.name === cmdName)

    if (!cmdName || !cmdInfo) return this.unrecognizedEntry(entry)

    let option = undefined
    let argName = undefined
    let argValue = undefined

    if (split[1]?.includes('--') && split[1]?.includes('=')) {
      const argSplit = split[1].split('=')
      argName = argSplit[0].replace('--', '')
      argValue = argSplit[1]
    } else {
      option = split[1]
    }

    return this.newEntry(
      cmdName,
      cmdInfo.output,
      cmdInfo.fullscreen,
      option,
      argName,
      argValue,
    )
  }

  static GetEntryInput(entry: CommandEntry) {
    let pastInput = entry.cmdName as string
    if (entry.option) {
      pastInput += ` ${entry.option}`
    }
    if (entry.argName) {
      pastInput += ` --${entry.argName}=${entry.argValue}`
    }
    return pastInput
  }
}
