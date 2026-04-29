import { useStore } from '@nanostores/react';
import { Typography } from '@nipsys/lsd';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Translator } from '@/i18n/intl';
import {
  $terminalHistoryIdx,
  $terminalInput,
  $terminalInputReadOnly,
  $terminalKeyEvent,
  $terminalSuggestions,
} from '@/stores/terminal-store';
import type { CommandEntry } from '@/types/terminal';
import { getDisplayHost, getTerminalEntryInput } from '@/utils/terminal-utils';

export interface TerminalPromptRef {
  focus: () => void;
  scrollIntoView: () => void;
  setCursorToIdx: (index: number) => void;
}

interface Props {
  i18n: Translator;
  entry?: CommandEntry;
}

const TerminalPrompt = forwardRef<TerminalPromptRef, Props>(
  ({ i18n, entry }, ref) => {
    const input = useStore($terminalInput);
    const suggestions = useStore($terminalSuggestions);
    const isReadOnly = useStore($terminalInputReadOnly);

    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    const focus = () => {
      inputRef.current?.focus();
    };

    const scrollIntoView = () => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const setCursorToIdx = (index: number) => {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(index, index);
        }
      }, 10);
    };

    useImperativeHandle(ref, () => ({
      focus,
      scrollIntoView,
      setCursorToIdx,
    }));

    return (
      <>
        <div className="flex w-full gap-x-2">
          <span className="font-bold">
            {i18n('visitor')}@{getDisplayHost()}:~$
          </span>
          <input
            ref={inputRef}
            value={entry ? getTerminalEntryInput(entry) : input}
            type="text"
            spellCheck="false"
            readOnly={isReadOnly || !!entry}
            onChange={(e) => $terminalInput.set(e.target.value)}
            onKeyDown={(e) => $terminalKeyEvent.set(e)}
            onBeforeInput={() => $terminalHistoryIdx.set(-1)}
          />
        </div>
        <div className="flex items-start" ref={autocompleteRef}>
          {!entry &&
            suggestions &&
            (!suggestions.length ? (
              i18n('noMatch')
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 w-full">
                {suggestions.map((s) => (
                  <Typography
                    key={s}
                    variant="subtitle4"
                    className="opacity-60"
                  >
                    {s}
                  </Typography>
                ))}
              </div>
            ))}
        </div>

        <style jsx>{`
          input {
            &,
            &:focus {
              all: unset;
            }
            flex: 1 1 auto;
            width: inherit;
            opacity: 0.8;
          }
        `}</style>
      </>
    );
  },
);

TerminalPrompt.displayName = 'TerminalPrompt';

export default TerminalPrompt;
