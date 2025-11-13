/**
 * Enhanced TypeScript Type Definitions for Social Security Calculator
 * 
 * Defines enhanced interfaces and types for the improved optimization strategy
 * that focuses on total dollar benefit maximization with year-by-year projections,
 * present value calculations, and detailed survivor benefit scenarios.
 */

// ============================================================================
// Enhanced Projection Types
// ============================================================================

/**
 * Year-by-year benefit projection for an individual
 */
export interface YearlyProjection {
  year: number; // Calendar year
  age: number; // Age during this year
  retirementBenefit: number; // Monthly retirement benefit for this year
  annualBenefit: number; // Total benefit for the year (12 months)
  inflationAdjustedBenefit: number; // Inflation-adjusted annual benefit
  cumulativeBenefit: number; // Cumulative total through this year
}

/**
 * Year-by-year benefit projection for a couple
 */
export interface CoupleYearlyProjection {
  year: number; // Calendar year
  spouse1Age: number; // Spouse 1 age during this year
  spouse2Age: number; // Spouse 2 age during this year
  
  // Individual retirement benefits
  spouse1RetirementBenefit: number; // Spouse 1 monthly retirement benefit
  spouse2RetirementBenefit: number; // Spouse 2 monthly retirement benefit
  
  // Additional benefit types
  spousalBenefit: number; // Monthly spousal benefit (if applicable)
  survivorBenefit: number; // Monthly survivor benefit (if applicable)
  
  // Totals
  totalMonthlyBenefit: number; // Combined monthly benefit
  totalAnnualBenefit: number; // Total benefit for the year
  inflationAdjustedTotal: number; // Inflation-adjusted annual total
  cumulativeBenefit: number; // Cumulative total through this year
}

/**
 * Survivor benefit scenario projection
 */
export interface SurvivorProjection {
  deceasedSpouse: 1 | 2; // Which spouse passed away
  yearOfDeath: number; // Calendar year of death
  survivorAge: number; // Age of survivor when spouse dies
  survivorBenefit: number; // Monthly survivor benefit amount
  yearsAsSurvivor: number; // Years receiving survivor benefits
  yearlyProjections: YearlyProjection[]; // Year-by-year survivor benefits
  totalSurvivorBenefit: number; // Total survivor benefits received
  presentValueSurvivorBenefit: number; // Present value of survivor benefits
}

// ============================================================================
// Present Value Types
// ============================================================================

/**
 * Present value calculation parameters
 */
export interface PresentValueParams {
  discountRate: number; // Annual discount rate (0-0.10)
  baseYear: number; // Base year for present value calculation
}

/**
 * Present value calculation result
 */
export interface PresentValueResult {
  nominalTotal: number; // Total nominal benefits
  presentValue: number; // Present value of benefit stream
  discountRate: number; // Discount rate used
  baseYear: number; // Base year used
}

// ============================================================================
// Strategy Evaluation Types
// ============================================================================

/**
 * Evaluation of a specific claiming strategy for an individual
 */
export interface StrategyEvaluation {
  claimingAge: number; // Age when claiming benefits
  monthlyBenefit: number; // Monthly benefit amount
  lifetimeBenefit: number; // Total lifetime benefits (nominal)
  presentValue: number; // Present value of benefit stream
  yearlyProjections: YearlyProjection[]; // Year-by-year projections
  description: string; // Human-readable description
  adjustmentFactor: number; // Adjustment factor from PIA
  adjustmentPercentage: number; // Percentage adjustment from PIA
}

/**
 * Evaluation of a specific claiming strategy for a couple
 */
export interface CoupleStrategyEvaluation {
  spouse1ClaimingAge: number; // Spouse 1 claiming age
  spouse2ClaimingAge: number; // Spouse 2 claiming age
  
  // Individual benefits
  spouse1MonthlyBenefit: number; // Spouse 1 monthly retirement benefit
  spouse2MonthlyBenefit: number; // Spouse 2 monthly retirement benefit
  spousalBenefitAmount: number; // Monthly spousal benefit
  
  // Combined totals
  combinedMonthlyBenefit: number; // Combined monthly benefit
  combinedLifetimeBenefit: number; // Total combined lifetime benefits
  combinedPresentValue: number; // Present value of combined benefits
  
  // Projections and scenarios
  yearlyProjections: CoupleYearlyProjection[]; // Year-by-year projections
  survivorScenarios: SurvivorProjection[]; // Survivor benefit scenarios
  
  description: string; // Human-readable description
}

/**
 * Comparison between two strategies
 */
export interface StrategyComparison {
  strategy1: StrategyEvaluation | CoupleStrategyEvaluation;
  strategy2: StrategyEvaluation | CoupleStrategyEvaluation;
  
  // Nominal benefit differences
  lifetimeBenefitDifference: number; // Dollar difference in lifetime benefits
  lifetimeBenefitPercentage: number; // Percentage difference
  
  // Present value differences
  presentValueDifference: number; // Dollar difference in present value
  presentValuePercentage: number; // Percentage difference
  
  // Which strategy is better
  betterStrategy: 1 | 2; // Which strategy has higher total benefits
}

