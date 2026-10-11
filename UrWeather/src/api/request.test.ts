import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestJson } from './request';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('bounded API requests', () => {
  it('aborts a stalled request and reports a timeout', async () => {
    vi.useFakeTimers();
    let signal!: AbortSignal;
    vi.stubGlobal('fetch', vi.fn((_url, options) => {
      signal = options.signal;
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
    }));
    const response = requestJson('https://example.test', 1000);
    const assertion = expect(response).rejects.toThrow('Request timed out');
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
    expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the timeout after a successful response', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ city: 'Paris' }) }));
    expect(await requestJson('https://example.test')).toEqual({ city: 'Paris' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reports HTTP errors without treating them as forecasts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(requestJson('https://example.test')).rejects.toThrow('Request failed (503)');
  });
});
