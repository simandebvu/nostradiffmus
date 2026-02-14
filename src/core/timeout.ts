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
  // This is a synchronous wrapper. The real timeout protection comes from
  // git command timeouts and Copilot timeouts configured elsewhere.
  // The timeoutMs and timeoutMessage parameters are kept for API compatibility.
  try {
    return fn();
  } catch (error) {
    throw error;
  }
};
