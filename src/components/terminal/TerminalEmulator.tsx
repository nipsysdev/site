import { useTranslations } from 'next-intl';
import { createRef, Suspense, useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useTerminalContext } from '@/contexts/TerminalContext';
import useIsPrerender from '@/hooks/useIsPrerender';
import { Command } from '@/types/terminal';
import { parseTerminalEntry } from '@/utils/terminal-utils';
import UnknownCmdOutput from '../cmd-outputs/UnknownCmdOutput';
import TerminalPrompt from './TerminalPrompt';

export default function TerminalEmulator() {
  const {
    hasWelcomed,
    history,
    input,
    simulatedCmd,
    submission,
    setHasWelcomed,
    setHasRefreshed,
    setHistory,
    setInput,
    setSimulatedCmd,
    setSubmission,
  } = useTerminalContext();
  const { lastKeyDown, setIsTerminal, setLastKeyDown } = useAppContext();
  const isPrerender = useIsPrerender();
  const t = useTranslations('Terminal');

  const [hasWindow, setHasWindow] = useState(false);

  const mainPrompt = createRef<TerminalPrompt>();

  useEffect(() => {
    setIsTerminal(true);
    setHasWindow(typeof window !== 'undefined');
  }, [setIsTerminal]);

  useEffect(() => {
    mainPrompt.current?.focus();

    if (!isPrerender && !hasWelcomed && mainPrompt.current) {
      setHasWelcomed(true);
      mainPrompt.current?.simulate(Command.Welcome);
    }
  }, [hasWelcomed, isPrerender, mainPrompt, setHasWelcomed]);

  useEffect(() => {
    if (!submission) return;
    setSubmission('');
    setHasRefreshed(false);

    if (submission === 'clear') {
      // TODO: Keep history, only clear terminal
      setHistory([]);
      return;
    }

    const cmdEntry = parseTerminalEntry(submission);
    setHistory([...history, cmdEntry]);
  }, [history, setHasRefreshed, setHistory, setSubmission, submission]);

  useEffect(() => {
    setTimeout(() => {
      mainPrompt.current?.scrollIntoView();
    }, 100);
  }, [mainPrompt]);

  useEffect(() => {
    if (!simulatedCmd) return;
    mainPrompt.current?.simulate(simulatedCmd);
    setSimulatedCmd('');
  }, [mainPrompt, setSimulatedCmd, simulatedCmd]);

  useEffect(() => {
    if (!input) return;
    mainPrompt.current?.setInput(input);
    setInput('');
  }, [input, mainPrompt, setInput]);

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
          {history.map((entry) => (
            <div key={entry.timestamp} className="mb-1">
              <TerminalPrompt i18n={t} entry={entry} />
              {entry.output ? (
                <Suspense
                  fallback={<div className="text-gray-500">Loading...</div>}
                >
                  <entry.output entry={entry} t={t} />
                </Suspense>
              ) : (
                <UnknownCmdOutput cmdName={entry.cmdName} />
              )}
            </div>
          ))}
          <TerminalPrompt
            ref={mainPrompt}
            i18n={t}
            history={history}
            lastKeyDown={lastKeyDown}
            setSubmission={setSubmission}
            setLastKeyDown={setLastKeyDown}
          />
        </div>
      </div>
    )
  );
}
