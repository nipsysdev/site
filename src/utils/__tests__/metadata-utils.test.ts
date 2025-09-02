import { describe, expect, it, vi } from 'vitest';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

describe('metadata-utils', () => {
  describe('setPageMeta', () => {
    it('should return base metadata when no page is specified', async () => {
      const { getTranslations } = await import('next-intl/server');
      const mockGetTranslations = vi.mocked(getTranslations);

      const mockTMeta = vi.fn((key: string) => {
        if (key === 'title') return 'Test Site';
        if (key === 'description') return 'Test Description';
        return key;
      });

      mockGetTranslations.mockResolvedValue(mockTMeta);

      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      const result = await setPageMeta(routeData);

      expect(result).toEqual({
        title: 'Test Site',
        description: 'Test Description',
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'Metadata',
      });
    });

    it('should return page-specific metadata when page is specified', async () => {
      const { getTranslations } = await import('next-intl/server');
      const mockGetTranslations = vi.mocked(getTranslations);

      const mockTMeta = vi.fn((key: string) => {
        if (key === 'title') return 'Test Site';
        if (key === 'description') return 'Test Description';
        return key;
      });

      const mockTPages = vi.fn((key: string) => {
        if (key === 'contact') return 'Contact Page';
        return key;
      });

      mockGetTranslations
        .mockResolvedValueOnce(mockTMeta)
        .mockResolvedValueOnce(mockTPages);

      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      const result = await setPageMeta(routeData, 'contact');

      expect(result).toEqual({
        title: 'Contact Page @ Test Site',
        description: 'Test Description',
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'Metadata',
      });
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'Pages',
      });
    });
  });
});
