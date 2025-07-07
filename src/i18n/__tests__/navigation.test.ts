import { describe, it, expect, vi } from 'vitest';

// Mock next-intl/navigation module
vi.mock('next-intl/navigation', () => ({
  createNavigation: vi.fn(() => ({
    Link: vi.fn(),
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
    getPathname: vi.fn(),
  })),
}));

// Mock the routing module
vi.mock('../routing', () => ({
  routing: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
}));

describe('i18n navigation', () => {
  describe('navigation exports', () => {
    it('should export navigation utilities when imported', async () => {
      // Import after mocks are set up
      const navigation = await import('../navigation');
      
      expect(navigation.Link).toBeDefined();
      expect(navigation.redirect).toBeDefined();
      expect(navigation.usePathname).toBeDefined();
      expect(navigation.useRouter).toBeDefined();
      expect(navigation.getPathname).toBeDefined();
    });

    it('should export Link component', async () => {
      const { Link } = await import('../navigation');
      expect(Link).toBeDefined();
      expect(typeof Link).toBe('function');
    });

    it('should export redirect function', async () => {
      const { redirect } = await import('../navigation');
      expect(redirect).toBeDefined();
      expect(typeof redirect).toBe('function');
    });

    it('should export usePathname hook', async () => {
      const { usePathname } = await import('../navigation');
      expect(usePathname).toBeDefined();
      expect(typeof usePathname).toBe('function');
    });

    it('should export useRouter hook', async () => {
      const { useRouter } = await import('../navigation');
      expect(useRouter).toBeDefined();
      expect(typeof useRouter).toBe('function');
    });

    it('should export getPathname function', async () => {
      const { getPathname } = await import('../navigation');
      expect(getPathname).toBeDefined();
      expect(typeof getPathname).toBe('function');
    });

    it('should have all navigation utilities available', async () => {
      const navigation = await import('../navigation');
      const { Link, redirect, usePathname, useRouter, getPathname } = navigation;
      const exports = { Link, redirect, usePathname, useRouter, getPathname };
      
      for (const [name, func] of Object.entries(exports)) {
        expect(func, `${name} should be defined`).toBeDefined();
        expect(typeof func, `${name} should be a function`).toBe('function');
      }
    });

    it('should export exactly 5 navigation utilities', async () => {
      const navigation = await import('../navigation');
      const exportedKeys = Object.keys(navigation);
      
      expect(exportedKeys).toContain('Link');
      expect(exportedKeys).toContain('redirect');
      expect(exportedKeys).toContain('usePathname');
      expect(exportedKeys).toContain('useRouter');
      expect(exportedKeys).toContain('getPathname');
      expect(exportedKeys).toHaveLength(5);
    });
  });
});
