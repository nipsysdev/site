import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Contact from '../Contact';

describe('Contact', () => {
  it('should render the component', () => {
    render(<Contact />);
    
    expect(screen.getByText('contact / todo')).toBeInTheDocument();
  });

  it('should render as a div element', () => {
    const { container } = render(<Contact />);
    
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('should have the expected content', () => {
    const { container } = render(<Contact />);
    
    expect(container.firstChild?.textContent).toBe('contact / todo');
  });

  it('should render without any props', () => {
    expect(() => render(<Contact />)).not.toThrow();
  });

  it('should match snapshot', () => {
    const { container } = render(<Contact />);
    
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        contact / todo
      </div>
    `);
  });
});
