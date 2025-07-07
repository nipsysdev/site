import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutMe from '../AboutMe';

describe('AboutMe', () => {
  it('should render the component', () => {
    render(<AboutMe />);
    
    expect(screen.getByText('about me / todo')).toBeInTheDocument();
  });

  it('should render as a div element', () => {
    const { container } = render(<AboutMe />);
    
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('should have the expected content', () => {
    const { container } = render(<AboutMe />);
    
    expect(container.firstChild?.textContent).toBe('about me / todo');
  });

  it('should render without any props', () => {
    expect(() => render(<AboutMe />)).not.toThrow();
  });

  it('should match snapshot', () => {
    const { container } = render(<AboutMe />);
    
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        about me / todo
      </div>
    `);
  });
});
