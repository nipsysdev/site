import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Routes } from '@/constants/routes';
import Sidenav from '../Sidenav';

// Mock variables
let mockSetIsMenuDisplayed: ReturnType<typeof vi.fn>;
let mockIsMenuDisplayed: boolean;
let mockUsePathname: () => string;
let mockLink: ReturnType<typeof vi.fn>;

// Define getter functions on globalThis for dynamic access
(globalThis as any).getMockIsMenuDisplayed = () => mockIsMenuDisplayed;
(globalThis as any).getMockSetIsMenuDisplayed = () => mockSetIsMenuDisplayed;
(globalThis as any).getMockUsePathname = () => mockUsePathname;
(globalThis as any).getMockLink = () => mockLink;

// Mock AppContext with a factory that calls global getters
vi.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({
    isMenuDisplayed: (globalThis as any).getMockIsMenuDisplayed(),
    setIsMenuDisplayed: (globalThis as any).getMockSetIsMenuDisplayed(),
  }),
}));

// Mock i18n/intl with a factory that calls global getters
vi.mock('@/i18n/intl', () => ({
  Link: (props: any) => (globalThis as any).getMockLink()(props),
  usePathname: () => (globalThis as any).getMockUsePathname()(), // Call the getter, then call the returned function
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock styles
vi.mock('@/styles/components.module.css', () => ({
  default: {
    ghostButton: 'ghost-button',
    modal: 'modal',
  },
}));

// Mock LSD React components
vi.mock('@nipsysdev/lsd-react/client/Button', () => ({
  Button: ({
    children,
    variant,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid={`button-${variant || 'default'}`}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

vi.mock('@nipsysdev/lsd-react/client/Modal', () => ({
  Modal: ({
    isOpen,
    onClose,
    children,
    className,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
  }) =>
    isOpen ? (
      <div data-testid="modal" className={className}>
        <button type="button" data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('@nipsysdev/lsd-react/client/ModalBody', () => ({
  ModalBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-body">{children}</div>
  ),
}));

describe('Sidenav', () => {
  beforeEach(() => {
    // Reset mocks and state before each test
    vi.clearAllMocks();
    mockIsMenuDisplayed = false;
    mockSetIsMenuDisplayed = vi.fn();
    mockUsePathname = () => '/';

    mockLink = vi.fn(
      ({
        children,
        href,
        onClick,
      }: {
        children: React.ReactNode;
        href: string;
        onClick?: () => void;
      }) => (
        <a href={href} onClick={onClick}>
          {children}
        </a>
      ),
    );
  });

  it('renders desktop sidebar with navigation links', () => {
    render(<Sidenav />);

    // The sidebar itself is a div, not a nav role, so we check for a child link
    const firstLink = screen.getByRole('link', {
      name: Object.keys(Routes)[0],
    });
    const sidebar = firstLink.closest('div.flex-col');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('hidden'); // It's hidden on small screens by default

    Object.entries(Routes).forEach(([routeName, routePath]) => {
      const link = screen.getByRole('link', { name: routeName });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', routePath);
    });
  });

  it('does not render modal when isMenuDisplayed is false', () => {
    render(<Sidenav />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders modal when isMenuDisplayed is true', () => {
    mockIsMenuDisplayed = true;
    render(<Sidenav />);

    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByTestId('modal-body')).toBeInTheDocument();

    // Scope the link checks to within the modal
    Object.entries(Routes).forEach(([routeName, routePath]) => {
      const link = within(modal).getByRole('link', { name: routeName });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', routePath);
    });
  });

  it('calls setIsMenuDisplayed(false) when modal close button is clicked', () => {
    mockIsMenuDisplayed = true;
    render(<Sidenav />);

    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);

    expect(mockSetIsMenuDisplayed).toHaveBeenCalledTimes(1);
    expect(mockSetIsMenuDisplayed).toHaveBeenCalledWith(false);
  });

  it('calls setIsMenuDisplayed(false) when a link inside the modal is clicked', () => {
    mockIsMenuDisplayed = true;
    render(<Sidenav />);

    const modal = screen.getByTestId('modal');
    const firstRouteName = Object.keys(Routes)[0];
    // Scope the link query to within the modal
    const firstLink = within(modal).getByRole('link', { name: firstRouteName });
    fireEvent.click(firstLink);

    expect(mockSetIsMenuDisplayed).toHaveBeenCalledTimes(1);
    expect(mockSetIsMenuDisplayed).toHaveBeenCalledWith(false);
  });

  it('highlights the active route in the desktop sidebar', () => {
    const activeRoute = 'whoami'; // Example active route
    const activePath = Routes[activeRoute as keyof typeof Routes];
    mockUsePathname = () => activePath;

    render(<Sidenav />);

    const activeButton = screen.getByTestId('button-filled');
    expect(activeButton).toBeInTheDocument();
    // Check that the link inside the active button has the correct name
    expect(activeButton).toHaveTextContent(activeRoute);

    // Check that other buttons are 'outlined'
    Object.keys(Routes).forEach((routeName) => {
      if (routeName !== activeRoute) {
        // We need to be more specific to get the correct button
        const link = screen.getByRole('link', { name: routeName });
        const button = link.closest('button');
        expect(button).toHaveAttribute('data-testid', 'button-outlined');
      }
    });
  });

  it('highlights the active route in the modal', () => {
    const activeRoute = 'web3work'; // Example active route
    const activePath = Routes[activeRoute as keyof typeof Routes];
    mockUsePathname = () => activePath;
    mockIsMenuDisplayed = true;

    render(<Sidenav />);

    const modal = screen.getByTestId('modal');
    // Scope the button query to within the modal
    const activeButton = within(modal).getByTestId('button-filled');
    expect(activeButton).toBeInTheDocument();
    expect(activeButton).toHaveTextContent(activeRoute);
  });
});
