import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Routes } from '@/constants/routes';
import Sidenav from '../Sidenav';

// Mock variables
let mockUsePathname: () => string;
let mockLink: ReturnType<typeof vi.fn>;

// Define getter functions on globalThis for dynamic access
(globalThis as any).getMockUsePathname = () => mockUsePathname;
(globalThis as any).getMockLink = () => mockLink;

// Mock i18n/intl with a factory that calls global getters
vi.mock('@/i18n/intl', () => ({
  Link: (props: any) => (globalThis as any).getMockLink()(props),
  usePathname: () => (globalThis as any).getMockUsePathname()(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
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

// Mock styles
vi.mock('@/styles/components.module.css', () => ({
  default: {
    smallBtnLink: 'small-btn-link',
  },
}));

// Mock shadcn-lsd Sidebar components
vi.mock('@nipsys/shadcn-lsd', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <nav data-testid="sidebar">{children}</nav>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="sidebar-menu">{children}</ul>
  ),
  SidebarMenuButton: ({
    children,
    isActive,
  }: {
    children: React.ReactNode;
    isActive?: boolean;
  }) => (
    <li data-testid="sidebar-menu-button" data-active={isActive}>
      {children}
    </li>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  SidebarTrigger: () => (
    <button type="button" data-testid="sidebar-trigger">
      Toggle Sidebar
    </button>
  ),
  // Header components
  Button: ({
    children,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      type="button"
      data-testid={`button-${variant || 'default'}-${size || 'default'}`}
      className={className}
    >
      {children}
    </button>
  ),
  ButtonGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="button-group">{children}</div>
  ),
}));

describe('Sidenav', () => {
  beforeEach(() => {
    // Reset mocks and state before each test
    vi.clearAllMocks();
    mockUsePathname = () => '/';

    mockLink = vi.fn(
      ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
      ),
    );
  });

  it('renders sidebar with navigation links', () => {
    render(<Sidenav>Test children</Sidenav>);

    // Check sidebar provider is rendered
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();

    // Check sidebar is rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();

    // Check sidebar trigger is rendered
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();

    // Check all navigation links are rendered
    Object.entries(Routes).forEach(([routeName, routePath]) => {
      const link = screen.getByRole('link', { name: routeName });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', routePath);
    });
  });

  it('renders children inside SidebarInset', () => {
    render(<Sidenav>Test children</Sidenav>);

    expect(screen.getByText('Test children')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument();
  });

  it('highlights the active route', () => {
    const activeRoute = 'whoami';
    const activePath = Routes[activeRoute as keyof typeof Routes];
    mockUsePathname = () => activePath;

    render(<Sidenav>Test children</Sidenav>);

    // Find all menu buttons
    const menuButtons = screen.getAllByTestId('sidebar-menu-button');

    // Find the active one
    const activeButton = menuButtons.find(
      (button) => button.getAttribute('data-active') === 'true',
    );
    expect(activeButton).toBeInTheDocument();
    expect(activeButton).toHaveTextContent(activeRoute);
  });

  it('marks root path as active when on home page', () => {
    mockUsePathname = () => '/';

    render(<Sidenav>Test children</Sidenav>);

    const menuButtons = screen.getAllByTestId('sidebar-menu-button');
    const activeButton = menuButtons.find(
      (button) => button.getAttribute('data-active') === 'true',
    );
    expect(activeButton).toBeInTheDocument();
    expect(activeButton).toHaveTextContent('terminal');
  });
});
