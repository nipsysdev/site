import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTerminalContext } from '@/contexts/TerminalContext';
import useTermRouter from '@/hooks/useTermRouter';
import { ViewRoute } from '@/types/routing';
import type { AppRoute } from '@/types/routing';

// Mock the TerminalContext
vi.mock('@/contexts/TerminalContext', () => ({
  useTerminalContext: vi.fn(),
}));

const mockUseTerminalContext = useTerminalContext as ReturnType<typeof vi.fn>;

describe('useTermRouter', () => {
  const mockSetOldRouteReq = vi.fn();
  const mockHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not call handler when no route request', () => {
    mockUseTerminalContext.mockReturnValue({
      lastRouteReq: null,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldRouteReq).not.toHaveBeenCalled();
  });

  it('should not call handler when route does not match listened route', () => {
    const lastRouteReq: AppRoute = {
      viewRoute: ViewRoute.Whoami,
      timeStamp: Date.now(),
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldRouteReq).not.toHaveBeenCalled();
  });

  it('should call handler when new matching route event occurs', () => {
    const lastRouteReq: AppRoute = {
      viewRoute: ViewRoute.Terminal,
      timeStamp: Date.now(),
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(lastRouteReq);
    expect(mockSetOldRouteReq).toHaveBeenCalledWith(lastRouteReq);
  });

  it('should not call handler when route event is not new', () => {
    const sameRouteReq: AppRoute = {
      viewRoute: ViewRoute.Terminal,
      timeStamp: 12345,
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq: sameRouteReq,
      oldRouteReq: sameRouteReq,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldRouteReq).not.toHaveBeenCalled();
  });

  it('should call handler when route has different timestamp', () => {
    const oldRouteReq: AppRoute = {
      viewRoute: ViewRoute.Terminal,
      timeStamp: 12345,
    };

    const newRouteReq: AppRoute = {
      viewRoute: ViewRoute.Terminal,
      timeStamp: 54321,
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq: newRouteReq,
      oldRouteReq: oldRouteReq,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(newRouteReq);
    expect(mockSetOldRouteReq).toHaveBeenCalledWith(newRouteReq);
  });

  it('should handle route with parameters', () => {
    const lastRouteReq: AppRoute = {
      viewRoute: ViewRoute.Contact,
      param: 'email',
      timeStamp: Date.now(),
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Contact, mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(lastRouteReq);
    expect(mockSetOldRouteReq).toHaveBeenCalledWith(lastRouteReq);
  });

  it('should handle numeric parameters', () => {
    const lastRouteReq: AppRoute = {
      viewRoute: ViewRoute.Blog,
      param: 42,
      timeStamp: Date.now(),
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Blog, mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(lastRouteReq);
    expect(mockSetOldRouteReq).toHaveBeenCalledWith(lastRouteReq);
  });
});
