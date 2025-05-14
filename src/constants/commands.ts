import { Command, CommandInfo } from '@/types/terminal'
import { Lang } from './lang'
import IntroOutput from '@/components/cmd-outputs/IntroOutput'
import HelpOutput from '@/components/cmd-outputs/HelpOutput'

function enumToArg(o: { [s: string]: string } | ArrayLike<string>): string[] {
  return Object.values(o).map((l: string) => {
    return l.replace(' ', '').replace('-', '').toLowerCase()
  })
}

export const Commands: CommandInfo[] = [
  {
    name: Command.Clear,
  },
  {
    name: Command.Contact,
    // output: ContactOutput,
  },
  {
    name: Command.Help,
    output: HelpOutput,
  },
  {
    name: Command.Intro,
    output: IntroOutput,
  },
  {
    name: Command.SetLang,
    options: enumToArg(Lang),
    // output: SetLangOutput,
  },
  {
    name: Command.Whoami,
    // output: WhoamiOutput,
  },
  {
    name: Command.Web3Mission,
  },
]
