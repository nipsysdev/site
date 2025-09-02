import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutMe from '../AboutMe';

describe('AboutMe', () => {
  it('should render the component', () => {
    render(<AboutMe />);

    expect(screen.getByText('about me / todo')).toBeInTheDocument();
  });
});
