import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RootPage from '../page';

// Mock the LoadSequence component
vi.mock('@/components/LoadSequence', () => ({
  default: () => <div data-testid="load-sequence">LoadSequence Component</div>,
}));

describe('RootPage', () => {
  it('should render the LoadSequence component', () => {
    render(<RootPage />);

    expect(screen.getByTestId('load-sequence')).toBeInTheDocument();
    expect(screen.getByText('LoadSequence Component')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(<RootPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
