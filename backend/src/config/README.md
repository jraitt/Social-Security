# Configuration Module

This module provides centralized configuration management for the Social Security Calculator backend, including feature flags and calculation defaults.

## Feature Flags

Feature flags allow you to enable or disable specific features without code changes.

### Available Flags

- **ENABLE_ENHANCED_OPTIMIZATION** (default: `true`)
  - Enables the enhanced optimization strategy with total dollar benefit maximization
  - When disabled, enhanced calculation endpoints will return a 403 error

- **ENABLE_PRESENT_VALUE** (default: `true`)
  - Enables present value calculations for benefit streams
  - Future use: Can be used to conditionally include PV calculations in results

- **ENABLE_PROJECTIONS** (default: `true`)
  - Enables year-by-year benefit projections
  - Future use: Can be used to conditionally include projections in results

### Configuration

Set feature flags in your environment file (`.env.development` or `.env.production`):

```bash
ENABLE_ENHANCED_OPTIMIZATION=true
ENABLE_PRESENT_VALUE=true
ENABLE_PROJECTIONS=true
```

## Calculation Defaults

Default values used throughout the calculation services.

### Available Defaults

- **DEFAULT_DISCOUNT_RATE** (default: `0.03`)
  - Default annual discount rate for present value calculations (3%)
  - Range: 0.0 to 0.10 (0% to 10%)
  - Used when client doesn't specify a discount rate

- **PV_CALCULATION_PRECISION** (default: `2`)
  - Number of decimal places for present value calculations
  - Range: 0 to 10
  - Future use: Can be used to round PV results

- **ALTERNATIVE_STRATEGY_THRESHOLD** (default: `0.02`)
  - Threshold for identifying alternative strategies (2%)
  - Range: 0.0 to 1.0 (0% to 100%)
  - Strategies within this percentage of optimal are considered alternatives

### Configuration

Set calculation defaults in your environment file:

```bash
DEFAULT_DISCOUNT_RATE=0.03
PV_CALCULATION_PRECISION=2
ALTERNATIVE_STRATEGY_THRESHOLD=0.02
```

## Usage

### Importing Configuration

```typescript
import { config } from '../config';
```

### Accessing Feature Flags

```typescript
if (config.featureFlags.ENABLE_ENHANCED_OPTIMIZATION) {
  // Enhanced optimization is enabled
}
```

### Accessing Calculation Defaults

```typescript
const discountRate = input.discountRate ?? config.calculationDefaults.DEFAULT_DISCOUNT_RATE;
const threshold = config.calculationDefaults.ALTERNATIVE_STRATEGY_THRESHOLD;
```

### Accessing Environment Variables

```typescript
const port = config.port;
const environment = config.environment;
const corsOrigin = config.corsOrigin;
```

## Validation

The configuration module automatically validates:

- Required environment variables (NODE_ENV, PORT, CORS_ORIGIN)
- Numeric ranges for calculation defaults
- Boolean values for feature flags

Invalid values will:
- Log warnings to console
- Fall back to default values
- Throw errors for required variables

## Development vs Production

Configuration is loaded based on the `NODE_ENV` environment variable:

- `development`: Loads `.env.development`
- `production`: Loads `.env.production`

In development mode, the configuration is logged to the console on startup.

## Health Check

The `/api/health` endpoint includes feature flag status:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-11T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "features": {
    "ENABLE_ENHANCED_OPTIMIZATION": true,
    "ENABLE_PRESENT_VALUE": true,
    "ENABLE_PROJECTIONS": true
  }
}
```

## Examples

### Disabling Enhanced Optimization

To disable enhanced optimization in production:

```bash
# .env.production
ENABLE_ENHANCED_OPTIMIZATION=false
```

Requests to `/api/calculate/enhanced/*` will return:

```json
{
  "error": {
    "code": "FEATURE_DISABLED",
    "message": "Enhanced optimization feature is not enabled"
  }
}
```

### Changing Default Discount Rate

To use a 4% default discount rate:

```bash
# .env.development
DEFAULT_DISCOUNT_RATE=0.04
```

### Adjusting Alternative Strategy Threshold

To show alternatives within 5% of optimal:

```bash
# .env.development
ALTERNATIVE_STRATEGY_THRESHOLD=0.05
```
