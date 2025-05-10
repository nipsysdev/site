'use client'
import { PiGithubLogoFill } from 'react-icons/pi'
import { Button } from '@srcpunks/src_ui'

export default function Header() {
  return (
    <div className="flex w-full items-center justify-between p-3 text-xs tracking-tighter transition-colors sm:p-5 sm:text-sm">
      <div className="flex gap-x-2 text-xs sm:text-sm">
        <Button variant="ghost">English</Button>
        <Button variant="ghost">French</Button>
      </div>

      <Button variant="link" className="text-secondary">
        <a
          className="flex items-center"
          href="https://github.com/nipsysdev/site"
          target="_blank"
        >
          <PiGithubLogoFill size="1.2rem" className="mr-2" />
          Source code
        </a>
      </Button>
    </div>
  )
}
