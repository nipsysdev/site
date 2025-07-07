import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AppRoute, CommandEntry } from '@/types/routing';
import { ViewRoute } from '@/types/routing';
import { Command } from '@/types/terminal';
import { TerminalStateProvider, useTerminalContext } from '../TerminalContext';

describe('TerminalContext', () => {
  describe('TerminalStateProvider', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      expect(result.current.input).toBe('');
      expect(result.current.submission).toBe('');
      expect(result.current.simulatedCmd).toBe('');
      expect(result.current.history).toEqual([]);
      expect(result.current.hasIntroduced).toBe(false);
      expect(result.current.hasRefreshed).toBe(false);
      expect(result.current.lastRouteReq).toBeNull();
      expect(result.current.oldRouteReq).toBeNull();

      // Check that setters are functions
      expect(typeof result.current.setInput).toBe('function');
      expect(typeof result.current.setSubmission).toBe('function');
      expect(typeof result.current.setSimulatedCmd).toBe('function');
      expect(typeof result.current.setHistory).toBe('function');
      expect(typeof result.current.setHasIntroduced).toBe('function');
      expect(typeof result.current.setHasRefreshed).toBe('function');
      expect(typeof result.current.setLastRouteReq).toBe('function');
      expect(typeof result.current.setOldRouteReq).toBe('function');
    });

    it('should update input when setInput is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      act(() => {
        result.current.setInput('test input');
      });

      expect(result.current.input).toBe('test input');
    });

    it('should update submission when setSubmission is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      act(() => {
        result.current.setSubmission('test submission');
      });

      expect(result.current.submission).toBe('test submission');
    });

    it('should update simulatedCmd when setSimulatedCmd is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      act(() => {
        result.current.setSimulatedCmd('simulated command');
      });

      expect(result.current.simulatedCmd).toBe('simulated command');
    });

    it('should update history when setHistory is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      const mockHistory: CommandEntry[] = [
        {
          cmdName: Command.Help,
          timestamp: Date.now(),
        },
      ];

      act(() => {
        result.current.setHistory(mockHistory);
      });

      expect(result.current.history).toEqual(mockHistory);
    });

    it('should update hasIntroduced when setHasIntroduced is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      act(() => {
        result.current.setHasIntroduced(true);
      });

      expect(result.current.hasIntroduced).toBe(true);
    });

    it('should update hasRefreshed when setHasRefreshed is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      act(() => {
        result.current.setHasRefreshed(true);
      });

      expect(result.current.hasRefreshed).toBe(true);
    });

    it('should update lastRouteReq when setLastRouteReq is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      const mockRoute: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: Date.now(),
      };

      act(() => {
        result.current.setLastRouteReq(mockRoute);
      });

      expect(result.current.lastRouteReq).toEqual(mockRoute);
    });

    it('should update oldRouteReq when setOldRouteReq is called', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      const mockRoute: AppRoute = {
        viewRoute: ViewRoute.Whoami,
        param: 'test',
        timeStamp: Date.now(),
      };

      act(() => {
        result.current.setOldRouteReq(mockRoute);
      });

      expect(result.current.oldRouteReq).toEqual(mockRoute);
    });

    it('should handle multiple state updates correctly', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      const mockHistory: CommandEntry[] = [
        { cmdName: Command.Help, timestamp: 1234567890 },
        { cmdName: Command.Clear, timestamp: 1234567891 },
      ];

      const mockRoute: AppRoute = {
        viewRoute: ViewRoute.Contact,
        timeStamp: Date.now(),
      };

      act(() => {
        result.current.setInput('complex input');
        result.current.setHasIntroduced(true);
        result.current.setHistory(mockHistory);
        result.current.setLastRouteReq(mockRoute);
      });

      expect(result.current.input).toBe('complex input');
      expect(result.current.hasIntroduced).toBe(true);
      expect(result.current.history).toEqual(mockHistory);
      expect(result.current.lastRouteReq).toEqual(mockRoute);
    });

    it('should allow setting route to null', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      // First set a route
      const mockRoute: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: Date.now(),
      };

      act(() => {
        result.current.setLastRouteReq(mockRoute);
      });

      expect(result.current.lastRouteReq).toEqual(mockRoute);

      // Then set it to null
      act(() => {
        result.current.setLastRouteReq(null);
      });

      expect(result.current.lastRouteReq).toBeNull();
    });
  });

  describe('useTerminalContext', () => {
    it('should return the context value', () => {
      const { result } = renderHook(() => useTerminalContext(), {
        wrapper: TerminalStateProvider,
      });

      expect(result.current.input).toBe('');
      expect(result.current.submission).toBe('');
      expect(result.current.simulatedCmd).toBe('');
      expect(result.current.history).toEqual([]);
      expect(result.current.hasIntroduced).toBe(false);
      expect(result.current.hasRefreshed).toBe(false);
      expect(result.current.lastRouteReq).toBeNull();
      expect(result.current.oldRouteReq).toBeNull();

      expect(typeof result.current.setInput).toBe('function');
      expect(typeof result.current.setSubmission).toBe('function');
      expect(typeof result.current.setSimulatedCmd).toBe('function');
      expect(typeof result.current.setHistory).toBe('function');
      expect(typeof result.current.setHasIntroduced).toBe('function');
      expect(typeof result.current.setHasRefreshed).toBe('function');
      expect(typeof result.current.setLastRouteReq).toBe('function');
      expect(typeof result.current.setOldRouteReq).toBe('function');
    });
  });
});
