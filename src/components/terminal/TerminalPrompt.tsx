import { Translator } from '@/i18n/intl'
import { CommandEntry } from '@/types/terminal'
import { TerminalUtils } from '@/utils/terminal-utils'
import { Component, createRef, RefObject } from 'react'

interface Props {
  i18n: Translator
  entry?: CommandEntry
  history?: CommandEntry[]
  updateSubmission?: (value: string) => void
}

interface State {
  inputText: string
  inputRef: RefObject<HTMLInputElement | null>
  autocompleteRef: RefObject<HTMLDivElement | null>
  historyIdx: number
  autocomplete: string[] | null
  host: string
}

export default class TerminalPrompt extends Component<Props, State> {
  state: State = {
    inputText: '',
    inputRef: createRef<HTMLInputElement>(),
    autocompleteRef: createRef<HTMLDivElement>(),
    historyIdx: -1,
    autocomplete: null,
    host: window.location.host.split(':')[0],
  }

  componentDidMount(): void {
    if (this.props.entry) {
      this.setInput(TerminalUtils.GetEntryInput(this.props.entry))
    }
  }

  focus() {
    this.state.inputRef.current?.focus()
  }

  simulate(input: string) {
    let i = 0

    const addChar = (cmd: string) => {
      if (!cmd || i >= cmd.length) {
        this.submit()
        return
      }
      this.setInput(this.state.inputText + cmd.charAt(i), () => {
        i++

        setTimeout(() => {
          addChar(cmd)
        }, 50)
      })
    }

    this.setInput('', () => {
      addChar(input)
      this.state.inputRef.current?.focus()
    })
  }

  scrollIntoView() {
    this.state.inputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  setInput(input: string, callback?: () => void): void {
    this.setState(
      (previousState) => ({
        ...previousState,
        inputText: input,
        autocomplete: null,
      }),
      callback,
    )
  }

  private setHistoryIdx(idx: number): void {
    this.setState((previousState) => ({ ...previousState, historyIdx: idx }))
  }

  private submit(): void {
    if (this.props.updateSubmission)
      this.props.updateSubmission(this.state.inputText)
    this.setInput('')
  }

  render = () => (
    <>
      <div className="flex w-full gap-x-2">
        <div className="font-bold">
          <span className="text-steelblue">visitor@{this.state.host}</span>:
          <span className="text-steelblue">~</span>$
        </div>
        <input
          ref={this.state.inputRef}
          value={this.state.inputText}
          type="text"
          spellCheck="false"
          readOnly={!!this.props.entry}
          onChange={(e) => this.setInput(e.target.value)}
          onBeforeInput={() => this.setHistoryIdx(-1)}
        />
      </div>
      <div className="flex items-start" ref={this.state.autocompleteRef}>
        {!this.props.entry && this.state.autocomplete && (
          <span className="text-darkgray text-sm opacity-60">
            {this.props.i18n('autocomplete')}&nbsp;
            {this.state.autocomplete.join(' | ') || this.props.i18n('noMatch')}
          </span>
        )}
      </div>

      <style scoped>
        {`
          input {
            &, &:focus {
              all: unset;
            }
            flex: 1 1 auto;
            width: inherit;
            opacity: 0.8;
          }
        `}
      </style>
    </>
  )
}
