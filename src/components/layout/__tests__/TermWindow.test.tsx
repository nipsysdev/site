import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Routes } from '@/constants/routes';
import TerminalWindow from '../TermWindow';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the i18n navigation
vi.mock('@/i18n/intl', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => '/mission',
}));

// Mock LSD React components
vi.mock('@acid-info/lsd-react/client/Tabs', () => ({
  Tabs: ({
    children,
    className,
    activeTab,
    fullWidth,
  }: {
    children: React.ReactNode;
    className?: string;
    activeTab: string;
    fullWidth?: boolean;
  }) => (
    <div
      data-testid="tabs"
      className={className}
      data-active-tab={activeTab}
      data-full-width={fullWidth}
    >
      {children}
    </div>
  ),
}));

vi.mock('@acid-info/lsd-react/client/TabItem', () => ({
  TabItem: ({
    children,
    name,
    className,
  }: {
    children: React.ReactNode;
    name: string;
    className?: string;
  }) => (
    <div
      data-testid={`tab-item-${name}`}
      className={className}
      data-name={name}
    >
      {children}
    </div>
  ),
}));

describe('TerminalWindow', () => {
  const mockChildren = <div data-testid="mock-children">Test content</div>;

  it('sets correct active tab based on pathname', () => {
    render(<TerminalWindow>{mockChildren}</TerminalWindow>);

    const tabs = screen.getByTestId('tabs');
    expect(tabs).toHaveAttribute('data-active-tab', 'mission');
  });

  it('renders tab items for all routes', () => {
    render(<TerminalWindow>{mockChildren}</TerminalWindow>);

    Object.entries(Routes).forEach(([routeName, routePath]) => {
      const tabItem = screen.getByTestId(`tab-item-${routeName}`);
      expect(tabItem).toBeInTheDocument();
      expect(tabItem).toHaveAttribute('data-name', routeName);

      // Check the link inside the tab
      const link = screen.getByRole('link', { name: routeName });
      expect(link).toHaveAttribute('href', routePath);
    });
  });

  it('renders children content', () => {
    render(<TerminalWindow>{mockChildren}</TerminalWindow>);
    expect(screen.getByTestId('mock-children')).toBeInTheDocument();
  });
});
