'use client';

import { useStore } from '@nanostores/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@nipsys/lsd';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import avatar from '@/assets/nipsys.webp';
import { $scrollY } from '@/stores/terminal-store';
import { Command } from '@/types/terminal';
import CmdLink from '../terminal/CmdLink';

export default function WelcomeOutput() {
  const t = useTranslations('Welcome');
  const scrollY = useStore($scrollY);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const showTooltip = scrollY === 0 && isReady;

  return (
    <TooltipProvider>
      <div className="flex flex-col py-(--lsd-spacing-largest)">
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <Image src={avatar} width={70} alt="Avatar" priority={true} />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[70vw] lg:text-lg!">
            <p className="mb-(--lsd-spacing-base)">
              {t.rich('welcome', {
                name: (name) => <span className="font-bold">{name}</span>,
              })}
            </p>

            <p>{t('siteIntro1')}</p>
            <p>
              {t.rich('siteIntro2', {
                cmd: () => <CmdLink cmdName={Command.Help} primary />,
              })}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
