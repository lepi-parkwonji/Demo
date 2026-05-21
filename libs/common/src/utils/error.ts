export function extractErrorMessage(error: unknown, fallback = '요청 처리 중 오류가 발생했습니다.'): string {
  const msg = (error as { error?: { message?: unknown } })?.error?.message;
  if (Array.isArray(msg)) return msg[0];
  if (typeof msg === 'string' && msg) return msg;
  return fallback;
}
