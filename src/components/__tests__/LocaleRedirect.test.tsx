import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LocaleRedirect from '../LocaleRedirect';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/i18n/intl', () => ({
  routing: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
}));

describe('LocaleRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to English locale by default', async () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });

    render(<LocaleRedirect />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en');
    });
  });

  it('should redirect to French locale when browser is French', async () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR',
    });

    render(<LocaleRedirect />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/fr');
    });
  });

  it('should fallback to English for unsupported language', async () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'es-ES',
    });

    render(<LocaleRedirect />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en');
    });
  });

  it('should render nothing', () => {
    const { container } = render(<LocaleRedirect />);

    expect(container.firstChild).toBeNull();
  });
});
