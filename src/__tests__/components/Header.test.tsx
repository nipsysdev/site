import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Header from '@/components/layout/Header';

vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => store.get()),
}));

vi.mock('@/stores/theme-store', () => ({
  $isDarkMode: {
    get: vi.fn(() => false),
  },
  toggleTheme: vi.fn(),
}));

vi.mock('@/i18n/intl', () => ({
  Link: vi.fn(({ children, href, locale }) => (
    <a href={href} data-locale={locale}>
      {children}
    </a>
  )),
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/constants/lang', () => ({
  LangLabels: {
    en: 'English',
    fr: 'Français',
  },
}));

import { $isDarkMode, toggleTheme } from '@/stores/theme-store';

describe('Header', () => {
  const mockIsDarkModeGet = vi.mocked($isDarkMode.get);
  const mockToggleTheme = vi.mocked(toggleTheme);

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDarkModeGet.mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders language buttons', () => {
      render(<Header />);
      expect(screen.getByText('En')).toBeInTheDocument();
      expect(screen.getByText('Fr')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      render(<Header />);
      // The button should have an aria-label
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    });

    it('renders GitHub link button', () => {
      render(<Header />);
      const githubLink = screen.getByRole('link', { name: '' });
      expect(githubLink).toHaveAttribute(
        'href',
        'https://github.com/nipsysdev/site',
      );
    });
  });

  describe('theme toggle', () => {
    it('shows moon icon in light mode', () => {
      mockIsDarkModeGet.mockReturnValue(false);
      render(<Header />);
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    });

    it('shows sun icon in dark mode', () => {
      mockIsDarkModeGet.mockReturnValue(true);
      render(<Header />);
      expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    });

    it('calls toggleTheme when theme button is clicked', () => {
      render(<Header />);
      const themeButton = screen.getByLabelText('Switch to dark mode');
      fireEvent.click(themeButton);
      expect(mockToggleTheme).toHaveBeenCalled();
    });
  });

  describe('language links', () => {
    it('links to current pathname with locale', () => {
      render(<Header />);
      const enLink = screen.getByText('En');
      const frLink = screen.getByText('Fr');

      expect(enLink.closest('a')).toHaveAttribute('data-locale', 'en');
      expect(frLink.closest('a')).toHaveAttribute('data-locale', 'fr');
    });
  });

  describe('accessibility', () => {
    it('has aria-label on theme toggle button', () => {
      render(<Header />);
      expect(screen.getByLabelText(/Switch to/)).toBeInTheDocument();
    });

    it('has rel="noopener" on external link', () => {
      render(<Header />);
      const externalLink = screen.getByRole('link', { name: '' });
      expect(externalLink).toHaveAttribute('rel', 'noopener');
    });

    it('has target="_blank" on external link', () => {
      render(<Header />);
      const externalLink = screen.getByRole('link', { name: '' });
      expect(externalLink).toHaveAttribute('target', '_blank');
    });
  });
});
