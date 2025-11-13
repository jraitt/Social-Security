# Design Document

## Overview

This design document outlines the architecture and implementation approach for enhancing the Social Security Calculator's optimization strategy. The enhancement shifts from a simple breakeven age calculation to a comprehensive total dollar benefit maximization approach with detailed year-by-year projections, present value analysis, and survivor benefit scenarios.

The design maintains backward compatibility with the existing system while adding new calculation capabilities and enhanced result displays.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ Calculator     │  │ Enhanced Results │  │ Projection  │ │
│  │ Form           │  │ Display          │  │ Table       │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ Strategy       │  │ Present Value    │  │ Export      │ │
│  │ Comparison     │  │ Display          │  │ Component   │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Enhanced Calculation Service              │ │
│  │  • Strategy Evaluation                                 │ │
│  │  • Total Benefit Calculation                           │ │
│  │  • Present Value Calculation                           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Projection Service (Enhanced)             │ │
│  │  • Year-by-Year Projections                            │ │
│  │  • Benefit Stream Generation                           │ │
│  │  • Survivor Scenario Modeling                          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SSA Rules Engine (Enhanced)               │ │
│  │  • Spousal Benefit Rules                               │ │
│  │  • Survivor Benefit Rules                              │ │
│  │  • Benefit Coordination Logic                          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Present Value Service (New)               │ │
│  │  • Discount Rate Application                           │ │
│  │  • NPV Calculations                                    │ │
│  │  • Strategy Comparison                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Enhanced Calculation Service

**Purpose:** Orchestrates the calculation of optimal claiming strategies using total dollar benefit maximization.

**Key Methods:**

```typescript
interface EnhancedCalculationService {
  /**
   * Calculate optimal strategy for individual
   * Returns strategy with highest total lifetime benefits
   */
  calculateIndividualOptimal(input: IndividualInput): IndividualResult;
  
  /**
   * Calculate optimal strategy for couple
   * Evaluates all claiming age combinations
   */
  calculateCoupleOptimal(input: CoupleInput): CoupleResult;
  
  /**
   * Evaluate a specific claiming strategy
   * Returns detailed projections and totals
   */
  evaluateStrategy(
    claimingAges: ClaimingAges,
    input: CalculationInput
  ): StrategyEvaluation;
  
  /**
   * Compare two strategies
   * Returns difference in total benefits and present value
   */
  compareStrategies(
    strategy1: StrategyEvaluation,
    strategy2: StrategyEvaluation
  ): StrategyComparison;
}
```

**Algorithm:**

1. Generate all valid claiming age combinations (62-70 for each spouse)
2. For each combination:
   - Calculate year-by-year benefit projections
   - Sum total lifetime benefits
   - Calculate present value
   - Evaluate survivor scenarios
3. Identify strategy with highest total benefits
4. Generate alternative strategies within 2% of optimal
5. Return comprehensive results with projections

#### 2. Projection Service (Enhanced)

**Purpose:** Generates detailed year-by-year benefit projections for any claiming strategy.

**Key Methods:**

```typescript
interface ProjectionService {
  /**
   * Generate year-by-year projections for individual
   */
  projectIndividualBenefits(
    claimingAge: number,
    input: IndividualInput
  ): YearlyProjection[];
  
  /**
   * Generate year-by-year projections for couple
   * Includes retirement, spousal, and survivor benefits
   */
  projectCoupleBenefits(
    spouse1ClaimingAge: number,
    spouse2ClaimingAge: number,
    input: CoupleInput
  ): CoupleYearlyProjection[];
  
  /**
   * Generate survivor benefit scenario
   * Models benefits if one spouse predeceases the other
   */
  projectSurvivorScenario(
    deceasedSpouse: 1 | 2,
    yearOfDeath: number,
    input: CoupleInput
  ): SurvivorProjection;
  
  /**
   * Calculate total benefits from projections
   */
  sumTotalBenefits(projections: YearlyProjection[]): number;
}
```

**Projection Logic:**

For each year from claiming age to life expectancy:
1. Calculate base retirement benefit (with COLA adjustments)
2. Calculate spousal benefit if applicable
3. Determine if survivor benefits apply
4. Apply inflation adjustment if enabled
5. Sum all benefit types for the year
6. Store in projection array

#### 3. SSA Rules Engine (Enhanced)

**Purpose:** Implements Social Security Administration rules for all benefit types.

**Key Methods:**

