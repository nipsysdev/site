import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

import { getTranslations } from 'next-intl/server';
import type { Translator } from '@/i18n/intl';
import type { RouteData } from '@/types/routing';

const { setPageMeta } = await import('@/utils/metadata-utils');

describe('metadata-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('setPageMeta', () => {
    const mockGetTranslations = vi.mocked(getTranslations);

    const createMockRouteData = (locale: string): RouteData => ({
      params: Promise.resolve({ locale }),
    });

    it('returns base metadata when no page is provided', async () => {
      mockGetTranslations.mockResolvedValue(((key: string) => {
        const translations: Record<string, string> = {
          title: 'My Site',
          description: 'My personal website',
        };
        return translations[key] ?? key;
      }) as Translator);

      const routeData = createMockRouteData('en');
      const result = await setPageMeta(routeData);

      expect(result).toEqual({
        title: 'My Site',
        description: 'My personal website',
      });
    });

    it('returns base metadata for undefined page', async () => {
      mockGetTranslations.mockResolvedValue(((key: string) => {
        const translations: Record<string, string> = {
          title: 'My Site',
          description: 'My personal website',
        };
        return translations[key] ?? key;
      }) as Translator);

      const routeData = createMockRouteData('en');
      const result = await setPageMeta(routeData, undefined);

      expect(result).toEqual({
        title: 'My Site',
        description: 'My personal website',
      });
    });

    it('returns combined metadata when page is provided', async () => {
      mockGetTranslations.mockImplementation(async (opts) => {
        const namespace = typeof opts === 'string' ? opts : opts?.namespace;
        if (namespace === 'Metadata') {
          return ((key: string) => {
            const translations: Record<string, string> = {
              title: 'My Site',
              description: 'My personal website',
            };
            return translations[key] ?? key;
          }) as Translator;
        }
        if (namespace === 'Pages') {
          return ((key: string) => {
            const translations: Record<string, string> = {
              about: 'About Me',
            };
            return translations[key] ?? key;
          }) as Translator;
        }
        return ((key: string) => key) as Translator;
      });

      const routeData = createMockRouteData('en');
      const result = await setPageMeta(routeData, 'about');

      expect(result).toEqual({
        title: 'About Me @ My Site',
        description: 'My personal website',
      });
    });

    it('uses correct locale from routeData', async () => {
      let capturedLocale: string | undefined;

      mockGetTranslations.mockImplementation(async (opts) => {
        capturedLocale = typeof opts === 'string' ? undefined : opts?.locale;
        return ((key: string) => {
          const translations: Record<string, string> = {
            title: 'Mon Site',
            description: 'Mon site personnel',
          };
          return translations[key] ?? key;
        }) as Translator;
      });

      const routeData = createMockRouteData('fr');
      await setPageMeta(routeData);

      expect(capturedLocale).toBe('fr');
    });

    it('calls getTranslations with correct namespaces', async () => {
      mockGetTranslations.mockImplementation(async (opts) => {
        const namespace = typeof opts === 'string' ? opts : opts?.namespace;
        if (namespace === 'Metadata') {
          return ((key: string) => {
            const translations: Record<string, string> = {
              title: 'Test Title',
              description: 'Test Description',
            };
            return translations[key] ?? key;
          }) as Translator;
        }
        if (namespace === 'Pages') {
          return ((key: string) => {
            const translations: Record<string, string> = {
              contact: 'Page: contact',
            };
            return translations[key] ?? key;
          }) as Translator;
        }
        return ((key: string) => key) as Translator;
      });

      const routeData = createMockRouteData('en');
      await setPageMeta(routeData, 'contact');

      // Should call getTranslations twice: once for Metadata, once for Pages
      expect(mockGetTranslations).toHaveBeenCalledTimes(2);
    });

    it('calls getTranslations once when no page is provided', async () => {
      mockGetTranslations.mockResolvedValue(((key: string) => {
        const translations: Record<string, string> = {
          title: 'Test Title',
          description: 'Test Description',
        };
        return translations[key] ?? key;
      }) as Translator);

      const routeData = createMockRouteData('en');
      await setPageMeta(routeData);

      // Should call getTranslations once for Metadata only
      expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    });

    it('handles different page names', async () => {
      mockGetTranslations.mockImplementation(async (opts) => {
        const namespace = typeof opts === 'string' ? opts : opts?.namespace;
        if (namespace === 'Metadata') {
          return ((key: string) => {
            const translations: Record<string, string> = {
              title: 'Site',
              description: 'Description',
            };
            return translations[key] ?? key;
          }) as Translator;
        }
        if (namespace === 'Pages') {
          return ((key: string) => {
            const translations: Record<string, string> = {
              whoami: 'Whoami',
              contact: 'Contact',
            };
            return translations[key] ?? key;
          }) as Translator;
        }
        return ((key: string) => key) as Translator;
      });

      const routeData = createMockRouteData('en');

      const resultWhoami = await setPageMeta(routeData, 'whoami');
      expect(resultWhoami.title).toBe('Whoami @ Site');

      const resultContact = await setPageMeta(routeData, 'contact');
      expect(resultContact.title).toBe('Contact @ Site');
    });

    it('handles empty string page', async () => {
      mockGetTranslations.mockResolvedValue(((key: string) => {
        const translations: Record<string, string> = {
          title: 'Site',
          description: 'Description',
        };
        return translations[key] ?? key;
      }) as Translator);

      const routeData = createMockRouteData('en');
      // Empty string is falsy, so it should return base metadata
      const result = await setPageMeta(routeData, '');

      expect(result).toEqual({
        title: 'Site',
        description: 'Description',
      });
    });
  });
});
