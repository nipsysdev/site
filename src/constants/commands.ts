import BuildInfoOutput from '@/components/cmd-outputs/BuildInfoOutput';
import ContactOutput from '@/components/cmd-outputs/ContactOutput';
import ContribsOutput from '@/components/cmd-outputs/ContribsOutput';
import HelpOutput from '@/components/cmd-outputs/HelpOutput';
import Web2workOutput from '@/components/cmd-outputs/Web2workOutput';
import Web3workOutput from '@/components/cmd-outputs/Web3workOutput';
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
    name: Command.Web2work,
    output: Web2workOutput,
  },
  {
    name: Command.Web3work,
    output: Web3workOutput,
  },
  {
    name: Command.Contribs,
    output: ContribsOutput,
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
