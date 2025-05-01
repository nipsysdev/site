import type { Metadata } from 'next'
import './globals.css'
import TerminalWindow from './components/TermWindow'
import { PiGithubLogoFill } from 'react-icons/pi'

export const metadata: Metadata = {
  title: 'xav / nipsysdev',
  description: 'My personal website',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body id="site" className={`antialiased`}>
        <main className="relative flex h-dvh w-dvw flex-col items-center justify-center">
          <div className="absolute top-0 flex h-10 w-full items-center justify-between px-2 tracking-tighter transition-colors sm:px-5">
            <div></div>
            <a
              className="hover:text-darkgray flex items-center text-xs lowercase md:text-sm"
              href="https://github.com/nipsysdev/personal-website"
              target="_blank"
            >
              <PiGithubLogoFill size="1.2rem" />
              &nbsp;source code
            </a>
          </div>

          <TerminalWindow>{children}</TerminalWindow>
        </main>
      </body>
    </html>
  )
}
