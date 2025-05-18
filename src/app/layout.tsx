import { AppStateProvider } from '@/contexts/AppContext'
import '@/styles/global.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppStateProvider>{children}</AppStateProvider>
}
