/**
 * Application Configuration
 * Centralized configuration for feature flags and default values
 */

export interface FeatureFlags {
  ENABLE_ENHANCED_OPTIMIZATION: boolean;
  ENABLE_PRESENT_VALUE: boolean;
  ENABLE_PROJECTIONS: boolean;
}

export interface CalculationDefaults {
  DEFAULT_DISCOUNT_RATE: number;
  PV_CALCULATION_PRECISION: number;
  ALTERNATIVE_STRATEGY_THRESHOLD: number;
}

export interface AppConfig {
  featureFlags: FeatureFlags;
  calculationDefaults: CalculationDefaults;
  environment: string;
}

/**
 * Parse boolean environment variable
 * Defaults to true if not specified
 */
function parseBoolean(value: string | undefined, defaultValue: boolean = true): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse float environment variable with validation
 */
function parseFloat(value: string | undefined, defaultValue: number, min?: number, max?: number): number {
  if (value === undefined) return defaultValue;

  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    console.warn(`Invalid float value: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }

  if (min !== undefined && parsed < min) {
    console.warn(`Value ${parsed} below minimum ${min}, using minimum`);
    return min;
  }

  if (max !== undefined && parsed > max) {
    console.warn(`Value ${parsed} above maximum ${max}, using maximum`);
    return max;
  }

  return parsed;
}

/**
 * Load and validate application configuration
 */
export function loadConfig(): AppConfig {
  // Feature Flags - default to enabled
  const featureFlags: FeatureFlags = {
    ENABLE_ENHANCED_OPTIMIZATION: parseBoolean(process.env.ENABLE_ENHANCED_OPTIMIZATION, true),
    ENABLE_PRESENT_VALUE: parseBoolean(process.env.ENABLE_PRESENT_VALUE, true),
    ENABLE_PROJECTIONS: parseBoolean(process.env.ENABLE_PROJECTIONS, true),
  };

  // Calculation Defaults
  const calculationDefaults: CalculationDefaults = {
    // Default discount rate: 3.0% (0.03)
    DEFAULT_DISCOUNT_RATE: parseFloat(
      process.env.DEFAULT_DISCOUNT_RATE,
      0.03,
      0.0,
      0.10
    ),

    // PV calculation precision: 2 decimal places
    PV_CALCULATION_PRECISION: parseFloat(
      process.env.PV_CALCULATION_PRECISION,
      2,
      0,
      10
    ),

    // Alternative strategy threshold: 2% (0.02)
    ALTERNATIVE_STRATEGY_THRESHOLD: parseFloat(
      process.env.ALTERNATIVE_STRATEGY_THRESHOLD,
      0.02,
      0.0,
      1.0
    ),
  };

  return {
    featureFlags,
    calculationDefaults,
    environment: process.env.NODE_ENV || 'development',
  };
}

// Export singleton config instance
export const config = loadConfig();

// Log configuration on startup (excluding sensitive data)
if (config.environment === 'development') {
  console.log('Configuration loaded:');
  console.log('  Feature Flags:', config.featureFlags);
  console.log('  Calculation Defaults:', config.calculationDefaults);
}
