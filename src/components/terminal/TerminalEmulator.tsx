'use client';

import { useStore } from '@nanostores/react';
import { ScrollArea, Typography } from '@nipsys/lsd';
import { useEffect, useState } from 'react';
import { $isAppReady } from '@/stores/app-store';
import { $repoTree } from '@/stores/repo-store';
import {
  $terminalHistory,
  $terminalPromptRef,
  initializeTerminal,
} from '@/stores/terminal-store';
import { isRecognizedCommand } from '@/utils/terminal-utils';
import UnknownCmdOutput from '../cmd-outputs/UnknownCmdOutput';

interface TerminalEmulatorProps {
  initialCommand?: string;
}

export default function TerminalEmulator({
  initialCommand = 'welcome',
}: TerminalEmulatorProps) {
  const history = useStore($terminalHistory);
  const isAppReady = useStore($isAppReady);

  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    setHasWindow(typeof window !== 'undefined');
  }, []);

  useEffect(() => {
    if (hasWindow && isAppReady) {
      initializeTerminal(initialCommand);
      $terminalPromptRef.get()?.current?.focus();
    }
  }, [hasWindow, isAppReady, initialCommand]);

  useEffect(() => {
    const unsubscribe = $repoTree.listen(() => {});
    return unsubscribe;
  }, []);

  const currentEntry = history.length > 0 ? history[history.length - 1] : null;

  return (
    hasWindow && (
      <ScrollArea type="always" className="flex-1 min-h-0 w-full">
        <div className="mx-auto w-full max-w-[1200px] px-(--lsd-spacing-base) py-(--lsd-spacing-largest)">
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
      </ScrollArea>
    )
  );
}
