export const DEFAULT_MOCK_DELAY = 220;

export function mockResponse(value, delay = DEFAULT_MOCK_DELAY) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

export async function mockMutation(action, delay = 180) {
  const result = action();
  return mockResponse(result, delay);
}
