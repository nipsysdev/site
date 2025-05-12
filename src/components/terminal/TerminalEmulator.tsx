import { Command, CommandEntry } from '@/types/terminal'
import { createRef, useEffect, useState } from 'react'
import TerminalPrompt from './TerminalPrompt'
import { useTerminalContext } from '@/contexts/TerminalContext'
import { useAppContext } from '@/contexts/AppContext'
import useIsPrerender from '@/hooks/useIsPrerender'
import { TerminalUtils } from '@/utils/terminal-utils'
import { ViewRoute } from '@/types/routing'
import useTermRouter from '@/hooks/useTermRouter'
import { useTranslations } from 'next-intl'
import UnknownCmdOutput from '../cmd-outputs/UnknownCmdOutput'

export default function TerminalEmulator() {
  const {
    hasIntroduced,
    history,
    input,
    simulatedCmd,
    submission,
    setHasIntroduced,
    setHasRefreshed,
    setHistory,
    setInput,
    setSimulatedCmd,
    setSubmission,
  } = useTerminalContext()
  const { setIsTerminal } = useAppContext()
  const isPrerender = useIsPrerender()
  const t = useTranslations('Terminal')

  const [fullscreenEntry, setFullscreenEntry] = useState<CommandEntry | null>(
    null,
  )
  const [hasWindow, setHasWindow] = useState(false)

  const mainPrompt = createRef<TerminalPrompt>()

  useEffect(() => {
    setIsTerminal(true)
    setHasWindow(typeof window !== 'undefined')
  }, [])

  useEffect(() => {
    mainPrompt.current?.focus()

    if (!isPrerender && !hasIntroduced && mainPrompt.current) {
      setHasIntroduced(true)
      mainPrompt.current?.simulate(Command.Intro)
    }
  }, [isPrerender, mainPrompt])

  useEffect(() => {
    if (!submission) return
    setSubmission('')
    setHasRefreshed(false)

    if (submission === 'clear') {
      // TODO: Keep history, only clear terminal
      setHistory([])
      return
    }

    const cmdEntry = TerminalUtils.parseEntry(submission)
    setHistory([...history, cmdEntry])

    if (cmdEntry.fullscreen) {
      setFullscreenEntry(cmdEntry)
    }
  }, [submission])

  useEffect(() => {
    setTimeout(() => {
      mainPrompt.current?.scrollIntoView()
    }, 100)
  }, [history])

  useEffect(() => {
    if (!simulatedCmd) return
    mainPrompt.current?.simulate(simulatedCmd)
    setSimulatedCmd('')
  }, [simulatedCmd])

  useEffect(() => {
    if (!input) return
    mainPrompt.current?.setInput(input)
    setInput('')
  }, [input, mainPrompt, setInput])

  useTermRouter(ViewRoute.Terminal, () => {
    setFullscreenEntry(null)
  })

  const standardView = (
    <div
      role="button"
      tabIndex={0}
      className="flex size-full cursor-default flex-col"
      onKeyDown={() => {}}
      onClick={() => mainPrompt.current?.focus()}
    >
      {history.map((entry) => (
        <div key={entry.timestamp}>
          <TerminalPrompt i18n={t} entry={entry} />
          {entry.fullscreen ? null : entry.output ? (
            <entry.output entry={entry} />
          ) : (
            <UnknownCmdOutput cmdName={entry.cmdName} />
          )}
        </div>
      ))}
      <TerminalPrompt
        ref={mainPrompt}
        i18n={t}
        history={history}
        updateSubmission={setSubmission}
      />
    </div>
  )

  return (
    hasWindow && (
      <div className="size-full overflow-y-auto text-sm select-none sm:text-base">
        {/* TOOD: Add fullscreen display */}
        {fullscreenEntry ? null : standardView}
      </div>
    )
  )
}
