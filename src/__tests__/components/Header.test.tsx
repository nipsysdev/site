import { SidebarProvider } from '@nipsys/lsd';
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
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en'),
}));

vi.mock('@/constants/lang', () => ({
  LangLabels: {
    en: 'En',
    fr: 'Fr',
  },
}));

vi.mock('@nipsys/lsd', () => ({
  SidebarProvider: vi.fn(({ children }) => (
    <div data-testid="sidebar-provider">{children}</div>
  )),
  SidebarTrigger: vi.fn(() => (
    <button type="button" data-testid="sidebar-trigger">
      Toggle
    </button>
  )),
  ButtonGroup: vi.fn(({ children }) => (
    <div data-testid="button-group">{children}</div>
  )),
  Button: vi.fn(({ children, ...props }) => (
    <button type="button" data-testid="button" {...props}>
      {children}
    </button>
  )),
  Icon: vi.fn(() => <span data-testid="icon" />),
  Typography: vi.fn(({ children }) => <span>{children}</span>),
  ToggleGroup: vi.fn(({ children, value, onValueChange, ...props }) => (
    <fieldset
      {...props}
      data-testid="toggle-group"
      data-value={value}
      onValueChange={onValueChange}
    >
      {children}
    </fieldset>
  )),
  ToggleGroupItem: vi.fn(({ children, value, ...props }) => (
    // biome-ignore lint/a11y/useSemanticElements: Mock component for testing
    <div
      {...props}
      data-testid={`toggle-item-${value}`}
      role="radio"
      tabIndex={0}
      aria-checked={value === props.value}
    >
      {children}
    </div>
  )),
  Toggle: vi.fn(({ children, value, asChild, ...props }) =>
    asChild ? (
      children
    ) : (
      // biome-ignore lint/a11y/useSemanticElements: Mock component for testing
      <div
        data-testid={`toggle-${value}`}
        role="radio"
        tabIndex={0}
        aria-checked={value === props.value}
        {...props}
      >
        {children}
      </div>
    ),
  ),
  useIsMobile: vi.fn(() => false),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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
      render(
        <SidebarProvider>
          <Header />
        </SidebarProvider>,
      );
      expect(screen.getByText('En')).toBeInTheDocument();
      expect(screen.getByText('Fr')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      render(
        <SidebarProvider>
          <Header />
        </SidebarProvider>,
      );
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    });
  });

  describe('theme toggle', () => {
    it('shows moon icon in light mode', () => {
      mockIsDarkModeGet.mockReturnValue(false);
      render(
        <SidebarProvider>
          <Header />
        </SidebarProvider>,
      );
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    });

    it('shows sun icon in dark mode', () => {
      mockIsDarkModeGet.mockReturnValue(true);
      render(
        <SidebarProvider>
          <Header />
        </SidebarProvider>,
      );
      expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    });

    it('calls toggleTheme when theme button is clicked', () => {
      render(
        <SidebarProvider>
          <Header />
        </SidebarProvider>,
      );
      const themeButton = screen.getByLabelText('Switch to dark mode');
      fireEvent.click(themeButton);
      expect(mockToggleTheme).toHaveBeenCalled();
    });
  });

  describe('language links', () => {
    it('links to current pathname with locale', () => {
      render(
        <SidebarProvider>
          <Header />
        </SidebarProvider>,
      );
      const enLink = screen.getByText('En');
      const frLink = screen.getByText('Fr');

      expect(enLink).toBeInTheDocument();
      expect(frLink).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-label on theme toggle button', () => {
      render(
        <SidebarProvider>
          <Header />
        </SidebarProvider>,
      );
      expect(screen.getByLabelText(/Switch to/)).toBeInTheDocument();
    });
  });
});
