# Social Security Calculator API Documentation

## Overview

The Social Security Calculator API provides endpoints for calculating optimal Social Security claiming strategies. The API supports both basic and enhanced calculation modes, with enhanced mode providing detailed year-by-year projections, present value calculations, and survivor benefit scenarios.

**Base URL:** `http://localhost:3002/api`

**Content Type:** `application/json`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid request parameters
- `FEATURE_DISABLED` (403) - Requested feature is not enabled
- `CALCULATION_ERROR` (422) - Error during calculation
- `INTERNAL_ERROR` (500) - Internal server error

## Endpoints

### Health Check

#### GET /api/health

Check if the API is running and healthy.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

---

## Basic Calculation Endpoints

### Calculate Individual Strategy

#### POST /api/calculate/individual

Calculate optimal claiming strategy for an individual using basic optimization.

**Request Body:**

```json
{
  "birthDate": "1960-01-01",
  "pia": 3000,
  "lifeExpectancy": 85,
  "inflationRate": 0.02
}
```

**Request Parameters:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| birthDate | string | Yes | ISO 8601 date | Individual's birth date |
| pia | number | Yes | 1-5000 | Primary Insurance Amount (monthly) |
| lifeExpectancy | number | Yes | 70-100 | Expected age at death |
| inflationRate | number | Yes | 0-0.10 | Annual inflation rate (e.g., 0.02 for 2%) |

**Response:**

```json
{
  "optimalAge": 70,
  "optimalMonthlyBenefit": 3720,
  "optimalLifetimeBenefit": 669600,
  "fra": 67,
  "strategies": [
    {
      "claimingAge": 62,
      "monthlyBenefit": 2100,
      "lifetimeBenefit": 579600,
      "description": "Claim at 62"
    },
    {
      "claimingAge": 70,
      "monthlyBenefit": 3720,
      "lifetimeBenefit": 669600,
      "description": "Claim at 70 (Optimal)"
    }
  ],
  "chartData": [
    {
      "age": 62,
      "benefit": 579600
    }
  ]
}
```

---

### Calculate Couple Strategy

#### POST /api/calculate/couple

Calculate optimal claiming strategy for a married couple using basic optimization.

**Request Body:**

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

**Request Parameters:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| spouse1 | object | Yes | - | First spouse's information |
| spouse1.birthDate | string | Yes | ISO 8601 date | First spouse's birth date |
| spouse1.pia | number | Yes | 1-5000 | First spouse's PIA (monthly) |
| spouse1.lifeExpectancy | number | Yes | 70-100 | First spouse's life expectancy |
| spouse2 | object | Yes | - | Second spouse's information |
| spouse2.birthDate | string | Yes | ISO 8601 date | Second spouse's birth date |
| spouse2.pia | number | Yes | 1-5000 | Second spouse's PIA (monthly) |
| spouse2.lifeExpectancy | number | Yes | 70-100 | Second spouse's life expectancy |
| inflationRate | number | Yes | 0-0.10 | Annual inflation rate |

**Response:**

```json
{
  "optimalStrategy": {
    "spouse1ClaimingAge": 70,
    "spouse2ClaimingAge": 67,
    "combinedMonthlyBenefit": 5720,
    "combinedLifetimeBenefit": 1234567,
    "description": "Spouse 1 claims at 70, Spouse 2 claims at 67"
  },
  "alternativeStrategies": [],
  "spouse1Fra": 67,
  "spouse2Fra": 67,
  "higherEarnerSpouse": 1
}
```

---

## Enhanced Calculation Endpoints

### Calculate Enhanced Individual Strategy

#### POST /api/calculate/enhanced/individual

Calculate optimal claiming strategy for an individual with enhanced features including year-by-year projections, present value calculations, and detailed strategy comparisons.

**Feature Flag:** Requires `ENABLE_ENHANCED_OPTIMIZATION` to be enabled.

**Request Body:**

```json
{
  "birthDate": "1960-01-01",
  "pia": 3000,
  "lifeExpectancy": 85,
  "inflationRate": 0.02,
  "discountRate": 0.03
}
```

**Request Parameters:**

