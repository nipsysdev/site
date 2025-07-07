import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Header from '../Header';
import { LangLabels } from '@/constants/lang';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

// Mock the i18n navigation
vi.mock('@/i18n/intl', () => ({
  Link: ({ children, href, locale }: { children: React.ReactNode; href: string; locale: string }) => (
    <a href={href} data-locale={locale}>{children}</a>
  ),
  usePathname: () => '/test-path',
}));

// Mock LSD React components
vi.mock('@acid-info/lsd-react/components', () => ({
  Button: ({ children, variant, size, className }: { 
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
  ButtonGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="button-group">{children}</div>
  ),
}));

// Mock react-icons
vi.mock('react-icons/pi', () => ({
  PiGithubLogoFill: ({ size }: { size: string }) => (
    <div data-testid="github-icon" data-size={size}>GitHub</div>
  ),
}));

// Mock helper function
vi.mock('@/utils/helpers', () => ({
  cx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('Header', () => {
  it('renders without crashing', () => {
    const { container } = render(<Header />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<Header />);
    const headerDiv = container.firstChild as HTMLElement;
    expect(headerDiv).toHaveClass(
      'flex', 
      'w-full', 
      'items-center', 
      'justify-between', 
      'tracking-tighter', 
      'transition-colors'
    );
  });

  it('renders ButtonGroup component', () => {
    render(<Header />);
    expect(screen.getByTestId('button-group')).toBeInTheDocument();
  });

  it('renders language buttons for all language labels', () => {
    render(<Header />);
    
    Object.entries(LangLabels).forEach(([lang, label]) => {
      // Check that we have a link for each language
      const link = screen.getByText(label.slice(0, 2));
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('data-locale', lang);
    });
  });

  it('renders GitHub link button', () => {
    render(<Header />);
    
    const githubIcon = screen.getByTestId('github-icon');
    expect(githubIcon).toBeInTheDocument();
    expect(githubIcon).toHaveAttribute('data-size', '1rem');
    
    // Check the GitHub link
    const githubLink = screen.getByRole('link', { name: /GitHub/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/nipsysdev/site');
    expect(githubLink).toHaveAttribute('rel', 'noopener');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('applies correct button variants and sizes', () => {
    render(<Header />);
    
    const buttons = screen.getAllByTestId(/button-outlined-small/);
    expect(buttons.length).toBeGreaterThan(0);
    
    // Should have one button for each language plus the GitHub button
    expect(buttons.length).toBe(Object.keys(LangLabels).length + 1);
  });

  it('renders language buttons with proper links', () => {
    render(<Header />);
    
    Object.keys(LangLabels).forEach((lang) => {
      const link = screen.getByRole('link', { name: new RegExp(LangLabels[lang].slice(0, 2), 'i') });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test-path');
      expect(link).toHaveAttribute('data-locale', lang);
    });
  });
});
