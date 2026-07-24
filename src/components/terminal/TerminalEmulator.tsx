'use client';

import { useStore } from '@nanostores/react';
import { Typography } from '@nipsys/lsd';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { $isAppReady } from '@/stores/app-store';
import { $repoTree } from '@/stores/repo-store';
import {
  $terminalHistory,
  $terminalPromptRef,
  initializeTerminal,
} from '@/stores/terminal-store';
import { isRecognizedCommand } from '@/utils/terminal-utils';
import UnknownCmdOutput from '../cmd-outputs/UnknownCmdOutput';
import TerminalPrompt, { type TerminalPromptRef } from './TerminalPrompt';

interface TerminalEmulatorProps {
  initialCommand?: string;
}

export default function TerminalEmulator({
  initialCommand = 'welcome',
}: TerminalEmulatorProps) {
  const history = useStore($terminalHistory);
  const isAppReady = useStore($isAppReady);

  const t = useTranslations('Terminal');

  const [hasWindow, setHasWindow] = useState(false);

  const mainPrompt = useRef<TerminalPromptRef>(null);

  useEffect(() => {
    setHasWindow(typeof window !== 'undefined');
  }, []);

  useEffect(() => {
    if (hasWindow && isAppReady) {
      setTimeout(() => {
        $terminalPromptRef.set(mainPrompt);
        mainPrompt.current?.scrollIntoView();
        mainPrompt.current?.focus();
      }, 100);
    }
  }, [hasWindow, isAppReady]);

  useEffect(() => {
    if (hasWindow && isAppReady) {
      initializeTerminal(initialCommand);
    }
  }, [hasWindow, isAppReady, initialCommand]);

  useEffect(() => {
    const unsubscribe = $repoTree.listen(() => {});
    return unsubscribe;
  }, []);

  const currentEntry = history.length > 0 ? history[history.length - 1] : null;

  return (
    hasWindow && (
      <div className="flex flex-col size-full overflow-hidden">
        <TerminalPrompt ref={mainPrompt} i18n={t} />

        <div className="flex-1 flex overflow-y-auto p-(--lsd-spacing-largest)">
          <div className="h-fit">
            {currentEntry &&
              (currentEntry.output ? (
                <currentEntry.output entry={currentEntry} />
              ) : currentEntry.error ? (
                <Typography variant="body2" color="destructive">
                  {currentEntry.error}
                </Typography>
              ) : isRecognizedCommand(currentEntry.cmdName) ? null : (
                currentEntry.cmdName && (
                  <UnknownCmdOutput cmdName={currentEntry.cmdName} />
                )
              ))}
          </div>
        </div>
      </div>
    )
  );
}
