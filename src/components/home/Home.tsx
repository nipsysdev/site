import { Avatar, AvatarImage, Button } from '@srcpunks/src_ui'
import { useEffect, useState } from 'react'
import figlet from 'figlet'
import standard from 'figlet/importable-fonts/Standard'

export default function Home() {
  const [asciiText, setAsciiText] = useState<string | undefined>(undefined)

  useEffect(() => {
    figlet.parseFont('Standard', standard)
    figlet.text(
      'nipsysdev',
      {
        font: 'Standard',
      },
      (_, data) => setAsciiText(data),
    )
  }, [])

  return (
    <div className="flex size-full">
      <div className="bg-card relative flex flex-col items-center gap-4 rounded-[2.5vw] border p-3">
        <Avatar className="size-20 border">
          <AvatarImage src="/nipsysdev.webp" alt="@nipsysdev" />
        </Avatar>

        <Button className="w-full" variant="outline">
          PGP key
        </Button>
        <Button className="w-full" variant="outline">
          Synthwave radio
        </Button>
        <Button className="w-full" variant="outline">
          Buy me a coffee
        </Button>

        <div className="absolute bottom-36 h-20 w-90 -rotate-90 font-mono text-xs leading-none whitespace-break-spaces">
          {asciiText}
        </div>
      </div>
    </div>
  )
}
