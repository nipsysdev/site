'use client'

import { Button, Input } from '@srcpunks/src_ui'
import { PiCaretRightBold, PiCirclesFourFill } from 'react-icons/pi'

export default function TerminalPrompt_v2() {
  return (
    <>
      <label className="flex h-full w-1/3 max-w-full items-center rounded-[5vw] bg-white/5 px-3">
        <PiCaretRightBold size="1.8rem" />
        <Input className="size-full border-none px-0 pl-2 text-lg focus-visible:ring-0" />
        <Button variant="ghost">
          <PiCirclesFourFill className="size-6" />
          <span>menu</span>
        </Button>
      </label>
      <style jsx>{``}</style>
    </>
  )
}
