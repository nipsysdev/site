import { describe, expect, it } from 'vitest';
import { Routes } from '@/constants/routes';

describe('routes', () => {
  describe('Routes object', () => {
    it('should have all expected routes', () => {
      expect(Routes.terminal).toBe('/');
      expect(Routes.whoami).toBe('/whoami');
      expect(Routes.mission).toBe('/mission');
      expect(Routes.contact).toBe('/contact');
    });
  });
});
