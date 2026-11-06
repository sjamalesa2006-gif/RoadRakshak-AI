const RETRY_DELAYS_MS = [2000, 4000, 8000, 12000, 15000];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retry safe GET requests when the backend is waking up or temporarily unavailable. */
export async function fetchWithRetry(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  // Never automatically retry writes (POST/PATCH/PUT/DELETE): that could duplicate actions.
  if (method !== "GET") {
    return fetch(url, options);
  }

  let lastError;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(url, options);

      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }

      lastError = new Error(`Server temporarily unavailable (${response.status}).`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < RETRY_DELAYS_MS.length) {
      await wait(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw new Error(
    `The server is taking longer than expected. Please try again. (${lastError?.message || "Connection failed"})`
  );
}