| Field | Type | Required | Constraints | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| birthDate | string | Yes | ISO 8601 date | - | Individual's birth date |
| pia | number | Yes | 1-5000 | - | Primary Insurance Amount (monthly) |
| lifeExpectancy | number | Yes | 70-100 | - | Expected age at death |
| inflationRate | number | Yes | 0-0.10 | - | Annual inflation rate |
| discountRate | number | No | 0-0.10 | 0.03 | Discount rate for present value calculations |

**Response:**

```json
{
  "type": "individual",
  "individual": {
    "optimalAge": 70,
    "optimalMonthlyBenefit": 3720,
    "optimalLifetimeBenefit": 669600,
    "optimalPresentValue": 520345,
    "fra": 67,
    "yearlyProjections": [
      {
        "year": 2030,
        "age": 70,
        "retirementBenefit": 3720,
        "annualBenefit": 44640,
        "inflationAdjustedBenefit": 44640,
        "cumulativeBenefit": 44640
      },
      {
        "year": 2031,
        "age": 71,
        "retirementBenefit": 3720,
        "annualBenefit": 44640,
        "inflationAdjustedBenefit": 45533,
        "cumulativeBenefit": 90173
      }
    ],
    "allStrategies": [
      {
        "claimingAge": 62,
        "monthlyBenefit": 2100,
        "lifetimeBenefit": 579600,
        "presentValue": 485234,
        "yearlyProjections": [],
        "description": "Claim at age 62",
        "adjustmentFactor": 0.7,
        "adjustmentPercentage": -30
      },
      {
        "claimingAge": 70,
        "monthlyBenefit": 3720,
        "lifetimeBenefit": 669600,
        "presentValue": 520345,
        "yearlyProjections": [],
        "description": "Claim at age 70 (Optimal)",
        "adjustmentFactor": 1.24,
        "adjustmentPercentage": 24
      }
    ],
    "alternativeStrategies": [
      {
        "claimingAge": 69,
        "monthlyBenefit": 3480,
        "lifetimeBenefit": 667200,
        "presentValue": 518234,
        "yearlyProjections": [],
        "description": "Claim at age 69",
        "adjustmentFactor": 1.16,
        "adjustmentPercentage": 16
      }
    ],
    "comparisonWithAge62": {
      "age62LifetimeBenefit": 579600,
      "age62PresentValue": 485234,
      "additionalLifetimeBenefit": 90000,
      "additionalPresentValue": 35111,
      "percentageIncrease": 15.5
    }
  },
  "metadata": {
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| type | string | Always "individual" |
| individual.optimalAge | number | Optimal claiming age (62-70) |
| individual.optimalMonthlyBenefit | number | Monthly benefit at optimal age |
| individual.optimalLifetimeBenefit | number | Total lifetime benefits (nominal) |
| individual.optimalPresentValue | number | Present value of optimal strategy |
| individual.fra | number | Full Retirement Age |
| individual.yearlyProjections | array | Year-by-year benefit projections |
| individual.allStrategies | array | All evaluated strategies (ages 62-70) |
| individual.alternativeStrategies | array | Strategies within 2% of optimal |
| individual.comparisonWithAge62 | object | Comparison with claiming at 62 |
| metadata.calculatedAt | string | ISO timestamp of calculation |
| metadata.assumptions | object | Calculation assumptions |
| metadata.discountRate | number | Discount rate used |

---

### Calculate Enhanced Couple Strategy

#### POST /api/calculate/enhanced/couple

Calculate optimal claiming strategy for a married couple with enhanced features including year-by-year projections, present value calculations, spousal benefits, and survivor benefit scenarios.

**Feature Flag:** Requires `ENABLE_ENHANCED_OPTIMIZATION` to be enabled.

**Request Body:**

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
  "discountRate": 0.03
}
```

**Request Parameters:**

