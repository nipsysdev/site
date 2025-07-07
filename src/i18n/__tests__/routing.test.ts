import { describe, expect, it } from 'vitest';
import { routing } from '../routing';

describe('i18n routing', () => {
  describe('routing configuration', () => {
    it('should have correct locales configured', () => {
      expect(routing.locales).toEqual(['en', 'fr']);
    });

    it('should have correct default locale', () => {
      expect(routing.defaultLocale).toBe('en');
    });

    it('should have localePrefix set to always', () => {
      expect(routing.localePrefix).toBe('always');
    });

    it('should have localeDetection disabled', () => {
      expect(routing.localeDetection).toBe(false);
    });

    it('should export a valid routing object', () => {
      expect(routing).toBeDefined();
      expect(typeof routing).toBe('object');
      expect(routing.locales).toBeInstanceOf(Array);
      expect(routing.locales.length).toBeGreaterThan(0);
    });

    it('should include English locale', () => {
      expect(routing.locales).toContain('en');
    });

    it('should include French locale', () => {
      expect(routing.locales).toContain('fr');
    });

    it('should only have 2 locales', () => {
      expect(routing.locales).toHaveLength(2);
    });
  });
});
