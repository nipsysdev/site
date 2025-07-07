import { AppStateProvider } from '@/contexts/AppContext';
import 'tailwindcss/index.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
