# Migration Guide: Enhanced Benefit Optimization

## Overview

This guide helps you migrate from the basic Social Security Calculator API to the enhanced optimization endpoints. The enhanced endpoints provide year-by-year projections, present value calculations, and detailed survivor benefit scenarios.

**Version:** 2.0  
**Last Updated:** November 2025

---

## Table of Contents

1. [What's New](#whats-new)
2. [Breaking Changes](#breaking-changes)
3. [Backward Compatibility](#backward-compatibility)
4. [Migration Steps](#migration-steps)
5. [API Changes](#api-changes)
6. [Code Examples](#code-examples)
7. [Feature Flags](#feature-flags)
8. [Testing Your Migration](#testing-your-migration)
9. [Rollback Plan](#rollback-plan)
10. [FAQ](#faq)

---

## What's New

### Enhanced Optimization Features

The enhanced endpoints (`/api/calculate/enhanced/*`) provide:

✅ **Year-by-year projections** - Detailed benefit projections for each year  
✅ **Present value calculations** - Time value of money analysis  
✅ **Survivor benefit scenarios** - Comprehensive survivor benefit modeling for couples  
✅ **Strategy comparisons** - Compare multiple claiming strategies  
✅ **Alternative strategies** - Strategies within 2% of optimal  
✅ **Discount rate support** - Configurable discount rates for present value  
✅ **Enhanced metadata** - Calculation timestamps and assumptions

### Key Improvements

- **Better optimization**: Focuses on total dollar benefit maximization
- **More transparency**: See exactly how benefits change year by year
- **Better decision support**: Compare strategies with present value analysis
- **Survivor planning**: Understand survivor benefits for both scenarios

---

## Breaking Changes

### ⚠️ None for Existing Endpoints

**Good news:** The basic endpoints (`/api/calculate/individual` and `/api/calculate/couple`) remain unchanged. Your existing integrations will continue to work without modification.

### New Endpoints Only

The enhanced endpoints are **additive** - they don't replace existing functionality. You can:
- Continue using basic endpoints indefinitely
- Migrate to enhanced endpoints at your own pace
- Use both endpoints simultaneously during transition

---

## Backward Compatibility

### Guaranteed Compatibility

✅ **Basic endpoints unchanged**: `/api/calculate/individual` and `/api/calculate/couple` work exactly as before  
✅ **Request formats unchanged**: All existing request parameters remain valid  
✅ **Response formats unchanged**: Basic endpoint responses maintain the same structure  
✅ **No version breaking**: No API versioning required

### Enhanced Endpoint Compatibility

The enhanced endpoints maintain backward compatibility by:
- Including all fields from basic responses
- Adding new fields without removing old ones
- Using optional parameters (e.g., `discountRate`)
- Wrapping results in a consistent structure

---

## Migration Steps

### Step 1: Enable Enhanced Optimization

Update your environment configuration to enable the enhanced optimization feature:

**`.env.development` or `.env.production`:**

```bash
# Enable enhanced optimization features
ENABLE_ENHANCED_OPTIMIZATION=true

# Optional: Set default discount rate (default is 0.03)
DEFAULT_DISCOUNT_RATE=0.03
```

**Restart your backend service** after updating environment variables.

### Step 2: Update API Client (Optional)

If you want to use enhanced endpoints, update your API client to call the new endpoints:

**Before:**
```typescript
const response = await fetch('/api/calculate/individual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    birthDate: '1960-01-01',
    pia: 3000,
    lifeExpectancy: 85,
    inflationRate: 0.02
  })
});
```

**After:**
```typescript
const response = await fetch('/api/calculate/enhanced/individual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    birthDate: '1960-01-01',
    pia: 3000,
    lifeExpectancy: 85,
    inflationRate: 0.02,
    discountRate: 0.03  // Optional, defaults to 0.03
  })
});
```

### Step 3: Update Response Handling

Enhanced endpoints return a wrapped response with metadata:

**Before:**
```typescript
const result = await response.json();
console.log(result.optimalAge);  // Direct access
```

**After:**
```typescript
const result = await response.json();
console.log(result.individual.optimalAge);  // Access through type-specific field
console.log(result.metadata.discountRate);  // Access metadata
```

### Step 4: Utilize New Features

Take advantage of enhanced features:

```typescript
const result = await response.json();

// Access year-by-year projections
const projections = result.individual.yearlyProjections;

// Access present value
const presentValue = result.individual.optimalPresentValue;

// Access alternative strategies
const alternatives = result.individual.alternativeStrategies;

// Access comparison with age 62
const comparison = result.individual.comparisonWithAge62;
```

### Step 5: Test Thoroughly

- Test with various input combinations
- Verify calculations match expectations
- Compare results with basic endpoints
- Test error handling

---

## API Changes

### Individual Calculation

#### Basic Endpoint (Unchanged)

**Endpoint:** `POST /api/calculate/individual`

**Request:** No changes
```json
{
  "birthDate": "1960-01-01",
  "pia": 3000,
  "lifeExpectancy": 85,
  "inflationRate": 0.02
}
```

**Response:** No changes
```json
{
  "optimalAge": 70,
  "optimalMonthlyBenefit": 3720,
  "optimalLifetimeBenefit": 669600,
  "fra": 67,
  "strategies": [...],
  "chartData": [...]
}
```

#### Enhanced Endpoint (New)

**Endpoint:** `POST /api/calculate/enhanced/individual`

**Request:** Adds optional `discountRate`
```json
{
  "birthDate": "1960-01-01",
  "pia": 3000,
  "lifeExpectancy": 85,
  "inflationRate": 0.02,
  "discountRate": 0.03  // NEW: Optional, defaults to 0.03
}
```

**Response:** Wrapped with metadata and enhanced fields
```json
{
  "type": "individual",
  "individual": {
    "optimalAge": 70,
    "optimalMonthlyBenefit": 3720,
    "optimalLifetimeBenefit": 669600,
    "optimalPresentValue": 520345,  // NEW
    "fra": 67,
    "yearlyProjections": [...],  // NEW
    "allStrategies": [...],  // NEW
    "alternativeStrategies": [...],  // NEW
    "comparisonWithAge62": {...}  // NEW
  },
  "metadata": {  // NEW
    "calculatedAt": "2025-11-11T12:00:00.000Z",
    "assumptions": {
      "inflationRate": 0.02,
      "useInflationAdjusted": true,
      "discountRate": 0.03
    },
    "discountRate": 0.03
  }
}
```

### Couple Calculation

#### Basic Endpoint (Unchanged)

**Endpoint:** `POST /api/calculate/couple`

**Request:** No changes
```json
{
  "spouse1": {
    "birthDate": "1960-01-01",
    "pia": 3000,
    "lifeExpectancy": 85
  },
  "spouse2": {
    "birthDate": "1962-06-15",
    "pia": 2000,
    "lifeExpectancy": 87
  },
  "inflationRate": 0.02
}
```

**Response:** No changes
```json
{
  "optimalStrategy": {...},
  "alternativeStrategies": [...],
  "spouse1Fra": 67,
  "spouse2Fra": 67,
  "higherEarnerSpouse": 1
}
```

#### Enhanced Endpoint (New)

**Endpoint:** `POST /api/calculate/enhanced/couple`

**Request:** Adds optional `discountRate`
```json
{
  "spouse1": {
    "birthDate": "1960-01-01",
    "pia": 3000,
    "lifeExpectancy": 85
  },
  "spouse2": {
    "birthDate": "1962-06-15",
    "pia": 2000,
    "lifeExpectancy": 87
  },
  "inflationRate": 0.02,
  "discountRate": 0.03  // NEW: Optional
}
```

**Response:** Wrapped with metadata and enhanced fields
```json
{
  "type": "couple",
  "couple": {
    "optimalStrategy": {
      "spouse1ClaimingAge": 70,
      "spouse2ClaimingAge": 67,
      "combinedLifetimeBenefit": 1456789,
      "combinedPresentValue": 1123456,  // NEW
      "yearlyProjections": [...],  // NEW
      "survivorScenarios": [...]  // NEW
    },
    "optimalPresentValue": 1123456,  // NEW
    "spouse1Fra": 67,
    "spouse2Fra": 67,
    "higherEarnerSpouse": 1,
    "yearlyProjections": [...],  // NEW
    "survivorScenarios": {  // NEW
      "spouse1Outlives": {...},
      "spouse2Outlives": {...}
    },
    "allStrategies": [...],  // NEW
    "alternativeStrategies": [...]  // NEW
  },
  "metadata": {  // NEW
    "calculatedAt": "2025-11-11T12:00:00.000Z",
    "assumptions": {...},
    "discountRate": 0.03
  }
}
```

---

## Code Examples

### Example 1: Gradual Migration (Recommended)

Keep using basic endpoints while adding enhanced features:

```typescript
// api.ts
export class CalculatorAPI {
  // Keep existing method
  async calculateIndividual(params: IndividualInput) {
    const response = await fetch('/api/calculate/individual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return response.json();
  }

  // Add new enhanced method
  async calculateIndividualEnhanced(params: EnhancedIndividualInput) {
    const response = await fetch('/api/calculate/enhanced/individual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return response.json();
  }
}
```

### Example 2: Feature Flag Pattern

Use feature flags to control which endpoint to call:

```typescript
async function calculateIndividual(params: IndividualInput) {
  const useEnhanced = config.features.enhancedOptimization;
  
  const endpoint = useEnhanced 
    ? '/api/calculate/enhanced/individual'
    : '/api/calculate/individual';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const result = await response.json();
  
  // Normalize response structure
  if (useEnhanced) {
    return {
      ...result.individual,
      metadata: result.metadata
    };
  }
  
  return result;
}
```

### Example 3: Adapter Pattern

Create an adapter to normalize responses:

```typescript
interface NormalizedResult {
  optimalAge: number;
  optimalMonthlyBenefit: number;
  optimalLifetimeBenefit: number;
  optimalPresentValue?: number;
  yearlyProjections?: YearlyProjection[];
  metadata?: any;
}

function normalizeIndividualResult(
  result: any, 
  isEnhanced: boolean
): NormalizedResult {
  if (isEnhanced) {
    return {
      optimalAge: result.individual.optimalAge,
      optimalMonthlyBenefit: result.individual.optimalMonthlyBenefit,
      optimalLifetimeBenefit: result.individual.optimalLifetimeBenefit,
      optimalPresentValue: result.individual.optimalPresentValue,
      yearlyProjections: result.individual.yearlyProjections,
      metadata: result.metadata
    };
  }
  
  return {
    optimalAge: result.optimalAge,
    optimalMonthlyBenefit: result.optimalMonthlyBenefit,
    optimalLifetimeBenefit: result.optimalLifetimeBenefit
  };
}
```

### Example 4: Progressive Enhancement

Display basic results immediately, then enhance with additional data:

```typescript
async function displayResults(params: IndividualInput) {
  // Show basic results quickly
  const basicResult = await calculateBasic(params);
  displayBasicResults(basicResult);
  
  // Enhance with detailed projections
  if (config.features.enhancedOptimization) {
    const enhancedResult = await calculateEnhanced(params);
    displayProjections(enhancedResult.individual.yearlyProjections);
    displayPresentValue(enhancedResult.individual.optimalPresentValue);
    displayAlternatives(enhancedResult.individual.alternativeStrategies);
  }
}
```

---

## Feature Flags

### Backend Configuration

Control enhanced features via environment variables:

```bash
# .env.development or .env.production

# Enable/disable enhanced optimization endpoints
ENABLE_ENHANCED_OPTIMIZATION=true

# Default discount rate for present value calculations
DEFAULT_DISCOUNT_RATE=0.03

# Threshold for alternative strategies (2% = 0.02)
ALTERNATIVE_STRATEGY_THRESHOLD=0.02
```

### Checking Feature Availability

Enhanced endpoints return 403 if the feature is disabled:

```typescript
async function calculateEnhanced(params: EnhancedIndividualInput) {
  try {
    const response = await fetch('/api/calculate/enhanced/individual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (response.status === 403) {
      console.warn('Enhanced optimization is not enabled');
      // Fall back to basic endpoint
      return calculateBasic(params);
    }
    
    return response.json();
  } catch (error) {
    console.error('Calculation failed:', error);
    throw error;
  }
}
```

---

## Testing Your Migration

### Test Checklist

- [ ] Basic endpoints still work without changes
- [ ] Enhanced endpoints return expected data structure
- [ ] Optional `discountRate` parameter works correctly
- [ ] Default discount rate is applied when not specified
- [ ] Year-by-year projections are accurate
- [ ] Present value calculations are correct
- [ ] Survivor scenarios are generated for couples
- [ ] Alternative strategies are within 2% threshold
- [ ] Error handling works for both endpoint types
- [ ] Feature flag correctly enables/disables enhanced endpoints

### Sample Test Cases

#### Test 1: Basic Endpoint Unchanged

```typescript
test('basic individual endpoint unchanged', async () => {
  const response = await fetch('/api/calculate/individual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate: '1960-01-01',
      pia: 3000,
      lifeExpectancy: 85,
      inflationRate: 0.02
    })
  });
  
  const result = await response.json();
  
  expect(result).toHaveProperty('optimalAge');
  expect(result).toHaveProperty('optimalMonthlyBenefit');
  expect(result).toHaveProperty('optimalLifetimeBenefit');
  expect(result).not.toHaveProperty('type');  // Not wrapped
});
```

#### Test 2: Enhanced Endpoint Structure

```typescript
test('enhanced individual endpoint returns wrapped result', async () => {
  const response = await fetch('/api/calculate/enhanced/individual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate: '1960-01-01',
      pia: 3000,
      lifeExpectancy: 85,
      inflationRate: 0.02,
      discountRate: 0.03
    })
  });
  
  const result = await response.json();
  
  expect(result.type).toBe('individual');
  expect(result.individual).toHaveProperty('optimalAge');
  expect(result.individual).toHaveProperty('optimalPresentValue');
  expect(result.individual).toHaveProperty('yearlyProjections');
  expect(result.metadata).toHaveProperty('discountRate');
  expect(result.metadata.discountRate).toBe(0.03);
});
```

#### Test 3: Default Discount Rate

```typescript
test('enhanced endpoint uses default discount rate', async () => {
  const response = await fetch('/api/calculate/enhanced/individual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate: '1960-01-01',
      pia: 3000,
      lifeExpectancy: 85,
      inflationRate: 0.02
      // discountRate not specified
    })
  });
  
  const result = await response.json();
  
  expect(result.metadata.discountRate).toBe(0.03);  // Default
});
```

---

## Rollback Plan

### If You Need to Rollback

The migration is **zero-risk** because:
1. Basic endpoints are unchanged
2. Enhanced endpoints are additive
3. Feature flags allow instant disable

### Disable Enhanced Features

**Option 1: Environment Variable**
```bash
ENABLE_ENHANCED_OPTIMIZATION=false
```

**Option 2: Code Change**
```typescript
// Revert to basic endpoints in your client code
const endpoint = '/api/calculate/individual';  // Remove '/enhanced'
```

### No Data Migration Required

- No database changes
- No data format changes
- No stored state to migrate

---

## FAQ

### Q: Do I need to migrate immediately?

**A:** No. Basic endpoints will continue to work indefinitely. Migrate when you're ready to use enhanced features.

### Q: Can I use both basic and enhanced endpoints?

**A:** Yes. You can use both simultaneously. This is useful during gradual migration or for different use cases.

### Q: Will basic endpoints be deprecated?

**A:** No current plans to deprecate basic endpoints. They serve as a simpler alternative for basic use cases.

### Q: What if enhanced optimization is disabled?

**A:** Enhanced endpoints return 403 error. Your code should handle this and fall back to basic endpoints if needed.

### Q: Do enhanced endpoints cost more to run?

**A:** Enhanced calculations are slightly more computationally intensive but the difference is negligible for typical usage.

### Q: How do I know which endpoint to use?

**A:** Use enhanced endpoints if you need:
- Year-by-year projections
- Present value analysis
- Survivor benefit scenarios
- Strategy comparisons

Use basic endpoints if you only need:
- Optimal claiming age
- Total lifetime benefits
- Simple strategy list

### Q: Are the calculations different?

**A:** The core Social Security rules are the same. Enhanced endpoints provide more detailed analysis and additional features.

### Q: Can I customize the discount rate?

**A:** Yes. Pass `discountRate` in your request (0-0.10). Default is 0.03 (3%).

### Q: What about mobile/responsive design?

**A:** API changes are backend-only. Frontend responsive design is separate and already implemented.

---

## Support

### Getting Help

- **Documentation**: Review API.md and USER_GUIDE.md
- **Examples**: See code examples in this guide
- **Testing**: Use provided test cases
- **Issues**: Contact development team

### Reporting Issues

When reporting migration issues, include:
- Endpoint being called
- Request payload
- Response received
- Expected behavior
- Environment configuration

---

## Summary

### Key Points

✅ **Zero breaking changes** - Basic endpoints unchanged  
✅ **Additive features** - Enhanced endpoints add new capabilities  
✅ **Backward compatible** - Existing integrations continue working  
✅ **Feature flags** - Control enhanced features via configuration  
✅ **Gradual migration** - Migrate at your own pace  
✅ **Easy rollback** - Disable enhanced features anytime

### Migration Checklist

- [ ] Review this migration guide
- [ ] Enable `ENABLE_ENHANCED_OPTIMIZATION` in environment
- [ ] Test basic endpoints still work
- [ ] Test enhanced endpoints with sample data
- [ ] Update client code to call enhanced endpoints (optional)
- [ ] Update response handling for wrapped structure
- [ ] Test with various discount rates
- [ ] Review year-by-year projections
- [ ] Test survivor scenarios for couples
- [ ] Update documentation for your users
- [ ] Deploy to staging environment
- [ ] Perform integration testing
- [ ] Deploy to production
- [ ] Monitor for issues

---

*Last Updated: November 2025*  
*Version: 2.0*
