# Type Definitions Documentation

This directory contains TypeScript type definitions for the Social Security Calculator application, including both legacy types (for backward compatibility) and enhanced types for the new total dollar benefit maximization optimization strategy.

## File Structure

- **enhanced-calculator.types.ts** - Enhanced type definitions for the new optimization strategy
- **index.ts** - Central export point for all types

## Type Categories

### 1. Enhanced Projection Types

These types define the structure for year-by-year benefit projections:

- **YearlyProjection** - Individual year-by-year projections
- **CoupleYearlyProjection** - Couple year-by-year projections with spousal and survivor benefits
- **SurvivorProjection** - Survivor benefit scenario projections

### 2. Present Value Types

Types for present value calculations:

- **PresentValueParams** - Parameters for PV calculations (discount rate, base year)
- **PresentValueResult** - Result of PV calculation

### 3. Strategy Evaluation Types

Types for evaluating claiming strategies:

- **StrategyEvaluation** - Individual strategy evaluation with projections and PV
- **CoupleStrategyEvaluation** - Couple strategy evaluation with all benefit types
- **StrategyComparison** - Comparison between two strategies

### 4. Enhanced Result Types

Complete calculation results:

- **EnhancedIndividualResult** - Enhanced individual calculation result
- **EnhancedCoupleResult** - Enhanced couple calculation result
- **EnhancedCalculationResult** - Wrapper for both types

### 5. Enhanced Input Types

Input types with discount rate support:

- **EnhancedIndividualInput** - Individual input with optional discount rate
- **EnhancedCoupleInput** - Couple input with optional discount rate
- **AssumptionData** - Enhanced with discount rate field

### 6. Configuration Types

Feature flags and configuration:

- **EnhancedOptimizationConfig** - Feature flags for enhanced optimization
- **DEFAULT_ENHANCED_CONFIG** - Default configuration values

## Backward Compatibility

The enhanced types are designed to maintain backward compatibility with existing code:

1. **Legacy types are still exported** - All existing types from CalculationService and ProjectionService are re-exported through index.ts
2. **Optional fields** - New fields in existing interfaces (like `discountRate` in `AssumptionData`) are optional
3. **Extended interfaces** - Enhanced result types include all fields from legacy types plus new fields

## Usage Examples

### Using Enhanced Types in Services

```typescript
import {
  EnhancedIndividualInput,
  EnhancedIndividualResult,
  YearlyProjection,
  StrategyEvaluation,
} from '../types';

class EnhancedCalculationService {
  calculateIndividualOptimal(input: EnhancedIndividualInput): EnhancedIndividualResult {
    // Implementation
  }
}
```

### Using Present Value Types

```typescript
import { PresentValueParams, PresentValueResult } from '../types';

class PresentValueService {
  calculatePresentValue(
    projections: YearlyProjection[],
    params: PresentValueParams
  ): PresentValueResult {
    // Implementation
  }
}
```

### Backward Compatibility Example

```typescript
import { IndividualInput, IndividualResult } from '../types';

// Legacy code continues to work
function legacyCalculation(input: IndividualInput): IndividualResult {
  // Existing implementation
}
```

## Migration Guide

When migrating from legacy types to enhanced types:

1. **Add discount rate support** - Update input interfaces to accept optional `discountRate`
2. **Generate projections** - Create `YearlyProjection[]` arrays for detailed breakdowns
3. **Calculate present value** - Add PV calculations using the new `PresentValueService`
4. **Return enhanced results** - Return `EnhancedIndividualResult` or `EnhancedCoupleResult`

## Type Safety

All types are strictly typed with:
- Explicit field types (no `any`)
- Comprehensive JSDoc comments
- Clear naming conventions
- Proper use of union types and optional fields

## Constants

Default values are provided as constants:

```typescript
DEFAULT_ENHANCED_CONFIG = {
  enableEnhancedOptimization: true,
  enablePresentValue: true,
  enableProjections: true,
  defaultDiscountRate: 0.03, // 3%
  alternativeStrategyThreshold: 0.02, // 2%
}
```
