import { lazy } from 'react';
import { Command, type CommandInfo } from '@/types/terminal';
import { Lang } from './lang';

// Lazy load components that aren't critical for initial render
const BuildInfoOutput = lazy(
  () => import('@/components/cmd-outputs/BuildInfoOutput'),
);
const ContactOutput = lazy(
  () => import('@/components/cmd-outputs/ContactOutput'),
);
const HelpOutput = lazy(() => import('@/components/cmd-outputs/HelpOutput'));
const IntroOutput = lazy(() => import('@/components/cmd-outputs/IntroOutput'));
const Web3MissionOutput = lazy(
  () => import('@/components/cmd-outputs/Web3MissionOutput'),
);
const WhoamiOutput = lazy(
  () => import('@/components/cmd-outputs/WhoamiOutput'),
);

function enumToArg(o: { [s: string]: string } | ArrayLike<string>): string[] {
  return Object.values(o).map((l: string) => {
    return l.replace(' ', '').replace('-', '').toLowerCase();
  });
}

export const Commands: CommandInfo[] = [
  {
    name: Command.BuildInfo,
    output: BuildInfoOutput,
  },
  {
    name: Command.Clear,
  },
  {
    name: Command.Contact,
    output: ContactOutput,
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
    output: WhoamiOutput,
  },
  {
    name: Command.Web3Mission,
    output: Web3MissionOutput,
  },
];
