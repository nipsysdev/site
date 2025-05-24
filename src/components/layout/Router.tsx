import { TerminalStateProvider } from '@/contexts/TerminalContext'
import TerminalEmulator from '../terminal/TerminalEmulator'
import TerminalWindow from './TermWindow'
import { useState } from 'react'
import { Checkbox } from '@srcpunks/src_ui'
import Home from '../home/Home'

export default function Router() {
  const [isNewUiEnabled, setIsNewUiEnabled] = useState(true)

  const content = isNewUiEnabled ? (
    <Home />
  ) : (
    <TerminalWindow>
      <TerminalStateProvider>
        <TerminalEmulator />
      </TerminalStateProvider>
    </TerminalWindow>
  )

  return (
    <div className="relative max-h-[768px] w-full flex-auto overflow-hidden rounded-[5vw] border bg-black/15 p-[2.5vw]">
      <div className="text-muted-foreground absolute top-0 right-20 flex items-center space-x-2">
        <Checkbox
          id="old_ui_check"
          checked={isNewUiEnabled}
          onCheckedChange={(e) => setIsNewUiEnabled(e as boolean)}
        />
        <label htmlFor="old_ui_check">new ui</label>
      </div>

      {content}
    </div>
  )
}
