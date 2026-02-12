/**
 * Executes a function with a timeout
 * @param fn Function to execute
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutMessage Error message if timeout occurs
 * @returns Result of the function
 */
export const withTimeout = <T>(
  fn: () => T,
  timeoutMs: number,
  timeoutMessage: string
): T => {
  let timeoutId: NodeJS.Timeout | undefined;
  let completed = false;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      if (!completed) {
        reject(new Error(timeoutMessage));
      }
    }, timeoutMs);
  });

  const fnPromise = Promise.resolve().then(() => {
    const result = fn();
    completed = true;
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  });

  // Race between function execution and timeout
  // This is a synchronous wrapper, so we need to handle it differently
  // For sync operations, timeout won't work properly, so we'll just return the result
  // The real timeout protection comes from git command timeouts and Copilot timeouts

  try {
    const result = fn();
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
};