```typescript
interface SSARulesEngine {
  /**
   * Calculate retirement benefit at claiming age
   */
  calculateRetirementBenefit(
    pia: number,
    claimingAge: number,
    fra: number
  ): number;
  
  /**
   * Calculate spousal benefit
   * Returns 50% of spouse's PIA with age adjustments
   */
  calculateSpousalBenefit(
    ownPIA: number,
    spousePIA: number,
    claimingAge: number,
    spouseFRA: number
  ): number;
  
  /**
   * Calculate survivor benefit
   * Returns higher of own benefit or deceased spouse's benefit
   */
  calculateSurvivorBenefit(
    ownBenefit: number,
    deceasedBenefit: number,
    survivorAge: number,
    survivorFRA: number
  ): number;
  
  /**
   * Determine which benefit to pay
   * Handles coordination between retirement, spousal, and survivor
   */
  determineBenefitToPay(
    retirementBenefit: number,
    spousalBenefit: number,
    survivorBenefit: number
  ): BenefitBreakdown;
  
  /**
   * Apply COLA (Cost of Living Adjustment)
   */
  applyCOLA(benefit: number, years: number, colaRate: number): number;
}
```

**Rules Implementation:**

- **Early Claiming Reduction:** 5/9 of 1% per month for first 36 months, 5/12 of 1% thereafter
- **Delayed Retirement Credits:** 8% per year after FRA up to age 70
- **Spousal Benefit:** 50% of spouse's PIA at FRA, reduced if claimed early
- **Survivor Benefit:** 100% of deceased spouse's benefit (including DRCs)
- **Benefit Coordination:** Pay higher of own benefit or spousal/survivor benefit

#### 4. Present Value Service (New)

**Purpose:** Calculates present value of benefit streams for strategy comparison.

**Key Methods:**

```typescript
interface PresentValueService {
  /**
   * Calculate present value of benefit stream
   */
  calculatePresentValue(
    projections: YearlyProjection[],
    discountRate: number,
    baseYear: number
  ): number;
  
  /**
   * Calculate NPV of a strategy
   */
  calculateNPV(
    strategy: StrategyEvaluation,
    discountRate: number
  ): number;
  
  /**
   * Compare present values of two strategies
   */
  comparePresentValues(
    strategy1PV: number,
    strategy2PV: number
  ): {
    difference: number;
    percentageDifference: number;
    higherStrategy: 1 | 2;
  };
}
```

**Present Value Formula:**

```
PV = Σ (Benefit_year / (1 + discount_rate)^years_from_now)
```

Where:
- `Benefit_year` = Total benefit amount for that year
- `discount_rate` = Annual discount rate (default 3%)
- `years_from_now` = Number of years from current year to benefit year

### Frontend Components

#### 1. Enhanced Results Display Component

**Purpose:** Displays comprehensive results with all benefit types and scenarios.

**Props:**

```typescript
interface EnhancedResultsDisplayProps {
  result: EnhancedCalculationResult;
  mode: 'individual' | 'couple';
  onStrategyChange?: (strategy: StrategyEvaluation) => void;
}
```

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Optimal Strategy Card                                  │
│  • Claiming ages                                        │
│  • Total lifetime benefits                              │
│  • Present value                                        │
│  • Why this is optimal (explanation)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Year-by-Year Projection Table                          │
│  Year | Retirement | Spousal | Survivor | Total         │
│  ────────────────────────────────────────────────────   │
│  2030 | $3,972     | $0      | $0       | $3,972        │
│  2031 | $47,664    | $0      | $0       | $47,664       │
│  ...                                                     │
│  ────────────────────────────────────────────────────   │
│  If you outlive spouse: $47,664                         │
│  If spouse outlives you: $33,485                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Strategy Comparison                                    │
│  Selected Strategy PV: $862,555                         │
│  Optimal Strategy PV: $904,595                          │
│  Difference: -$42,040 (-4.6%)                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Alternative Strategies (within 2%)                     │
│  • Age 67/70: $900,123 total                            │
│  • Age 70/67: $898,456 total                            │
└─────────────────────────────────────────────────────────┘
```

#### 2. Projection Table Component

**Purpose:** Displays year-by-year benefit projections in tabular format.

**Props:**

```typescript
interface ProjectionTableProps {
  projections: YearlyProjection[] | CoupleYearlyProjection[];
  mode: 'individual' | 'couple';
  showSurvivorScenarios?: boolean;
}
```

**Features:**
- Sortable columns
- Collapsible on mobile
- Export to CSV button
- Highlight total row
- Show survivor scenarios at bottom

#### 3. Present Value Display Component

**Purpose:** Shows present value calculations and comparisons.

**Props:**

```typescript
interface PresentValueDisplayProps {
  selectedStrategyPV: number;
  optimalStrategyPV: number;
  discountRate: number;
  onDiscountRateChange: (rate: number) => void;
}
```

**Features:**
- Display PV for selected and optimal strategies
- Show dollar and percentage difference
- Discount rate slider (0-10%)
- Tooltip explaining present value concept

#### 4. Strategy Comparison Component

**Purpose:** Allows users to compare different claiming strategies.

**Props:**

```typescript
interface StrategyComparisonProps {
  strategies: StrategyEvaluation[];
  selectedStrategy: StrategyEvaluation;
  optimalStrategy: StrategyEvaluation;
  onStrategySelect: (strategy: StrategyEvaluation) => void;
}
```

**Features:**
- Dropdown to select strategy to compare
- Side-by-side comparison view
- Highlight differences
- Show which is better

#### 5. Export Component

**Purpose:** Exports calculation results to CSV format.

**Props:**

```typescript
interface ExportComponentProps {
  result: EnhancedCalculationResult;
  input: CalculationInput;
}
```

**Export Format:**

```csv
Social Security Calculation Results
Generated: 2025-11-09

