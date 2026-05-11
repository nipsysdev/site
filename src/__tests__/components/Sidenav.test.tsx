import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Sidenav from '@/components/layout/Sidenav';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('@/i18n/intl', () => ({
  Link: vi.fn(({ children, href }) => <a href={href}>{children}</a>),
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/constants/routes', () => ({
  Routes: {
    Home: '/',
    About: '/about',
    Contact: '/contact',
  },
}));

vi.mock('@nipsys/lsd', () => ({
  SidebarProvider: vi.fn(({ children }) => (
    <div data-testid="sidebar-provider">{children}</div>
  )),
  Sidebar: vi.fn(({ children }) => <div data-testid="sidebar">{children}</div>),
  SidebarContent: vi.fn(({ children }) => (
    <div data-testid="sidebar-content">{children}</div>
  )),
  SidebarGroup: vi.fn(({ children }) => (
    <div data-testid="sidebar-group">{children}</div>
  )),
  SidebarGroupContent: vi.fn(({ children }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  )),
  SidebarGroupLabel: vi.fn(({ children }) => (
    <div data-testid="sidebar-group-label">{children}</div>
  )),
  SidebarMenu: vi.fn(({ children }) => (
    <nav data-testid="sidebar-menu">{children}</nav>
  )),
  SidebarMenuItem: vi.fn(({ children }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  )),
  SidebarMenuButton: vi.fn(({ children, isActive, asChild }) => (
    <button
      type="button"
      data-testid="sidebar-menu-button"
      data-active={isActive}
      data-as-child={asChild}
    >
      {children}
    </button>
  )),
  SidebarInset: vi.fn(({ children }) => (
    <div data-testid="sidebar-inset">{children}</div>
  )),
  SidebarFooter: vi.fn(({ children }) => (
    <div data-testid="sidebar-footer">{children}</div>
  )),
  SidebarTrigger: vi.fn(() => (
    <button type="button" data-testid="sidebar-trigger">
      Toggle
    </button>
  )),
  Card: vi.fn(({ children }) => <div data-testid="card">{children}</div>),
  CardContent: vi.fn(({ children }) => (
    <div data-testid="card-content">{children}</div>
  )),
  ScrollArea: vi.fn(({ children }) => (
    <div data-testid="scroll-area">{children}</div>
  )),
  Typography: vi.fn(({ children }) => <span>{children}</span>),
}));

vi.mock('@/components/layout/Header', () => ({
  default: vi.fn(() => <div data-testid="header">Header</div>),
}));

import { usePathname } from '@/i18n/intl';

describe('Sidenav', () => {
  const mockUsePathname = vi.mocked(usePathname);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders complete sidebar layout structure', () => {
      render(<Sidenav>Content</Sidenav>);

      const sidebarProvider = screen.getByTestId('sidebar-provider');
      const sidebar = screen.getByTestId('sidebar');
      const sidebarInset = screen.getByTestId('sidebar-inset');

      expect(sidebarProvider).toBeInTheDocument();
      expect(sidebar).toBeInTheDocument();
      expect(sidebarInset).toBeInTheDocument();

      expect(sidebarProvider).toContainElement(sidebar);
      expect(sidebarProvider).toContainElement(sidebarInset);
    });

    it('renders children inside main content area', () => {
      render(<Sidenav>Test Content</Sidenav>);

      const content = screen.getByText('Test Content');
      const sidebarInset = screen.getByTestId('sidebar-inset');

      expect(content).toBeInTheDocument();
      expect(sidebarInset).toContainElement(content);
    });

    it('renders Header in layout', () => {
      render(<Sidenav>Content</Sidenav>);

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('renders navigation menu items', () => {
      render(<Sidenav>Content</Sidenav>);
      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
    });

    it('renders menu items for each route', () => {
      render(<Sidenav>Content</Sidenav>);
      const menuItems = screen.getAllByTestId('sidebar-menu-item');
      expect(menuItems).toHaveLength(6);
    });

    it('marks active route correctly', () => {
      mockUsePathname.mockReturnValue('/about');
      render(<Sidenav>Content</Sidenav>);

      const buttons = screen.getAllByTestId('sidebar-menu-button');
      const aboutButton = buttons.find((btn) => btn.textContent === 'About');
      expect(aboutButton).toHaveAttribute('data-active', 'true');
    });

    it('marks home as active when on root path', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Sidenav>Content</Sidenav>);

      const buttons = screen.getAllByTestId('sidebar-menu-button');
      const homeButton = buttons.find((btn) => btn.textContent === 'Home');
      expect(homeButton).toHaveAttribute('data-active', 'true');
    });

    it('handles trailing slashes in pathname', () => {
      mockUsePathname.mockReturnValue('/about/');
      render(<Sidenav>Content</Sidenav>);

      const buttons = screen.getAllByTestId('sidebar-menu-button');
      const aboutButton = buttons.find((btn) => btn.textContent === 'About');
      expect(aboutButton).toHaveAttribute('data-active', 'true');
    });
  });
});
