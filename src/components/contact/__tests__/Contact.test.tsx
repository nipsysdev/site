import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Contact from '../Contact';

describe('Contact', () => {
  it('should render the component', () => {
    render(<Contact />);

    expect(screen.getByText('contact / todo')).toBeInTheDocument();
  });
});
