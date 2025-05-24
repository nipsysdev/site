'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
} from '@srcpunks/src_ui'
import { useEffect, useState } from 'react'
import { PiCaretRightBold } from 'react-icons/pi'

export default function TerminalPrompt_v2() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <label
        className="bg-card ring-ring/50 border-input inline-flex w-full min-w-fit cursor-pointer items-center rounded-[5vw] border px-3 py-2 transition-shadow hover:ring"
        onClick={() => setOpen(true)}
      >
        <PiCaretRightBold size="1.3rem" className="text-muted-foreground" />
        <Input
          className="text-md h-full min-w-fit flex-auto border-none px-2 py-0 text-lg focus-visible:ring-0"
          readOnly
        />

        <kbd className="text-muted-foreground flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </label>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
