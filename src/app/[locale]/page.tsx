'use client';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import { TerminalStateProvider } from '@/contexts/TerminalContext';

export default function HomePage() {
  return (
    <TerminalStateProvider>
      <TerminalEmulator />
    </TerminalStateProvider>
  );
}
