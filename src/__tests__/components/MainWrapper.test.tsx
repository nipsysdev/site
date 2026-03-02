import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MainWrapper from '@/components/layout/MainWrapper';

vi.mock('@/components/layout/Sidenav', () => ({
  default: vi.fn(({ children }) => <div data-testid="sidenav">{children}</div>),
}));

describe('MainWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders Sidenav component', () => {
      render(<MainWrapper>Content</MainWrapper>);
      expect(screen.getByTestId('sidenav')).toBeInTheDocument();
    });

    it('passes children to Sidenav', () => {
      render(<MainWrapper>Test Children</MainWrapper>);
      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });

    it('applies correct layout structure with children', () => {
      render(
        <MainWrapper>
          <main data-testid="main-content">Main Content</main>
        </MainWrapper>,
      );

      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toBeInTheDocument();

      const sidebarInset = screen.getByTestId('sidenav');
      expect(sidebarInset).toContainElement(mainContent);
    });
  });
});