Input Parameters
Mode,Individual/Couple
Birth Date,1960-01-01
PIA,$3,972
Life Expectancy,85
Discount Rate,3.0%

Optimal Strategy
Claiming Age,70
Total Lifetime Benefits,$2,456,789
Present Value,$1,234,567

Year-by-Year Projections
Year,Retirement Benefit,Spousal Benefit,Survivor Benefit,Total
2030,$3,972,$0,$0,$3,972
...
```

## Data Models

### Enhanced Result Types

```typescript
interface EnhancedCalculationResult {
  type: 'individual' | 'couple';
  individual?: EnhancedIndividualResult;
  couple?: EnhancedCoupleResult;
  metadata: {
    calculatedAt: string;
    assumptions: AssumptionData;
    discountRate: number;
  };
}

interface EnhancedIndividualResult {
  optimalAge: number;
  optimalMonthlyBenefit: number;
  optimalLifetimeBenefit: number;
  optimalPresentValue: number;
  fra: number;
  
  // Year-by-year projections
  yearlyProjections: YearlyProjection[];
  
  // All evaluated strategies
  allStrategies: StrategyEvaluation[];
  
  // Alternative strategies within 2%
  alternativeStrategies: StrategyEvaluation[];
  
  // Comparison with age 62
  comparisonWithAge62: {
    age62LifetimeBenefit: number;
    age62PresentValue: number;
    additionalLifetimeBenefit: number;
    additionalPresentValue: number;
    percentageIncrease: number;
  };
}

interface EnhancedCoupleResult {
  optimalStrategy: CoupleStrategy;
  optimalPresentValue: number;
  
  spouse1Fra: number;
  spouse2Fra: number;
  
  // Year-by-year projections
  yearlyProjections: CoupleYearlyProjection[];
  
  // Survivor scenarios
  survivorScenarios: {
    spouse1Outlives: SurvivorProjection;
    spouse2Outlives: SurvivorProjection;
  };
  
  // All evaluated strategies
  allStrategies: CoupleStrategyEvaluation[];
  
  // Alternative strategies within 2%
  alternativeStrategies: CoupleStrategyEvaluation[];
}

interface YearlyProjection {
  year: number;
  age: number;
  retirementBenefit: number;
  inflationAdjustedBenefit: number;
  cumulativeBenefit: number;
}

interface CoupleYearlyProjection {
  year: number;
  spouse1Age: number;
  spouse2Age: number;
  
  spouse1RetirementBenefit: number;
  spouse2RetirementBenefit: number;
  spousalBenefit: number;
  survivorBenefit: number;
  
  totalAnnualBenefit: number;
  inflationAdjustedTotal: number;
  cumulativeBenefit: number;
}

interface SurvivorProjection {
  deceasedSpouse: 1 | 2;
  yearOfDeath: number;
  survivorBenefit: number;
  yearsAsSurvivor: number;
  totalSurvivorBenefit: number;
  presentValueSurvivorBenefit: number;
}

interface StrategyEvaluation {
  claimingAge: number;
  monthlyBenefit: number;
  lifetimeBenefit: number;
  presentValue: number;
  yearlyProjections: YearlyProjection[];
  description: string;
}

