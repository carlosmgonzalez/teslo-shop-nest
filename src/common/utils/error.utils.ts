export const isDatabaseError = (
  error: unknown,
): error is { code: string; detail: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'detail' in error
  );
};