| Field | Type | Required | Constraints | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| spouse1 | object | Yes | - | - | First spouse's information |
| spouse1.birthDate | string | Yes | ISO 8601 date | - | First spouse's birth date |
| spouse1.pia | number | Yes | 1-5000 | - | First spouse's PIA (monthly) |
| spouse1.lifeExpectancy | number | Yes | 70-100 | - | First spouse's life expectancy |
| spouse2 | object | Yes | - | - | Second spouse's information |
| spouse2.birthDate | string | Yes | ISO 8601 date | - | Second spouse's birth date |
| spouse2.pia | number | Yes | 1-5000 | - | Second spouse's PIA (monthly) |
| spouse2.lifeExpectancy | number | Yes | 70-100 | - | Second spouse's life expectancy |
| inflationRate | number | Yes | 0-0.10 | - | Annual inflation rate |
| discountRate | number | No | 0-0.10 | 0.03 | Discount rate for present value |

**Response:**

```json
{
  "type": "couple",
  "couple": {
    "optimalStrategy": {
      "spouse1ClaimingAge": 70,
      "spouse2ClaimingAge": 67,
      "spouse1MonthlyBenefit": 3720,
      "spouse2MonthlyBenefit": 2000,
      "spousalBenefitAmount": 0,
      "combinedMonthlyBenefit": 5720,
      "combinedLifetimeBenefit": 1456789,
      "combinedPresentValue": 1123456,
      "yearlyProjections": [
        {
          "year": 2029,
          "spouse1Age": 69,
          "spouse2Age": 67,
          "spouse1RetirementBenefit": 0,
          "spouse2RetirementBenefit": 2000,
          "spousalBenefit": 0,
          "survivorBenefit": 0,
          "totalMonthlyBenefit": 2000,
          "totalAnnualBenefit": 24000,
          "inflationAdjustedTotal": 24000,
          "cumulativeBenefit": 24000
        }
      ],
      "survivorScenarios": [],
      "description": "Spouse 1 claims at 70, Spouse 2 claims at 67"
    },
    "optimalPresentValue": 1123456,
    "spouse1Fra": 67,
    "spouse2Fra": 67,
    "higherEarnerSpouse": 1,
    "yearlyProjections": [],
    "survivorScenarios": {
      "spouse1Outlives": {
        "deceasedSpouse": 2,
        "yearOfDeath": 2049,
        "survivorAge": 89,
        "survivorBenefit": 3720,
        "yearsAsSurvivor": 0,
        "yearlyProjections": [],
        "totalSurvivorBenefit": 0,
        "presentValueSurvivorBenefit": 0
      },
      "spouse2Outlives": {
        "deceasedSpouse": 1,
        "yearOfDeath": 2045,
        "survivorAge": 83,
        "survivorBenefit": 3720,
        "yearsAsSurvivor": 4,
        "yearlyProjections": [
          {
            "year": 2045,
            "age": 83,
            "retirementBenefit": 3720,
            "annualBenefit": 44640,
            "inflationAdjustedBenefit": 44640,
            "cumulativeBenefit": 44640
          }
        ],
        "totalSurvivorBenefit": 178560,
        "presentValueSurvivorBenefit": 145234
      }
    },
    "allStrategies": [],
    "alternativeStrategies": []
  },
  "metadata": {
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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| type | string | Always "couple" |
| couple.optimalStrategy | object | Optimal claiming strategy |
| couple.optimalStrategy.spouse1ClaimingAge | number | Spouse 1 optimal claiming age |
| couple.optimalStrategy.spouse2ClaimingAge | number | Spouse 2 optimal claiming age |
| couple.optimalStrategy.combinedLifetimeBenefit | number | Total combined lifetime benefits |
| couple.optimalStrategy.combinedPresentValue | number | Present value of combined benefits |
| couple.optimalStrategy.yearlyProjections | array | Year-by-year projections |
| couple.survivorScenarios | object | Survivor benefit scenarios |
| couple.survivorScenarios.spouse1Outlives | object | Scenario if spouse 2 dies first |
| couple.survivorScenarios.spouse2Outlives | object | Scenario if spouse 1 dies first |
| couple.allStrategies | array | All evaluated strategies |
| couple.alternativeStrategies | array | Strategies within 2% of optimal |

---

## Data Types

### YearlyProjection

Year-by-year benefit projection for an individual.

```typescript
{
  year: number;              // Calendar year
  age: number;               // Age during this year
  retirementBenefit: number; // Monthly retirement benefit
  annualBenefit: number;     // Total benefit for the year (12 months)
  inflationAdjustedBenefit: number; // Inflation-adjusted annual benefit
  cumulativeBenefit: number; // Cumulative total through this year
}
```

### CoupleYearlyProjection

Year-by-year benefit projection for a couple.

```typescript
{
  year: number;                    // Calendar year
  spouse1Age: number;              // Spouse 1 age
  spouse2Age: number;              // Spouse 2 age
  spouse1RetirementBenefit: number; // Spouse 1 monthly retirement benefit
  spouse2RetirementBenefit: number; // Spouse 2 monthly retirement benefit
  spousalBenefit: number;          // Monthly spousal benefit
  survivorBenefit: number;         // Monthly survivor benefit
  totalMonthlyBenefit: number;     // Combined monthly benefit
  totalAnnualBenefit: number;      // Total benefit for the year
  inflationAdjustedTotal: number;  // Inflation-adjusted annual total
  cumulativeBenefit: number;       // Cumulative total through this year
}
```

### SurvivorProjection

Survivor benefit scenario projection.

```typescript
{
  deceasedSpouse: 1 | 2;           // Which spouse passed away
  yearOfDeath: number;             // Calendar year of death
  survivorAge: number;             // Age of survivor when spouse dies
  survivorBenefit: number;         // Monthly survivor benefit amount
  yearsAsSurvivor: number;         // Years receiving survivor benefits
  yearlyProjections: YearlyProjection[]; // Year-by-year survivor benefits
  totalSurvivorBenefit: number;    // Total survivor benefits received
  presentValueSurvivorBenefit: number; // Present value of survivor benefits
}
```

### StrategyEvaluation

Evaluation of a specific claiming strategy.

```typescript
{
  claimingAge: number;             // Age when claiming benefits
  monthlyBenefit: number;          // Monthly benefit amount
  lifetimeBenefit: number;         // Total lifetime benefits (nominal)
  presentValue: number;            // Present value of benefit stream
  yearlyProjections: YearlyProjection[]; // Year-by-year projections
  description: string;             // Human-readable description
  adjustmentFactor: number;        // Adjustment factor from PIA
  adjustmentPercentage: number;    // Percentage adjustment from PIA
}
```

---

## Examples

### Example 1: Basic Individual Calculation

**Request:**

```bash
curl -X POST http://localhost:3002/api/calculate/individual \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1960-01-01",
    "pia": 3000,
    "lifeExpectancy": 85,
    "inflationRate": 0.02
  }'
