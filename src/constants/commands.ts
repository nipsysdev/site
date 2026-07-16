import BuildInfoOutput from '@/components/cmd-outputs/BuildInfoOutput';
import CatOutput from '@/components/cmd-outputs/CatOutput';
import ContactOutput from '@/components/cmd-outputs/ContactOutput';
import GalleryOutput from '@/components/cmd-outputs/GalleryOutput';
import HelpOutput from '@/components/cmd-outputs/HelpOutput';
import LsOutput from '@/components/cmd-outputs/LsOutput';
import PwdOutput from '@/components/cmd-outputs/PwdOutput';
import ResumeOutput from '@/components/cmd-outputs/ResumeOutput';
import StatusOutput from '@/components/cmd-outputs/StatusOutput';
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
    name: Command.Status,
    output: StatusOutput,
  },
  {
    name: Command.Resume,
    output: ResumeOutput,
  },
  {
    name: Command.Contact,
    output: ContactOutput,
  },
  {
    name: Command.Gallery,
    output: GalleryOutput,
  },
  {
    name: Command.Clear,
  },
  {
    name: Command.Pwd,
    output: PwdOutput,
  },
  {
    name: Command.Ls,
    output: LsOutput,
    options: ['-l', '-a'],
    usage: '[path]',
  },
  {
    name: Command.Cd,
    usage: '<dir>',
  },
  {
    name: Command.Cat,
    output: CatOutput,
    usage: '<file>',
  },
  {
    name: Command.BuildInfo,
    output: BuildInfoOutput,
  },
];
