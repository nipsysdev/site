import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LangLabels } from '@/constants/lang';
import Header from '../Header';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
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

// Mock LSD React components
vi.mock('@acid-info/lsd-react/client/Button', () => ({
  Button: ({
    children,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    variant: string;
    size: string;
    className?: string;
  }) => (
    <button
      type="button"
      data-testid={`button-${variant}-${size}`}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@acid-info/lsd-react/client/ButtonGroup', () => ({
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
}));

// Mock helper function
vi.mock('@/utils/helpers', () => ({
  cx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

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
});
