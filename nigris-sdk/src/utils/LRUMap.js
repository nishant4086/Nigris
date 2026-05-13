/**
 * Lightweight LRU cache backed by a Map.
 * Uses Map insertion order + manual eviction to stay bounded.
 * Zero dependencies — suitable for browser + Node.
 */
export default class LRUMap {
  /**
   * @param {number} max  - Maximum number of entries (default 500)
   * @param {number} ttl  - Time-to-live in ms (default 5 minutes, 0 = no TTL)
   */
  constructor(max = 500, ttl = 5 * 60 * 1000) {
    this._max = max;
    this._ttl = ttl;
    this._map = new Map();       // key → { value, expiresAt }
  }

  has(key) {
    if (!this._map.has(key)) return false;
    const entry = this._map.get(key);
    if (this._ttl > 0 && Date.now() > entry.expiresAt) {
      this._map.delete(key);
      return false;
    }
    return true;
  }

  get(key) {
    if (!this.has(key)) return undefined;
    const entry = this._map.get(key);
    // Move to end (most recently used)
    this._map.delete(key);
    this._map.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    // If key exists, delete first so it moves to end
    if (this._map.has(key)) this._map.delete(key);

    this._map.set(key, {
      value,
      expiresAt: this._ttl > 0 ? Date.now() + this._ttl : Infinity,
    });

    // Evict oldest entries if over capacity
    while (this._map.size > this._max) {
      const oldest = this._map.keys().next().value;
      this._map.delete(oldest);
    }
  }

  delete(key) {
    return this._map.delete(key);
  }

  clear() {
    this._map.clear();
  }

  get size() {
    return this._map.size;
  }
}
