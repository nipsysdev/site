'use client'
import { useAppContext } from '@/contexts/AppContext'
import TerminalPrompt_v2 from '../terminal/TerminalPrompt_v2'
import Header from './Header'
import TerminalWindow from './TermWindow'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOldUiEnabled } = useAppContext()

  return (
    <main className="relative flex h-dvh w-dvw flex-col items-center">
      <Header />

      {isOldUiEnabled ? (
        <div className="flex w-full flex-auto items-center justify-center pb-8">
          <TerminalWindow>{children}</TerminalWindow>
        </div>
      ) : (
        <div className="mx-auto flex w-11/12 flex-auto flex-col gap-5 pb-10">
          <div className="mx-auto w-full max-w-7xl basis-14">
            <TerminalPrompt_v2 />
          </div>

          <div className="flex max-h-[768px] w-full flex-auto items-center justify-center rounded-[5vw] bg-white/5">
            test
          </div>
        </div>
      )}
    </main>
  )
}
