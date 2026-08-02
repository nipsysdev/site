import { useStore } from '@nanostores/react';
import { Typography } from '@nipsys/lsd';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { Translator } from '@/i18n/intl';
import {
  $lastDisplayedCommand,
  $terminalHistoryIdx,
  $terminalInput,
  $terminalInputReadOnly,
  $terminalKeyEvent,
  $terminalSuggestions,
} from '@/stores/terminal-store';
import type { CommandEntry } from '@/types/terminal';
import { getTerminalEntryInput } from '@/utils/terminal-utils';

export interface TerminalPromptRef {
  focus: () => void;
  blur: () => void;
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
    const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );
    const [isFocused, setIsFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [inputWidth, setInputWidth] = useState(Infinity);

    const value = entry ? getTerminalEntryInput(entry) : input;

    useLayoutEffect(() => {
      if (inputRef.current) {
        setScrollLeft(inputRef.current.scrollLeft);
      }
    }, []);

    useEffect(() => {
      const el = inputRef.current;
      if (!el || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => {
        setInputWidth(el.clientWidth);
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const focus = () => {
      inputRef.current?.focus();
    };

    const blur = () => {
      inputRef.current?.blur();
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
      blur,
      scrollIntoView,
      setCursorToIdx,
    }));

    const handleTyping = () => {
      setIsTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setIsTyping(false), 400);
    };

    const FONT_SIZE_PX = 20;
    const caretRightEdge = value.length * 0.5 * FONT_SIZE_PX - scrollLeft + 9;
    const caretOverflows = caretRightEdge > inputWidth;

    const showCursor = !entry && (isFocused || !caretOverflows);

    return (
      <>
        <div className="flex w-full items-center gap-x-(--lsd-spacing-small) text-lg cursor-pointer">
          <span className="leading-none text-(--lsd-primary)">$</span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={value}
              id="prompt"
              type="text"
              spellCheck="false"
              readOnly={isReadOnly || !!entry}
              className="w-full!"
              style={{ caretColor: 'transparent' }}
              onChange={(e) => {
                $terminalInput.set(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => $terminalKeyEvent.set(e)}
              onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
              onBeforeInput={() => $terminalHistoryIdx.set(-1)}
              onFocus={() => {
                setIsFocused(true);
                if (!$terminalInputReadOnly.get()) {
                  $lastDisplayedCommand.set($terminalInput.get());
                  $terminalInput.set('');
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                $terminalInput.set($lastDisplayedCommand.get());
              }}
            />
            {showCursor && (
              <span
                aria-hidden="true"
                className={
                  !isFocused
                    ? 'prompt-cursor prompt-cursor--hollow'
                    : isTyping
                      ? 'prompt-cursor prompt-cursor--solid'
                      : 'prompt-cursor'
                }
                style={{
                  left: `calc(${value.length} * 0.5em - ${scrollLeft}px)`,
                }}
              />
            )}
          </div>
        </div>
        <div className="flex items-start">
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
            caret-color: transparent;
          }
        `}</style>
      </>
    );
  },
);

TerminalPrompt.displayName = 'TerminalPrompt';

export default TerminalPrompt;
