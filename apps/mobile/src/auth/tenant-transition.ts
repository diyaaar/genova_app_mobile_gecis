/** Voluntary transitions wait for private writes before hiding their owning screen. */
type Release = () => void;
type Prepare = () => Promise<Release>;
const guards = new Set<Prepare>();
const invalidators = new Map<Prepare, Release>();

export function registerTenantTransition(prepare: Prepare, invalidate?: Release): Release {
  guards.add(prepare);
  if (invalidate) invalidators.set(prepare, invalidate);
  return () => { guards.delete(prepare); invalidators.delete(prepare); };
}

/** Cancel queued writes synchronously, before async file/keychain cleanup or a new auth token. */
export function invalidateTenantWrites(): void {
  for (const invalidate of invalidators.values()) invalidate();
}

export async function prepareTenantTransition(): Promise<Release> {
  const releases: Release[] = [];
  const release = () => { releases.splice(0).reverse().forEach((done) => done()); };
  try {
    for (const prepare of Array.from(guards)) releases.push(await prepare());
    return release;
  } catch (error) {
    release();
    throw error;
  }
}

export function resetTenantTransitionRegistry(): void { guards.clear(); invalidators.clear(); }
