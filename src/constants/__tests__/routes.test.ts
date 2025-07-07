import { describe, it, expect } from 'vitest';
import { Routes } from '@/constants/routes';

describe('routes', () => {
  describe('Routes object', () => {
    it('should have all expected routes', () => {
      expect(Routes.terminal).toBe('/');
      expect(Routes.whoami).toBe('/whoami');
      expect(Routes.mission).toBe('/mission');
      expect(Routes.contact).toBe('/contact');
    });

    it('should have exactly 4 routes', () => {
      const routeKeys = Object.keys(Routes);
      expect(routeKeys).toHaveLength(4);
    });

    it('should have all routes starting with /', () => {
      Object.values(Routes).forEach(route => {
        expect(route).toMatch(/^\/.*$/);
      });
    });

    it('should have unique route paths', () => {
      const routePaths = Object.values(Routes);
      const uniquePaths = [...new Set(routePaths)];
      
      expect(routePaths.length).toBe(uniquePaths.length);
    });

    it('should have terminal route as root', () => {
      expect(Routes.terminal).toBe('/');
    });

    it('should have proper route naming convention', () => {
      const routeKeys = Object.keys(Routes);
      
      routeKeys.forEach(key => {
        expect(key).toMatch(/^[a-z]+$/);
      });
    });

    it('should have route paths matching their names', () => {
      expect(Routes.whoami).toBe('/whoami');
      expect(Routes.mission).toBe('/mission');
      expect(Routes.contact).toBe('/contact');
    });

    it('should not have trailing slashes (except root)', () => {
      Object.values(Routes).forEach(route => {
        if (route !== '/') {
          expect(route).not.toMatch(/\/$/);
        }
      });
    });

    it('should be a valid object structure', () => {
      expect(typeof Routes).toBe('object');
      expect(Routes).not.toBeNull();
      expect(Array.isArray(Routes)).toBe(false);
    });
  });
});
