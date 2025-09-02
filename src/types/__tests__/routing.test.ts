import { describe, expect, it } from 'vitest';
import type { AppRoute, RouteData } from '@/types/routing';
import { ViewRoute } from '@/types/routing';

describe('routing types', () => {
  describe('ViewRoute enum', () => {
    it('should have all expected route values', () => {
      expect(ViewRoute.Terminal).toBe('/');
      expect(ViewRoute.Whoami).toBe('/whoami');
      expect(ViewRoute.Blog).toBe('/blog');
      expect(ViewRoute.Contact).toBe('/contact');
    });
  });

  describe('AppRoute interface', () => {
    it('should accept AppRoute with string param', () => {
      const route: AppRoute = {
        viewRoute: ViewRoute.Whoami,
        param: 'test-param',
        timeStamp: Date.now(),
      };

      expect(route.viewRoute).toBe(ViewRoute.Whoami);
      expect(route.param).toBe('test-param');
      expect(typeof route.timeStamp).toBe('number');
    });

    it('should accept AppRoute with numeric param', () => {
      const route: AppRoute = {
        viewRoute: ViewRoute.Blog,
        param: 123,
        timeStamp: Date.now(),
      };

      expect(route.viewRoute).toBe(ViewRoute.Blog);
      expect(route.param).toBe(123);
      expect(typeof route.timeStamp).toBe('number');
    });
  });

  describe('RouteData interface', () => {
    it('should handle different locales', async () => {
      const routeDataEn: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      const routeDataFr: RouteData = {
        params: Promise.resolve({ locale: 'fr' }),
      };

      const paramsEn = await routeDataEn.params;
      const paramsFr = await routeDataFr.params;

      expect(paramsEn.locale).toBe('en');
      expect(paramsFr.locale).toBe('fr');
    });
  });
});