interface CoupleStrategyEvaluation {
  spouse1ClaimingAge: number;
  spouse2ClaimingAge: number;
  combinedLifetimeBenefit: number;
  combinedPresentValue: number;
  yearlyProjections: CoupleYearlyProjection[];
  description: string;
}
```

## Error Handling

### Validation Errors

1. **Invalid Discount Rate**
   - Range: 0% - 10%
   - Error: "Discount rate must be between 0% and 10%"

2. **Invalid Life Expectancy**
   - Must be greater than current age
   - Error: "Life expectancy must be greater than current age"

3. **Invalid Claiming Age**
   - Range: 62 - 70
   - Error: "Claiming age must be between 62 and 70"

### Calculation Errors

1. **Projection Generation Failure**
   - Fallback: Return basic calculation without projections
   - Log error for debugging

2. **Present Value Calculation Failure**
   - Fallback: Show nominal values only
   - Display warning to user

3. **Survivor Scenario Failure**
   - Fallback: Omit survivor scenarios from results
   - Display warning about incomplete results

## Testing Strategy

### Unit Tests

1. **Present Value Service**
   - Test PV calculation with various discount rates
   - Test NPV comparison logic
   - Test edge cases (0% discount, 10% discount)

2. **Projection Service**
   - Test year-by-year projection generation
   - Test survivor scenario modeling
   - Test benefit coordination logic

3. **SSA Rules Engine**
   - Test spousal benefit calculations
   - Test survivor benefit calculations
   - Test benefit coordination rules

4. **Enhanced Calculation Service**
   - Test strategy evaluation
   - Test optimal strategy identification
   - Test alternative strategy generation

### Integration Tests

1. **Individual Calculation Flow**
   - Submit individual input
   - Verify projections generated
   - Verify present value calculated
   - Verify optimal strategy identified

2. **Couple Calculation Flow**
   - Submit couple input
   - Verify spousal benefits calculated
   - Verify survivor scenarios generated
   - Verify optimal strategy identified

3. **Strategy Comparison**
   - Compare two strategies
   - Verify differences calculated correctly
   - Verify present value comparison

### End-to-End Tests

1. **Complete User Journey**
   - Enter inputs
   - Submit calculation
   - View results with projections
   - Adjust discount rate
   - Export results to CSV

2. **Responsive Design**
   - Test on mobile devices
   - Verify projection table scrolls/collapses
   - Verify all components responsive

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache FRA calculations
   - Cache benefit adjustment factors
   - Cache COLA calculations

2. **Parallel Processing**
   - Evaluate strategies in parallel (for couple mode)
   - Use worker threads for heavy calculations

3. **Lazy Loading**
   - Load projection table data on demand
   - Lazy load alternative strategies

4. **Memoization**
   - Memoize present value calculations
   - Memoize benefit calculations for same inputs

### Performance Targets

- Individual calculation: < 500ms
- Couple calculation: < 2 seconds (evaluating 81 combinations)
- Projection generation: < 100ms
- Present value calculation: < 50ms
- UI rendering: < 200ms

## Security Considerations

1. **Input Validation**
   - Validate all numeric inputs
   - Sanitize date inputs
   - Prevent injection attacks

2. **Rate Limiting**
   - Limit calculation requests per user
   - Prevent abuse of calculation endpoint

3. **Data Privacy**
   - Don't log PII
   - Don't store calculation inputs
   - Use HTTPS for all communications

## Deployment Strategy

### Phase 1: Backend Enhancement
- Deploy new calculation services
- Maintain backward compatibility
- Add new API endpoints

### Phase 2: Frontend Enhancement
- Deploy new result display components
- Add projection table
- Add present value display

### Phase 3: Feature Rollout
- Enable for all users
- Monitor performance
- Gather user feedback

### Rollback Plan
- Keep old calculation logic as fallback
- Feature flag for new optimization
- Quick rollback if issues detected

## Migration Path

### Backward Compatibility

1. **API Compatibility**
   - New endpoints: `/api/calculate/enhanced/individual` and `/api/calculate/enhanced/couple`
   - Old endpoints remain functional
   - Gradual migration of frontend to new endpoints

2. **Data Format**
   - New result format extends old format
   - Old format still supported
   - Frontend can handle both formats

3. **Feature Flags**
   - `ENABLE_ENHANCED_OPTIMIZATION` flag
   - `ENABLE_PRESENT_VALUE` flag
   - `ENABLE_PROJECTIONS` flag

### Migration Steps

1. Deploy backend with feature flags disabled
2. Test new endpoints in staging
3. Enable for internal users
4. Gradual rollout to all users
5. Deprecate old endpoints after 6 months
