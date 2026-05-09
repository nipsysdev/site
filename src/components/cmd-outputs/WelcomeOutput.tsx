'use client';

import { useStore } from '@nanostores/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@nipsys/lsd';
import Image from 'next/image';
import avatar from '@/assets/nipsys.png';
import { $scrollY } from '@/stores/terminal-store';
import { Command, type CommandOutputProps } from '@/types/terminal';
import CmdLink from '../terminal/CmdLink';

export default function WelcomeOutput({ t }: CommandOutputProps) {
  const scrollY = useStore($scrollY);
  const showTooltip = scrollY === 0;

  return (
    <TooltipProvider>
      <div className="flex flex-col py-(--lsd-spacing-largest)">
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <Image src={avatar} width={70} alt="Avatar" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[70vw]">
            <p className="mb-(--lsd-spacing-base)">
              {t.rich('cmds.welcome.welcome', {
                name: (name) => <span className="font-bold">{name}</span>,
              })}
            </p>

            <p>{t('cmds.welcome.site_intro_1')}</p>
            <p>
              {t.rich('cmds.welcome.site_intro_2', {
                cmd: () => <CmdLink cmdName={Command.Help} />,
              })}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
