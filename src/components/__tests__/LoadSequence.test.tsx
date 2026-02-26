import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from '@/contexts/AppContext';
import LoadSequence from '../LoadSequence';

vi.mock('@/i18n/intl', () => ({
  routing: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
}));

describe('LoadSequence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('should render the component with cursor', () => {
    render(
      <AppStateProvider>
        <LoadSequence />
      </AppStateProvider>,
    );

    const cursor = screen.getByText('█');
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveClass('animate-pulse');
  });

  it('should detect dark theme preference', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <AppStateProvider>
        <LoadSequence />
      </AppStateProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('> Theme set to [dark]')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should detect light theme preference', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <AppStateProvider>
        <LoadSequence />
      </AppStateProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('> Theme set to [light]')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should remove dark class from html when light mode preferred', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    document.documentElement.classList.add('dark');

    render(
      <AppStateProvider>
        <LoadSequence />
      </AppStateProvider>,
    );

    await waitFor(
      () => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      },
      { timeout: 2000 },
    );
  });

  it('should keep dark class on html when dark mode preferred', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    document.documentElement.classList.add('dark');

    render(
      <AppStateProvider>
        <LoadSequence />
      </AppStateProvider>,
    );

    await waitFor(
      () => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it('should show children after loading completes', async () => {
    render(
      <AppStateProvider>
        <LoadSequence>
          <div>Test Content</div>
        </LoadSequence>
      </AppStateProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should not show children during loading', () => {
    render(
      <AppStateProvider>
        <LoadSequence>
          <div>Test Content</div>
        </LoadSequence>
      </AppStateProvider>,
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    expect(screen.getByText('█')).toBeInTheDocument();
  });
});
