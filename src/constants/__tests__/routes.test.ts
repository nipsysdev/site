import { describe, expect, it } from 'vitest';
import { Routes } from '@/constants/routes';

describe('routes', () => {
  describe('Routes object', () => {
    it('should have all expected routes', () => {
      expect(Routes.terminal).toBe('/');
      expect(Routes.whoami).toBe('/whoami');
      expect(Routes.web2work).toBe('/web2work');
      expect(Routes.web3work).toBe('/web3work');
      expect(Routes.contribs).toBe('/contribs');
      expect(Routes.contact).toBe('/contact');
    });
  });
});
