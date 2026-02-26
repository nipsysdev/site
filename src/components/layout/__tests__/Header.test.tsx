import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({
    isDarkMode: true,
    setIsDarkMode: vi.fn(),
  }),
  AppStateProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

// Mock the i18n navigation
vi.mock('@/i18n/intl', () => ({
  Link: ({
    children,
    href,
    locale,
  }: {
    children: React.ReactNode;
    href: string;
    locale: string;
  }) => (
    <a href={href} data-locale={locale}>
      {children}
    </a>
  ),
  usePathname: () => '/test-path',
}));

// Mock shadcn-lsd components
vi.mock('@nipsys/shadcn-lsd', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      data-testid={variant && size ? `button-${variant}-${size}` : 'button'}
      className={className}
    >
      {children}
    </button>
  ),
  ButtonGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="button-group">{children}</div>
  ),
}));

// Mock react-icons
vi.mock('react-icons/pi', () => ({
  PiGithubLogoFill: ({ size }: { size: string }) => (
    <div data-testid="github-icon" data-size={size}>
      GitHub
    </div>
  ),
  PiSunFill: ({ size }: { size: string }) => (
    <div data-testid="sun-icon" data-size={size}>
      Sun
    </div>
  ),
  PiMoonFill: ({ size }: { size: string }) => (
    <div data-testid="moon-icon" data-size={size}>
      Moon
    </div>
  ),
}));

// Mock helper function
vi.mock('@/utils/helpers', () => ({
  cx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

import { LangLabels } from '@/constants/lang';
// Import Header after all mocks are set up
import Header from '../Header';

describe('Header', () => {
  it('renders GitHub link button', () => {
    render(<Header />);

    const githubIcon = screen.getByTestId('github-icon');
    expect(githubIcon).toBeInTheDocument();
    expect(githubIcon).toHaveAttribute('data-size', '1rem');

    // Check the GitHub link
    const githubLink = screen.getByRole('link', { name: /GitHub/i });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/nipsysdev/site',
    );
    expect(githubLink).toHaveAttribute('rel', 'noopener');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('renders theme toggle button with sun icon in dark mode', () => {
    render(<Header />);

    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
    expect(sunIcon).toHaveAttribute('data-size', '1rem');
  });

  it('renders language switching buttons', () => {
    render(<Header />);

    const buttonGroup = screen.getByTestId('button-group');
    expect(buttonGroup).toBeInTheDocument();

    // Check for each language button
    Object.entries(LangLabels).forEach(([lang, label]) => {
      const langButton = within(buttonGroup).getByRole('link', {
        name: label.slice(0, 2),
      });
      expect(langButton).toBeInTheDocument();
      expect(langButton).toHaveAttribute('href', '/test-path');
      expect(langButton).toHaveAttribute('data-locale', lang);

      // Check if the active language button has the 'underline' class
      if (lang === 'en') {
        // 'en' is mocked as the current locale
        const buttonElement = langButton.closest('button');
        expect(buttonElement).toHaveClass('underline');
      }
    });
  });
});
