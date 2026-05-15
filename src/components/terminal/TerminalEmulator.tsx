'use client';

import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import {
  $terminalHistory,
  $terminalHistoryVisibleIdx,
  $terminalPromptRef,
  initializeTerminal,
} from '@/stores/terminal-store';
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

  const t = useTranslations('Terminal');

  const [hasWindow, setHasWindow] = useState(false);

  const mainPrompt = useRef<TerminalPromptRef>(null);

  useEffect(() => {
    setHasWindow(typeof window !== 'undefined');
  }, []);

  useEffect(() => {
    if (hasWindow) {
      setTimeout(() => {
        $terminalPromptRef.set(mainPrompt);
        mainPrompt.current?.scrollIntoView();
        mainPrompt.current?.focus();
      }, 100);
    }
  }, [hasWindow]);

  useEffect(() => {
    if (hasWindow) {
      initializeTerminal(initialCommand);
    }
  }, [hasWindow, initialCommand]);

  return (
    hasWindow && (
      <div className="size-full overflow-y-auto text-(length:--lsd-body2-fontSize) sm:text-(length:--lsd-body1-fontSize)">
        {/** biome-ignore lint/a11y/useSemanticElements: terminal container needs to be clickable and listen to inputs while still displaying as a div */}
        <div
          role="button"
          tabIndex={0}
          className="flex size-full cursor-default flex-col"
          onKeyDown={() => {}}
          onClick={() => mainPrompt.current?.focus()}
        >
          {history.slice(historyVisibleIdx).map((entry) => (
            <div key={entry.timestamp} className="mb-1">
              <TerminalPrompt i18n={t} entry={entry} />
              {entry.output ? (
                <entry.output entry={entry} t={t} />
              ) : (
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