```

**Response:**

```json
{
  "optimalAge": 70,
  "optimalMonthlyBenefit": 3720,
  "optimalLifetimeBenefit": 669600,
  "fra": 67
}
```

### Example 2: Enhanced Individual Calculation with Custom Discount Rate

**Request:**

```bash
curl -X POST http://localhost:3002/api/calculate/enhanced/individual \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1960-01-01",
    "pia": 3000,
    "lifeExpectancy": 85,
    "inflationRate": 0.02,
    "discountRate": 0.05
  }'
```

**Response:**

```json
{
  "type": "individual",
  "individual": {
    "optimalAge": 70,
    "optimalPresentValue": 485234,
    "yearlyProjections": [...]
  },
  "metadata": {
    "discountRate": 0.05
  }
}
```

### Example 3: Enhanced Couple Calculation

**Request:**

```bash
curl -X POST http://localhost:3002/api/calculate/enhanced/couple \
  -H "Content-Type: application/json" \
  -d '{
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
    "discountRate": 0.03
  }'
```

**Response:**

```json
{
  "type": "couple",
  "couple": {
    "optimalStrategy": {
      "spouse1ClaimingAge": 70,
      "spouse2ClaimingAge": 67,
      "combinedLifetimeBenefit": 1456789
    },
    "survivorScenarios": {
      "spouse1Outlives": {...},
      "spouse2Outlives": {...}
    }
  }
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Versioning

The API does not currently use versioning. Breaking changes will be communicated through:
- Feature flags for new functionality
- Backward-compatible response formats
- Deprecation notices in documentation

## Support

For issues or questions, please refer to the project repository or contact the development team.
