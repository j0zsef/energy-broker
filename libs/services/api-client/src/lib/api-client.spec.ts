jest.mock('../config/api-config', () => ({
  apiConfig: { apiBaseUrl: 'http://test-api.example.com' },
}));

import { apiClient } from './api-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('apiClient', () => {
  it('constructs the correct URL from base + endpoint', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ ok: true }),
      ok: true,
    });

    await apiClient('v1/energy-providers');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.example.com/v1/energy-providers',
      expect.anything(),
    );
  });

  it('includes credentials: include on every request', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true,
    });

    await apiClient('test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('sets Content-Type to application/json when body is present', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true,
    });

    await apiClient('test', { body: JSON.stringify({ key: 'val' }) });

    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers['Content-Type']).toBe('application/json');
  });

  it('omits Content-Type when no body is present', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true,
    });

    await apiClient('test', { method: 'DELETE' });

    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers['Content-Type']).toBeUndefined();
  });

  it('merges custom headers with defaults', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true,
    });

    await apiClient('test', {
      body: JSON.stringify({ key: 'val' }),
      headers: { 'X-Custom': 'value' } as Record<string, string>,
    });

    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers['Content-Type']).toBe('application/json');
    expect(callArgs.headers['X-Custom']).toBe('value');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(apiClient('missing')).rejects.toThrow('API error: Not Found');
  });

  it('parses and returns JSON response', async () => {
    const data = { id: 1, name: 'Test' };
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(data),
      ok: true,
    });

    const result = await apiClient('test');
    expect(result).toEqual(data);
  });
});
