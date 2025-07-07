import { Typography } from '@acid-info/lsd-react/components';
import {
  Component,
  createRef,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { Commands } from '@/constants/commands';
import type { Translator } from '@/i18n/intl';
import styles from '@/styles/components.module.css';
import { Key } from '@/types/keyboard';
import type { CommandEntry } from '@/types/terminal';
import { isNewKeyEvent } from '@/utils/compare-utils';
import { getTerminalEntryInput } from '@/utils/terminal-utils';

interface Props {
  i18n: Translator;
  entry?: CommandEntry;
  history?: CommandEntry[];
  lastKeyDown?: KeyboardEvent | null;
  setSubmission?: (value: string) => void;
  setLastKeyDown?: (value: KeyboardEvent | null) => void;
}

interface State {
  inputText: string;
  inputRef: RefObject<HTMLInputElement | null>;
  autocompleteRef: RefObject<HTMLDivElement | null>;
  historyIdx: number;
  autocomplete: string[] | null;
  host: string;
}

export default class TerminalPrompt extends Component<Props, State> {
  state: State = {
    inputText: '',
    inputRef: createRef<HTMLInputElement>(),
    autocompleteRef: createRef<HTMLDivElement>(),
    historyIdx: -1,
    autocomplete: null,
    host: window.location.host.split(':')[0],
  };

  componentDidMount(): void {
    if (this.props.entry) {
      this.setInput(getTerminalEntryInput(this.props.entry));
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (
      this.props.lastKeyDown &&
      isNewKeyEvent(prevProps.lastKeyDown, this.props.lastKeyDown)
    ) {
      this.keyDownHandler(this.props.lastKeyDown);
    }
  }

  focus() {
    this.state.inputRef.current?.focus();
  }

  simulate(input: string) {
    let i = 0;

    const addChar = (cmd: string) => {
      if (!cmd || i >= cmd.length) {
        this.submit();
        return;
      }
      this.setInput(this.state.inputText + cmd.charAt(i), () => {
        i++;

        setTimeout(() => {
          addChar(cmd);
        }, 50);
      });
    };

    this.setInput('', () => {
      addChar(input);
      this.state.inputRef.current?.focus();
    });
  }

  scrollIntoView() {
    this.state.inputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  setInput(input: string, callback?: () => void): void {
    this.setState(
      (previousState) => ({
        ...previousState,
        inputText: input,
        autocomplete: null,
      }),
      callback,
    );
  }

  private setHistoryIdx(idx: number): void {
    this.setState((previousState) => ({ ...previousState, historyIdx: idx }));
  }

  private setAutocomplete(
    autocomplete: string[] | null,
    callback?: () => void,
  ): void {
    this.setState(
      (previousState) => ({ ...previousState, autocomplete }),
      callback,
    );
  }

  private resetEntry(): void {
    this.setState((previousState) => ({
      ...previousState,
      historyIdx: -1,
      inputText: '',
    }));
  }

  private submit(): void {
    if (this.props.setSubmission)
      this.props.setSubmission(this.state.inputText);
    this.setInput('');
  }

  private getPastInputStr(entry: CommandEntry): string {
    let pastInput = entry.cmdName as string;
    if (entry.option) {
      pastInput += ` ${entry.option}`;
    }
    if (entry.argName) {
      pastInput += ` --${entry.argName}=${entry.argValue}`;
    }
    return pastInput;
  }

  private updateCursorPosition(): void {
    setTimeout(() => {
      if (this.state.inputRef.current) {
        this.state.inputRef.current.setSelectionRange(
          this.state.inputText.length,
          this.state.inputText.length,
        );
      }
    }, 50);
  }

  private setPreviousEntry() {
    if (!this.props.history || this.state.historyIdx === 0) return;
    const idx =
      this.state.historyIdx === -1
        ? this.props.history.length - 1
        : this.state.historyIdx - 1;
    this.setInput(this.getPastInputStr(this.props.history[idx]), () => {
      this.updateCursorPosition();
      this.setHistoryIdx(idx);
    });
  }

  private setNextEntry() {
    if (!this.props.history || this.state.historyIdx === -1) return;
    let idx = this.state.historyIdx;

    if (idx === this.props.history.length - 1) {
      this.resetEntry();
      return;
    }

    idx++;
    this.setInput(this.getPastInputStr(this.props.history[idx]), () => {
      this.updateCursorPosition();
      this.setHistoryIdx(idx);
    });
  }

  private autoComplete(): void {
    const matchedCmds = Commands.map((cmd) => cmd.name).filter((cmd) =>
      cmd.startsWith(this.state.inputText),
    );
    if (matchedCmds.length === 1) {
      this.setInput(matchedCmds[0]);
      return;
    }
    this.setAutocomplete(matchedCmds, () => {
      this.state.autocompleteRef.current?.scrollIntoView();
    });
  }

  private keyDownHandler(event: KeyboardEvent): void {
    if (!this.props.setLastKeyDown) return;
    if (event.ctrlKey && event.key === Key.c) {
      this.resetEntry();
      return;
    }

    switch (event.key) {
      case Key.Enter:
        this.props.setLastKeyDown(null);
        this.submit();
        break;
      case Key.ArrowUp:
        this.setPreviousEntry();
        break;
      case Key.ArrowDown:
        this.setNextEntry();
        break;
      case Key.Tab:
        event.preventDefault();
        this.autoComplete();
    }
  }

  render = () => (
    <>
      <div className="flex w-full gap-x-2">
        <span className={styles.terminalPrompt}>
          {this.props.i18n('visitor')}@{this.state.host}:~$
        </span>
        <input
          ref={this.state.inputRef}
          value={this.state.inputText}
          type="text"
          spellCheck="false"
          readOnly={!!this.props.entry}
          onChange={(e) => this.setInput(e.target.value)}
          onKeyDown={this.props.setLastKeyDown}
          onBeforeInput={() => this.setHistoryIdx(-1)}
        />
      </div>
      <div className="flex items-start" ref={this.state.autocompleteRef}>
        {!this.props.entry && this.state.autocomplete && (
          <Typography variant="subtitle4" className="opacity-60">
            {this.props.i18n('autocomplete')}&nbsp;
            {this.state.autocomplete.join(' | ') || this.props.i18n('noMatch')}
          </Typography>
        )}
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
}
