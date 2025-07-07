import { describe, it, expect } from 'vitest';
import { ViewRoute } from '@/types/routing';
import type { AppRoute, RouteData } from '@/types/routing';

describe('routing types', () => {
  describe('ViewRoute enum', () => {
    it('should have all expected route values', () => {
      expect(ViewRoute.Terminal).toBe('/');
      expect(ViewRoute.Whoami).toBe('/whoami');
      expect(ViewRoute.Blog).toBe('/blog');
      expect(ViewRoute.Contact).toBe('/contact');
    });

    it('should have exactly 4 routes', () => {
      const routeValues = Object.values(ViewRoute);
      expect(routeValues).toHaveLength(4);
    });

    it('should have string values for all routes', () => {
      Object.values(ViewRoute).forEach(route => {
        expect(typeof route).toBe('string');
        expect(route.startsWith('/')).toBe(true);
      });
    });

    it('should not have duplicate values', () => {
      const routeValues = Object.values(ViewRoute);
      const uniqueValues = [...new Set(routeValues)];
      expect(routeValues.length).toBe(uniqueValues.length);
    });

    it('should use lowercase paths', () => {
      Object.values(ViewRoute).forEach(route => {
        expect(route).toBe(route.toLowerCase());
      });
    });
  });

  describe('AppRoute interface', () => {
    it('should accept valid AppRoute object with minimal properties', () => {
      const route: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: Date.now(),
      };

      expect(route.viewRoute).toBe(ViewRoute.Terminal);
      expect(typeof route.timeStamp).toBe('number');
      expect(route.param).toBeUndefined();
    });

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

    it('should accept all ViewRoute values', () => {
      Object.values(ViewRoute).forEach(viewRoute => {
        const route: AppRoute = {
          viewRoute,
          timeStamp: Date.now(),
        };

        expect(route.viewRoute).toBe(viewRoute);
      });
    });
  });

  describe('RouteData interface', () => {
    it('should accept valid RouteData object', () => {
      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      expect(routeData.params).toBeInstanceOf(Promise);
    });

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

    it('should accept various locale formats', async () => {
      const locales = ['en', 'fr', 'en-US', 'fr-CA', 'de-DE'];

      for (const locale of locales) {
        const routeData: RouteData = {
          params: Promise.resolve({ locale }),
        };

        const params = await routeData.params;
        expect(params.locale).toBe(locale);
      }
    });
  });

  describe('Type relationships', () => {
    it('should work together in realistic scenarios', () => {
      const appRoute: AppRoute = {
        viewRoute: ViewRoute.Contact,
        param: 'form-submitted',
        timeStamp: Date.now(),
      };

      const routeData: RouteData = {
        params: Promise.resolve({ locale: 'en' }),
      };

      expect(appRoute.viewRoute).toBe('/contact');
      expect(typeof appRoute.param).toBe('string');
      expect(routeData.params).toBeInstanceOf(Promise);
    });
  });
});
