import { describe, it, expect, vi } from 'vitest';
import { setPageMeta } from '@/utils/metadata-utils';
import type { RouteData } from '@/types/routing';

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

    it('should handle different locales', async () => {
      const { getTranslations } = await import('next-intl/server');
      const mockGetTranslations = vi.mocked(getTranslations);
      
      const mockTMeta = vi.fn((key: string) => {
        if (key === 'title') return 'Site de Test';
        if (key === 'description') return 'Description de Test';
        return key;
      });
      
      mockGetTranslations.mockResolvedValue(mockTMeta);

      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'fr' }),
      };

      const result = await setPageMeta(routeData);

      expect(result).toEqual({
        title: 'Site de Test',
        description: 'Description de Test',
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'fr',
        namespace: 'Metadata',
      });
    });

    it('should handle whoami page', async () => {
      const { getTranslations } = await import('next-intl/server');
      const mockGetTranslations = vi.mocked(getTranslations);
      
      const mockTMeta = vi.fn((key: string) => {
        if (key === 'title') return 'My Site';
        if (key === 'description') return 'My Description';
        return key;
      });
      
      const mockTPages = vi.fn((key: string) => {
        if (key === 'whoami') return 'Who Am I';
        return key;
      });
      
      mockGetTranslations
        .mockResolvedValueOnce(mockTMeta)
        .mockResolvedValueOnce(mockTPages);

      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      const result = await setPageMeta(routeData, 'whoami');

      expect(result).toEqual({
        title: 'Who Am I @ My Site',
        description: 'My Description',
      });
    });

    it('should handle mission page', async () => {
      const { getTranslations } = await import('next-intl/server');
      const mockGetTranslations = vi.mocked(getTranslations);
      
      const mockTMeta = vi.fn((key: string) => {
        if (key === 'title') return 'My Site';
        if (key === 'description') return 'My Description';
        return key;
      });
      
      const mockTPages = vi.fn((key: string) => {
        if (key === 'mission') return 'Mission';
        return key;
      });
      
      mockGetTranslations
        .mockResolvedValueOnce(mockTMeta)
        .mockResolvedValueOnce(mockTPages);

      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      const result = await setPageMeta(routeData, 'mission');

      expect(result).toEqual({
        title: 'Mission @ My Site',
        description: 'My Description',
      });
    });

    it('should handle terminal page', async () => {
      const { getTranslations } = await import('next-intl/server');
      const mockGetTranslations = vi.mocked(getTranslations);
      
      const mockTMeta = vi.fn((key: string) => {
        if (key === 'title') return 'My Site';
        if (key === 'description') return 'My Description';
        return key;
      });
      
      const mockTPages = vi.fn((key: string) => {
        if (key === 'terminal') return 'Terminal';
        return key;
      });
      
      mockGetTranslations
        .mockResolvedValueOnce(mockTMeta)
        .mockResolvedValueOnce(mockTPages);

      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      const result = await setPageMeta(routeData, 'terminal');

      expect(result).toEqual({
        title: 'Terminal @ My Site',
        description: 'My Description',
      });
    });
  });
});
