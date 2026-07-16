'use client';

import { useStore } from '@nanostores/react';
import { Typography } from '@nipsys/lsd';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { $isAppReady } from '@/stores/app-store';
import { $repoTree } from '@/stores/repo-store';
import {
  $terminalHistory,
  $terminalHistoryVisibleIdx,
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
  const historyVisibleIdx = useStore($terminalHistoryVisibleIdx);
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

  const focusTerminal = (target: HTMLElement) => {
    if (
      !target.closest(
        '[data-prevent-terminal-focus],[data-slot="dialog-overlay"],[data-radix-popper-content-wrapper]',
      )
    ) {
      mainPrompt.current?.focus();
    }
  };

  return (
    hasWindow && (
      <div className="size-full overflow-y-auto text-(length:--lsd-body2-fontSize) sm:text-(length:--lsd-body1-fontSize)">
        {/** biome-ignore lint/a11y/useSemanticElements: terminal container needs to be clickable and listen to inputs while still displaying as a div */}
        <div
          role="button"
          tabIndex={0}
          className="flex size-full cursor-default flex-col"
          onKeyDown={(e) => {
            if (
              e.target === e.currentTarget &&
              (e.key === 'Enter' || e.key === ' ')
            ) {
              e.preventDefault();
              mainPrompt.current?.focus();
            }
          }}
          onClick={(e) => focusTerminal(e.target as HTMLElement)}
        >
          {history.slice(historyVisibleIdx).map((entry) => (
            <div key={entry.timestamp} className="mb-1">
              <TerminalPrompt i18n={t} entry={entry} />
              {entry.output ? (
                <entry.output entry={entry} />
              ) : entry.error ? (
                <Typography variant="body2" color="destructive">
                  {entry.error}
                </Typography>
              ) : isRecognizedCommand(entry.cmdName) ? null : (
                entry.cmdName && <UnknownCmdOutput cmdName={entry.cmdName} />
              )}
            </div>
          ))}
          <TerminalPrompt ref={mainPrompt} i18n={t} />
        </div>
      </div>
    )
  );
}
