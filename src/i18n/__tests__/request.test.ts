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
    it('should export a request configuration function', async () => {
      // Import after mocks are set up
      const requestConfig = await import('../request');

      expect(requestConfig.default).toBeDefined();
      expect(typeof requestConfig.default).toBe('function');
    });

    it('should be a function that can be called with request locale parameter', async () => {
      const { hasLocale } = await import('next-intl');
      const requestConfig = await import('../request');

      // Mock hasLocale to return true for valid locales
      vi.mocked(hasLocale).mockImplementation((locales, locale) =>
        (locales as string[]).includes(locale as string),
      );

      // Mock dynamic import
      vi.doMock(
        '@/i18n/messages/en.json',
        () => ({
          default: { test: 'English test message' },
        }),
        { virtual: true },
      );

      const mockRequestLocale = Promise.resolve('en');
      const result = await requestConfig.default({
        requestLocale: mockRequestLocale,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('locale');
      expect(result).toHaveProperty('messages');
    });

    it('should handle valid locales correctly', async () => {
      const { hasLocale } = await import('next-intl');
      const requestConfig = await import('../request');

      // Mock hasLocale to return true for 'en'
      vi.mocked(hasLocale).mockReturnValue(true);

      // Mock dynamic import
      vi.doMock(
        '@/i18n/messages/en.json',
        () => ({
          default: { welcome: 'Welcome' },
        }),
        { virtual: true },
      );

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
      vi.doMock(
        '@/i18n/messages/en.json',
        () => ({
          default: { welcome: 'Welcome' },
        }),
        { virtual: true },
      );

      const mockRequestLocale = Promise.resolve('invalid');
      const result = await requestConfig.default({
        requestLocale: mockRequestLocale,
      });

      expect(result.locale).toBe('en'); // Should fall back to default
      expect(hasLocale).toHaveBeenCalledWith(['en', 'fr'], 'invalid');
    });

    it('should handle different valid locales', async () => {
      const { hasLocale } = await import('next-intl');
      const requestConfig = await import('../request');

      // Test French locale
      vi.mocked(hasLocale).mockReturnValue(true);

      // Mock dynamic import for French
      vi.doMock(
        '@/i18n/messages/fr.json',
        () => ({
          default: { welcome: 'Bienvenue' },
        }),
        { virtual: true },
      );

      const mockRequestLocale = Promise.resolve('fr');
      const result = await requestConfig.default({
        requestLocale: mockRequestLocale,
      });

      expect(result.locale).toBe('fr');
      expect(hasLocale).toHaveBeenCalledWith(['en', 'fr'], 'fr');
    });
  });

  describe('module structure', () => {
    it('should export default function', async () => {
      const module = await import('../request');

      expect(module.default).toBeDefined();
      expect(typeof module.default).toBe('function');
    });

    it('should not export named exports', async () => {
      const module = await import('../request');

      // Should only have default export
      const exports = Object.keys(module).filter((key) => key !== 'default');
      expect(exports).toHaveLength(0);
    });
  });
});
