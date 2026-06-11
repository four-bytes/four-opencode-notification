/**
 * In-memory rate limiter — throttle per target ID.
 * Singleton for the plugin process lifetime.
 */
class RateLimiter {
  private lastSent: Map<string, number> = new Map();

  /**
   * Returns true if the target can send (outside throttle window).
   * Returns false if the target was sent to within `throttleSeconds`.
   */
  canSend(targetId: string, throttleSeconds: number): boolean {
    const now = Date.now();
    const last = this.lastSent.get(targetId);

    if (last && now - last < throttleSeconds * 1000) return false;

    this.lastSent.set(targetId, now);
    return true;
  }

  /**
   * Reset throttle for a target (e.g., for testing).
   */
  reset(targetId: string): void {
    this.lastSent.delete(targetId);
  }
}

export const rateLimiter = new RateLimiter();
