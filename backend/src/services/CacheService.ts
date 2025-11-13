/**
 * CacheService - In-memory caching for expensive calculations
 * 
 * Provides caching for:
 * - FRA (Full Retirement Age) calculations
 * - Benefit adjustment factors
 * - COLA (Cost of Living Adjustment) calculations
 * 
 * Uses LRU (Least Recently Used) eviction strategy with configurable max size.
 */

export class CacheService {
  private fraCache: Map<number, number>;
  private adjustmentFactorCache: Map<string, number>;
  private colaCache: Map<string, number>;
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 1000) {
    this.fraCache = new Map();
    this.adjustmentFactorCache = new Map();
    this.colaCache = new Map();
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Get cached FRA or return undefined
   */
  getFRA(birthYear: number): number | undefined {
    return this.fraCache.get(birthYear);
  }

  /**
   * Cache FRA calculation result
   */
  setFRA(birthYear: number, fra: number): void {
    this.evictIfNeeded(this.fraCache);
    this.fraCache.set(birthYear, fra);
  }

  /**
   * Get cached adjustment factor or return undefined
   */
  getAdjustmentFactor(claimingAge: number, fra: number): number | undefined {
    const key = `${claimingAge}-${fra}`;
    return this.adjustmentFactorCache.get(key);
  }

  /**
   * Cache adjustment factor calculation result
   */
  setAdjustmentFactor(claimingAge: number, fra: number, factor: number): void {
    const key = `${claimingAge}-${fra}`;
    this.evictIfNeeded(this.adjustmentFactorCache);
    this.adjustmentFactorCache.set(key, factor);
  }

  /**
   * Get cached COLA calculation or return undefined
   */
  getCOLA(benefit: number, years: number, colaRate: number): number | undefined {
    const key = `${benefit}-${years}-${colaRate}`;
    return this.colaCache.get(key);
  }

  /**
   * Cache COLA calculation result
   */
  setCOLA(benefit: number, years: number, colaRate: number, result: number): void {
    const key = `${benefit}-${years}-${colaRate}`;
    this.evictIfNeeded(this.colaCache);
    this.colaCache.set(key, result);
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.fraCache.clear();
    this.adjustmentFactorCache.clear();
    this.colaCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    fraSize: number;
    adjustmentFactorSize: number;
    colaSize: number;
    totalSize: number;
  } {
    return {
      fraSize: this.fraCache.size,
      adjustmentFactorSize: this.adjustmentFactorCache.size,
      colaSize: this.colaCache.size,
      totalSize: this.fraCache.size + this.adjustmentFactorCache.size + this.colaCache.size,
    };
  }

  /**
   * Evict oldest entry if cache exceeds max size (LRU)
   */
  private evictIfNeeded(cache: Map<any, any>): void {
    if (cache.size >= this.maxCacheSize) {
      // Remove the first (oldest) entry
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();
