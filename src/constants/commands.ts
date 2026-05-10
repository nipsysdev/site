import BuildInfoOutput from '@/components/cmd-outputs/BuildInfoOutput';
import ContactOutput from '@/components/cmd-outputs/ContactOutput';
import HelpOutput from '@/components/cmd-outputs/HelpOutput';
import WelcomeOutput from '@/components/cmd-outputs/WelcomeOutput';
import WhoamiOutput from '@/components/cmd-outputs/WhoamiOutput';
import { Command, type CommandInfo } from '@/types/terminal';

export const Commands: CommandInfo[] = [
  {
    name: Command.Help,
    output: HelpOutput,
  },
  {
    name: Command.Welcome,
    output: WelcomeOutput,
  },
  {
    name: Command.Whoami,
    output: WhoamiOutput,
  },
  {
    name: Command.Contact,
    output: ContactOutput,
  },
  {
    name: Command.Clear,
  },
  {
    name: Command.BuildInfo,
    output: BuildInfoOutput,
  },
];