// ============================================================================
// Enhanced Result Types
// ============================================================================

/**
 * Enhanced individual calculation result
 */
export interface EnhancedIndividualResult {
  // Optimal strategy
  optimalAge: number; // Optimal claiming age
  optimalMonthlyBenefit: number; // Monthly benefit at optimal age
  optimalLifetimeBenefit: number; // Total lifetime benefits
  optimalPresentValue: number; // Present value of optimal strategy
  
  // Full Retirement Age
  fra: number; // Full Retirement Age
  
  // Year-by-year projections
  yearlyProjections: YearlyProjection[]; // Detailed projections
  
  // All evaluated strategies
  allStrategies: StrategyEvaluation[]; // All strategies (62-70)
  
  // Alternative strategies within 2%
  alternativeStrategies: StrategyEvaluation[]; // Near-optimal alternatives
  
  // Comparison with age 62
  comparisonWithAge62: {
    age62LifetimeBenefit: number;
    age62PresentValue: number;
    additionalLifetimeBenefit: number;
    additionalPresentValue: number;
    percentageIncrease: number;
  };
  
  // Backward compatibility - keep existing fields
  optimalInflationAdjustedBenefit?: number;
  strategies?: StrategyEvaluation[];
  chartData?: any[];
}

/**
 * Enhanced couple calculation result
 */
export interface EnhancedCoupleResult {
  // Optimal strategy
  optimalStrategy: CoupleStrategyEvaluation;
  optimalPresentValue: number; // Present value of optimal strategy
  
  // Full Retirement Ages
  spouse1Fra: number;
  spouse2Fra: number;
  
  // Higher earner identification
  higherEarnerSpouse: 1 | 2;
  
  // Year-by-year projections
  yearlyProjections: CoupleYearlyProjection[];
  
  // Survivor scenarios
  survivorScenarios: {
    spouse1Outlives: SurvivorProjection; // If spouse 2 dies first
    spouse2Outlives: SurvivorProjection; // If spouse 1 dies first
  };
  
  // All evaluated strategies
  allStrategies: CoupleStrategyEvaluation[];
  
  // Alternative strategies within 2%
  alternativeStrategies: CoupleStrategyEvaluation[];
}

/**
 * Enhanced calculation result (can be individual or couple)
 */
export interface EnhancedCalculationResult {
  type: 'individual' | 'couple';
  individual?: EnhancedIndividualResult;
  couple?: EnhancedCoupleResult;
  metadata: {
    calculatedAt: string; // ISO timestamp
    assumptions: AssumptionData;
    discountRate: number; // Discount rate used for present value
  };
}

// ============================================================================
// Input Types (Enhanced)
// ============================================================================

/**
 * Enhanced assumption data with discount rate
 */
export interface AssumptionData {
  inflationRate: number; // Annual inflation rate (0-0.10)
  useInflationAdjusted: boolean; // Whether to use inflation-adjusted values
  discountRate?: number; // Discount rate for present value (0-0.10, default 0.03)
}

/**
 * Enhanced individual calculation input
 */
export interface EnhancedIndividualInput {
  birthDate: string; // ISO date format
  pia: number; // Primary Insurance Amount
  lifeExpectancy: number; // Expected age at death
  inflationRate: number; // Annual inflation rate
  discountRate?: number; // Discount rate for present value (optional, default 0.03)
}

/**
 * Enhanced couple calculation input
 */
export interface EnhancedCoupleInput {
  spouse1: {
    birthDate: string;
    pia: number;
    lifeExpectancy: number;
  };
  spouse2: {
    birthDate: string;
    pia: number;
    lifeExpectancy: number;
  };
  inflationRate: number;
  discountRate?: number; // Discount rate for present value (optional, default 0.03)
}

// ============================================================================
// Benefit Coordination Types
// ============================================================================

/**
 * Breakdown of benefits showing which benefit type is being paid
 */
export interface BenefitBreakdown {
  retirementBenefit: number; // Own retirement benefit amount
  spousalBenefit: number; // Spousal benefit amount
  survivorBenefit: number; // Survivor benefit amount
  totalBenefit: number; // Total benefit paid (highest of the three)
  benefitType: 'retirement' | 'spousal' | 'survivor'; // Which benefit is being paid
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Feature flags for enhanced optimization
 */
export interface EnhancedOptimizationConfig {
  enableEnhancedOptimization: boolean; // Enable new optimization strategy
  enablePresentValue: boolean; // Enable present value calculations
  enableProjections: boolean; // Enable year-by-year projections
  defaultDiscountRate: number; // Default discount rate (e.g., 0.03)
  alternativeStrategyThreshold: number; // Threshold for alternatives (e.g., 0.02 for 2%)
}

/**
 * Default configuration values
 */
export const DEFAULT_ENHANCED_CONFIG: EnhancedOptimizationConfig = {
  enableEnhancedOptimization: true,
  enablePresentValue: true,
  enableProjections: true,
  defaultDiscountRate: 0.03, // 3%
  alternativeStrategyThreshold: 0.02, // 2%
};
