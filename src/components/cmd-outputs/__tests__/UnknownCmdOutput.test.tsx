import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UnknownCmdOutput from '../UnknownCmdOutput';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock react-icons
vi.mock('react-icons/pi', () => ({
  PiSmileyNervousFill: ({ size }: { size: string }) => (
    <div data-testid="nervous-smiley-icon" data-size={size}>
      😬
    </div>
  ),
}));

describe('UnknownCmdOutput', () => {
  it('renders without crashing', () => {
    const { container } = render(<UnknownCmdOutput cmdName="test" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders the command name', () => {
    const cmdName = 'invalidCommand';
    render(<UnknownCmdOutput cmdName={cmdName} />);
    expect(screen.getByText(cmdName, { exact: false })).toBeInTheDocument();
  });

  it('renders the nervous smiley icon', () => {
    render(<UnknownCmdOutput cmdName="test" />);
    expect(screen.getByTestId('nervous-smiley-icon')).toBeInTheDocument();
  });

  it('renders the error message', () => {
    render(<UnknownCmdOutput cmdName="test" />);
    expect(screen.getByText('unknownCmdErr', { exact: false })).toBeInTheDocument();
  });

  it('sets the correct icon size', () => {
    render(<UnknownCmdOutput cmdName="test" />);
    const icon = screen.getByTestId('nervous-smiley-icon');
    expect(icon).toHaveAttribute('data-size', '1.2rem');
  });

  it('renders with proper CSS classes', () => {
    const { container } = render(<UnknownCmdOutput cmdName="test" />);
    
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('flex', 'items-center', 'gap-x-1');
  });

  it('displays the full error message format', () => {
    const cmdName = 'someCommand';
    render(<UnknownCmdOutput cmdName={cmdName} />);
    
    // Check that both the translation key and command name are present
    expect(screen.getByText(/unknownCmdErr/)).toBeInTheDocument();
    expect(screen.getByText(/someCommand/)).toBeInTheDocument();
  });
});
