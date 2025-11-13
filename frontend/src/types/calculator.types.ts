/**
 * TypeScript Type Definitions for Social Security Calculator
 * 
 * Defines all interfaces and types used throughout the application
 * for type safety and consistency.
 * 
 * Includes both legacy types (for backward compatibility) and enhanced types
 * for the new total dollar benefit maximization optimization strategy.
 */

// ============================================================================
// Input Types
// ============================================================================

/**
 * Person data for individual or spouse in couple calculation
 */
export interface PersonData {
  birthDate: string; // ISO 8601 format (YYYY-MM-DD)
  pia: number; // Primary Insurance Amount (monthly benefit at FRA)
  lifeExpectancy: number; // Expected age at death (years)
}

/**
 * Assumption data for calculations
 */
export interface AssumptionData {
  inflationRate: number; // Annual inflation rate (0-0.10)
  useInflationAdjusted: boolean; // Whether to use inflation-adjusted values
  discountRate?: number; // Discount rate for present value (0-0.10, default 0.03)
}

/**
 * Input for individual calculation
 */
export interface IndividualCalculationInput {
  birthDate: string;
  pia: number;
  lifeExpectancy: number;
  inflationRate: number;
}

/**
 * Input for couple calculation
 */
export interface CoupleCalculationInput {
  spouse1: PersonData;
  spouse2: PersonData;
  inflationRate: number;
}

/**
 * Generic calculation input (can be individual or couple)
 */
export interface CalculationInput {
  mode: 'individual' | 'couple';
  individual?: IndividualCalculationInput;
  couple?: CoupleCalculationInput;
  assumptions: AssumptionData;
}

// ============================================================================
// Output Types - Individual
// ============================================================================

/**
 * Strategy for a specific claiming age
 */
export interface Strategy {
  claimingAge: number;
  monthlyBenefit: number;
  lifetimeBenefit: number;
  inflationAdjustedLifetimeBenefit: number;
  adjustmentPercentage: number;
  adjustmentFactor: number;
  description: string;
}

/**
 * Comparison with age 62 claiming strategy
 */
export interface Age62Comparison {
  age62MonthlyBenefit: number;
  age62LifetimeBenefit: number;
  additionalLifetimeBenefit: number;
  percentageIncrease: number;
}

/**
 * Result of individual calculation
 */
export interface IndividualResult {
  optimalAge: number;
  optimalMonthlyBenefit: number;
  optimalLifetimeBenefit: number;
  optimalInflationAdjustedBenefit: number;
  fra: number;
  strategies: Strategy[];
  alternativeStrategies: Strategy[];
  chartData: ChartDataPoint[];
  comparisonWithAge62: Age62Comparison;
}

// ============================================================================
// Output Types - Couple
// ============================================================================

/**
 * Survivor benefit scenario
 */
export interface SurvivorScenario {
  deceasedSpouse: 1 | 2;
  survivorAge: number;
  survivorBenefit: number;
  yearsAsSurvivor: number;
  totalSurvivorBenefit: number;
  inflationAdjustedSurvivorBenefit: number;
}

/**
 * Couple claiming strategy
 */
export interface CoupleStrategy {
  spouse1ClaimingAge: number;
  spouse2ClaimingAge: number;
  spouse1MonthlyBenefit: number;
  spouse2MonthlyBenefit: number;
  spousalBenefitAmount: number;
  combinedMonthlyBenefit: number;
  combinedLifetimeBenefit: number;
  inflationAdjustedCombinedBenefit: number;
  survivorBenefitScenarios: SurvivorScenario[];
  description: string;
}

/**
 * Result of couple calculation
 */
export interface CoupleResult {
  optimalStrategy: CoupleStrategy;
  alternativeStrategies: CoupleStrategy[];
  allStrategies: CoupleStrategy[];
  spouse1Fra: number;
  spouse2Fra: number;
  higherEarnerSpouse: 1 | 2;
}

// ============================================================================
// Chart Data Types
// ============================================================================

/**
 * Cumulative benefit data for a specific year
 */
export interface CumulativeBenefitData {
  year: number;
  age: number;
  cumulativeBenefit: number;
  inflationAdjustedCumulative: number;
}

/**
 * Chart data point for visualization
 */
export interface ChartDataPoint {
  claimingAge: number;
  monthlyBenefit: number;
  lifetimeBenefit: number;
  inflationAdjustedLifetimeBenefit: number;
  cumulativeBenefits: CumulativeBenefitData[];
}

// ============================================================================
// Calculation Result Types
// ============================================================================

/**
 * Generic calculation result (can be individual or couple)
 */
export interface CalculationResult {
  type: 'individual' | 'couple';
  individual?: IndividualResult;
  couple?: CoupleResult;
  metadata: {
    calculatedAt: string;
    assumptions: AssumptionData;
  };
}

// ============================================================================
// Application State Types
// ============================================================================

/**
 * Application state for state management
 */
export interface AppState {
  mode: 'individual' | 'couple';
  inputData: CalculationInput | null;
  results: CalculationResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

// ============================================================================
// Enhanced Types for Total Dollar Benefit Maximization
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
  chartData?: ChartDataPoint[];
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

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for CalculatorForm component
 */
export interface CalculatorFormProps {
  mode: 'individual' | 'couple';
  onCalculate: (data: CalculationInput) => void;
  isLoading: boolean;
  onModeChange: (mode: 'individual' | 'couple') => void;
}

/**
 * Props for ResultsDisplay component
 */
export interface ResultsDisplayProps {
  result: CalculationResult;
  mode: 'individual' | 'couple';
}

/**
 * Props for BenefitsChart component
 */
export interface BenefitsChartProps {
  data: ChartDataPoint[];
  optimalAge: number;
  mode: 'individual' | 'couple';
}

/**
 * Props for AssumptionsPanel component
 */
export interface AssumptionsPanelProps {
  assumptions: AssumptionData;
  onAssumptionsChange: (assumptions: AssumptionData) => void;
  onRecalculate: () => void;
}

/**
 * Props for ErrorMessage component
 */
export interface ErrorMessageProps {
  error: string | ApiError;
  onDismiss?: () => void;
}
