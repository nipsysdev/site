import { describe, expect, it, vi } from 'vitest';

// Mock next-intl modules before importing the module under test
vi.mock('next-intl', () => ({
  hasLocale: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getRequestConfig: vi.fn((configFn) => configFn),
}));

vi.mock('./routing', () => ({
  routing: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
}));

describe('i18n request configuration', () => {
  describe('getRequestConfig', () => {
    it('should handle valid locales correctly', async () => {
      const { hasLocale } = await import('next-intl');
      const requestConfig = await import('../request');

      // Mock hasLocale to return true for 'en'
      vi.mocked(hasLocale).mockReturnValue(true);

      // Mock dynamic import
      vi.doMock('@/i18n/messages/en.json', () => ({
        default: { welcome: 'Welcome' },
      }));

      const mockRequestLocale = Promise.resolve('en');
      const result = await requestConfig.default({
        requestLocale: mockRequestLocale,
      });

      expect(result.locale).toBe('en');
      expect(hasLocale).toHaveBeenCalledWith(['en', 'fr'], 'en');
    });

    it('should fall back to default locale for invalid locales', async () => {
      const { hasLocale } = await import('next-intl');
      const requestConfig = await import('../request');

      // Mock hasLocale to return false for invalid locale
      vi.mocked(hasLocale).mockReturnValue(false);

      // Mock dynamic import for default locale
      vi.doMock('@/i18n/messages/en.json', () => ({
        default: { welcome: 'Welcome' },
      }));

      const mockRequestLocale = Promise.resolve('invalid');
      const result = await requestConfig.default({
        requestLocale: mockRequestLocale,
      });

      expect(result.locale).toBe('en'); // Should fall back to default
      expect(hasLocale).toHaveBeenCalledWith(['en', 'fr'], 'invalid');
    });
  });
});
