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
const Web2workOutput = lazy(
  () => import('@/components/cmd-outputs/Web2workOutput'),
);
const Web3workOutput = lazy(
  () => import('@/components/cmd-outputs/Web3workOutput'),
);
const ContribsOutput = lazy(
  () => import('@/components/cmd-outputs/ContribsOutput'),
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
    name: Command.Intro,
    output: IntroOutput,
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
    name: Command.BuildInfo,
    output: BuildInfoOutput,
  },
  {
    name: Command.Clear,
  },
  {
    name: Command.Help,
    output: HelpOutput,
  },
  {
    name: Command.SetLang,
    options: enumToArg(Lang),
    // output: SetLangOutput,
  },
];
