import { describe, expect, it } from 'vitest';
import { routing } from '../routing';

describe('i18n routing', () => {
  describe('routing configuration', () => {
    it('should have correct routing configuration', () => {
      expect(routing.locales).toEqual(['en', 'fr']);
      expect(routing.defaultLocale).toBe('en');
      expect(routing.localePrefix).toBe('always');
      expect(routing.localeDetection).toBe(false);
    });
  });
});
