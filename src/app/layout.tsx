import type { Metadata } from 'next'
import '@/styles/global.css'
import TerminalWindow from '@/components/layout/TermWindow'
import Header from '@/components/layout/Header'

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
        <main className="relative flex h-dvh w-dvw flex-col items-center">
          <Header />

          <div className="flex w-full flex-auto items-center justify-center pb-8">
            <TerminalWindow>{children}</TerminalWindow>
          </div>
        </main>
      </body>
    </html>
  )
}
