export function createRealtimeTopic(baseTopic: string) {
  const cryptoApi = globalThis.crypto;
  const suffix =
    cryptoApi && typeof cryptoApi.randomUUID === 'function'
      ? cryptoApi.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${baseTopic}:${suffix}`;
}

export interface RealtimeAuthPort {
  getAccessToken(): Promise<string | null>;
  setAuth(accessToken: string): Promise<unknown> | unknown;
}
export async function authorizeRealtimeBeforeJoin(port: RealtimeAuthPort): Promise<void> {
  const accessToken = await port.getAccessToken();
  if (!accessToken || accessToken.trim().length === 0) {
    throw new Error('chat-realtime-auth-required');
  }
  await port.setAuth(accessToken);
}
