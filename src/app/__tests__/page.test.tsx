import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RootPage from '../page';

vi.mock('@/components/LocaleRedirect', () => ({
  default: () => <div data-testid="locale-redirect">LocaleRedirect</div>,
}));

describe('RootPage', () => {
  it('should render LocaleRedirect component', () => {
    render(<RootPage />);

    expect(screen.getByTestId('locale-redirect')).toBeInTheDocument();
  });
});
