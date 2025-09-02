import { describe, expect, it, vi } from 'vitest';

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
  });
});
