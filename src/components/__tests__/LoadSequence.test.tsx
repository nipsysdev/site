import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoadSequence from '../LoadSequence';

// Mock Typography component
vi.mock('@nipsysdev/lsd-react/client/Typography', () => ({
  Typography: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the i18n routing
vi.mock('@/i18n/intl', () => ({
  routing: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
}));

// Store original navigator.language
const originalLanguage = navigator.language;

describe('LoadSequence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default English
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });
  });

  afterEach(() => {
    // Restore original navigator.language
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: originalLanguage,
    });
  });

  it('should render the component with cursor', () => {
    render(<LoadSequence />);

    // Should show the blinking cursor initially
    const cursor = screen.getByText('█');
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveClass('animate-pulse');
  });

  it('should detect English locale from browser by default', async () => {
    render(<LoadSequence />);

    // Wait for locale selection step
    await waitFor(
      () => {
        expect(
          screen.getByText('> Selecting proper locale [en]'),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should detect French locale when set', async () => {
    // Set navigator.language to French before rendering
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR',
    });

    render(<LoadSequence />);

    // Wait for locale selection step with French
    await waitFor(
      () => {
        expect(
          screen.getByText('> Selecting proper locale [fr]'),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should fallback to English for unsupported language', async () => {
    // Set navigator.language to unsupported language
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'es-ES',
    });

    render(<LoadSequence />);

    // Should fallback to English
    await waitFor(
      () => {
        expect(
          screen.getByText('> Selecting proper locale [en]'),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should eventually redirect to detected locale', async () => {
    render(<LoadSequence />);

    // Wait for redirect to happen
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/en');
      },
      { timeout: 3000 },
    );
  });

  it('should redirect to French locale when detected', async () => {
    // Clear previous calls
    mockPush.mockClear();

    // Set navigator.language to French
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-CA',
    });

    render(<LoadSequence />);

    // Wait for French redirect
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/fr');
      },
      { timeout: 3000 },
    );
  });
});
