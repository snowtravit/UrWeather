export async function requestJson(url: string, timeoutMs = 10000): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Request timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
