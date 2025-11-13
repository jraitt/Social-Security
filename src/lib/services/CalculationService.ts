/**
 * CalculationService - Core Calculation Orchestration Service
 * 
 * Orchestrates benefit calculations for individuals and married couples.
 * Coordinates SSARulesEngine and ProjectionService to generate comprehensive
 * benefit analysis and recommendations.
 */

import { SSARulesEngine } from './SSARulesEngine';
import { ProjectionService, ChartDataPoint } from './ProjectionService';

// Input Interfaces
export interface IndividualInput {
  birthDate: string; // ISO date format
  pia: number; // Monthly Primary Insurance Amount
  lifeExpectancy: number; // Expected age at death
  inflationRate: number; // Annual inflation rate (e.g., 0.025 for 2.5%)
}

export interface PersonInput {
  birthDate: string; // ISO date format
  pia: number; // Monthly Primary Insurance Amount
  lifeExpectancy: number; // Expected age at death
}

export interface CoupleInput {
  spouse1: PersonInput;
  spouse2: PersonInput;
  inflationRate: number; // Annual inflation rate (e.g., 0.025 for 2.5%)
}

// Output Interfaces
export interface Strategy {
  claimingAge: number;
  monthlyBenefit: number;
  lifetimeBenefit: number;
  inflationAdjustedLifetimeBenefit: number;
  adjustmentPercentage: number;
  adjustmentFactor: number;
  description: string;
}

export interface IndividualResult {
  optimalAge: number;
  optimalMonthlyBenefit: number;
  optimalLifetimeBenefit: number;
  optimalInflationAdjustedBenefit: number;
  fra: number;
  strategies: Strategy[];
  alternativeStrategies: Strategy[];
  chartData: ChartDataPoint[];
  comparisonWithAge62: {
    age62MonthlyBenefit: number;
    age62LifetimeBenefit: number;
    additionalLifetimeBenefit: number;
    percentageIncrease: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Couple-specific Output Interfaces
export interface SurvivorScenario {
  deceasedSpouse: 1 | 2;
  survivorAge: number;
  survivorBenefit: number;
  yearsAsSurvivor: number;
  totalSurvivorBenefit: number;
  inflationAdjustedSurvivorBenefit: number;
}

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

export interface CoupleResult {
  optimalStrategy: CoupleStrategy;
  alternativeStrategies: CoupleStrategy[];
  allStrategies: CoupleStrategy[];
  spouse1Fra: number;
  spouse2Fra: number;
  higherEarnerSpouse: 1 | 2;
}

export class CalculationService {
  private ssaRules: SSARulesEngine;
  private projectionService: ProjectionService;

  constructor() {
    this.ssaRules = new SSARulesEngine();
    this.projectionService = new ProjectionService();
  }

  /**
   * Validate input data for couple calculation
   * 
   * Ensures all required fields are present and within valid ranges for both spouses.
   * 
   * @param input - Couple calculation input
   * @returns Validation result with any error messages
   */
  validateCoupleInput(input: CoupleInput): ValidationResult {
    const errors: string[] = [];

    // Validate spouse1
    if (!input.spouse1) {
      errors.push('Spouse 1 data is required');
    } else {
      const spouse1Validation = this.validatePersonInput(input.spouse1, 'Spouse 1');
      errors.push(...spouse1Validation.errors);
    }

    // Validate spouse2
    if (!input.spouse2) {
      errors.push('Spouse 2 data is required');
    } else {
      const spouse2Validation = this.validatePersonInput(input.spouse2, 'Spouse 2');
      errors.push(...spouse2Validation.errors);
    }

    // Validate inflation rate
    if (input.inflationRate === undefined || input.inflationRate === null) {
      errors.push('Inflation rate is required');
    } else if (input.inflationRate < 0 || input.inflationRate > 0.10) {
      errors.push('Inflation rate must be between 0% and 10% (0 to 0.10)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate input data for a single person
   * 
   * Helper method to validate person data for couple calculations.
   * 
   * @param person - Person input data
   * @param label - Label for error messages (e.g., "Spouse 1")
   * @returns Validation result with any error messages
   */
  private validatePersonInput(person: PersonInput, label: string): ValidationResult {
    const errors: string[] = [];

    // Validate birthDate
    if (!person.birthDate) {
      errors.push(`${label} birth date is required`);
    } else {
      const birthDate = new Date(person.birthDate);
      if (isNaN(birthDate.getTime())) {
        errors.push(`${label} birth date format is invalid. Use ISO date format (YYYY-MM-DD)`);
      } else {
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const age = currentYear - birthYear;
        
        if (age < 50 || age > 70) {
          errors.push(`${label} age must be between 50 and 70 years`);
        }
      }
    }

    // Validate PIA
    if (person.pia === undefined || person.pia === null) {
      errors.push(`${label} PIA (Primary Insurance Amount) is required`);
    } else if (person.pia < 1 || person.pia > 5000) {
      errors.push(`${label} PIA must be between $1 and $5,000 per month`);
    }

    // Validate life expectancy
    if (person.lifeExpectancy === undefined || person.lifeExpectancy === null) {
      errors.push(`${label} life expectancy is required`);
    } else if (person.lifeExpectancy < 70 || person.lifeExpectancy > 100) {
      errors.push(`${label} life expectancy must be between 70 and 100 years`);
    }

    // Cross-validation: life expectancy should be greater than current age
    if (person.birthDate && person.lifeExpectancy) {
      const birthDate = new Date(person.birthDate);
      if (!isNaN(birthDate.getTime())) {
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const currentAge = currentYear - birthYear;
        
        if (person.lifeExpectancy <= currentAge) {
          errors.push(`${label} life expectancy must be greater than current age`);
        }
        
        if (person.lifeExpectancy < 62) {
          errors.push(`${label} life expectancy must be at least 62 to claim Social Security benefits`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate input data for individual calculation
   * 
   * Ensures all required fields are present and within valid ranges.
   * 
   * @param input - Individual calculation input
   * @returns Validation result with any error messages
   */
  validateInput(input: IndividualInput): ValidationResult {
    const errors: string[] = [];

    // Validate birthDate
    if (!input.birthDate) {
      errors.push('Birth date is required');
    } else {
      const birthDate = new Date(input.birthDate);
      if (isNaN(birthDate.getTime())) {
        errors.push('Invalid birth date format. Use ISO date format (YYYY-MM-DD)');
      } else {
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const age = currentYear - birthYear;
        
        if (age < 50 || age > 70) {
          errors.push('Age must be between 50 and 70 years');
        }
      }
    }

    // Validate PIA
    if (input.pia === undefined || input.pia === null) {
      errors.push('PIA (Primary Insurance Amount) is required');
    } else if (input.pia < 1 || input.pia > 5000) {
      errors.push('PIA must be between $1 and $5,000 per month');
    }

    // Validate life expectancy
    if (input.lifeExpectancy === undefined || input.lifeExpectancy === null) {
      errors.push('Life expectancy is required');
    } else if (input.lifeExpectancy < 70 || input.lifeExpectancy > 100) {
      errors.push('Life expectancy must be between 70 and 100 years');
    }

    // Validate inflation rate
    if (input.inflationRate === undefined || input.inflationRate === null) {
      errors.push('Inflation rate is required');
    } else if (input.inflationRate < 0 || input.inflationRate > 0.10) {
      errors.push('Inflation rate must be between 0% and 10% (0 to 0.10)');
    }

    // Cross-validation: life expectancy should be greater than current age
    if (input.birthDate && input.lifeExpectancy) {
      const birthDate = new Date(input.birthDate);
      if (!isNaN(birthDate.getTime())) {
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const currentAge = currentYear - birthYear;
        
        if (input.lifeExpectancy <= currentAge) {
          errors.push('Life expectancy must be greater than current age');
        }
        
        if (input.lifeExpectancy < 62) {
          errors.push('Life expectancy must be at least 62 to claim Social Security benefits');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate optimal claiming strategy for an individual
   * 
   * Analyzes all possible claiming ages (62-70) and determines the optimal
   * strategy based on maximum lifetime benefits. Generates comprehensive
   * comparison data and chart data for visualization.
   * 
   * @param input - Individual calculation input
   * @returns Calculation result with optimal strategy and alternatives
   */
  calculateIndividual(input: IndividualInput): IndividualResult {
    // Validate input
    const validation = this.validateInput(input);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    // Extract birth year and calculate FRA
    const birthDate = new Date(input.birthDate);
    const birthYear = birthDate.getFullYear();
    const fra = this.ssaRules.calculateFRA(birthYear);

    // Generate chart data for all claiming ages (62-70)
    const chartData = this.projectionService.generateChartData(
      input.pia,
      fra,
      input.lifeExpectancy,
      input.inflationRate,
      (pia, claimingAge, fra) => this.ssaRules.getMonthlyBenefit(pia, claimingAge, fra)
    );

    // Calculate benefits for each claiming age and create strategies
    const strategies: Strategy[] = [];
    
    for (let claimingAge = 62; claimingAge <= 70; claimingAge++) {
      const monthlyBenefit = this.ssaRules.getMonthlyBenefit(input.pia, claimingAge, fra);
      const adjustmentFactor = this.ssaRules.getAdjustmentFactor(claimingAge, fra);
      const adjustmentPercentage = (adjustmentFactor - 1) * 100;
      
      const projection = this.projectionService.projectLifetimeBenefits(
        monthlyBenefit,
        claimingAge,
        input.lifeExpectancy,
        input.inflationRate
      );

      const description = this.generateStrategyDescription(
        claimingAge,
        fra,
        monthlyBenefit,
        adjustmentPercentage
      );

      strategies.push({
        claimingAge,
        monthlyBenefit,
        lifetimeBenefit: projection.totalLifetimeBenefit,
        inflationAdjustedLifetimeBenefit: projection.inflationAdjustedBenefit,
        adjustmentPercentage,
        adjustmentFactor,
        description,
      });
    }

    // Determine optimal claiming age based on maximum lifetime benefits
    // Use inflation-adjusted benefits if inflation rate is provided
    const useInflationAdjusted = input.inflationRate > 0;
    const optimalAge = this.projectionService.findOptimalClaimingAge(chartData, useInflationAdjusted);
    
    const optimalStrategy = strategies.find(s => s.claimingAge === optimalAge);
    if (!optimalStrategy) {
      throw new Error('Failed to determine optimal strategy');
    }

    // Calculate comparison with age 62 claiming
    const age62Strategy = strategies.find(s => s.claimingAge === 62);
    if (!age62Strategy) {
      throw new Error('Failed to calculate age 62 strategy');
    }

    const comparisonBenefit = useInflationAdjusted 
      ? optimalStrategy.inflationAdjustedLifetimeBenefit 
      : optimalStrategy.lifetimeBenefit;
    
    const age62Benefit = useInflationAdjusted 
      ? age62Strategy.inflationAdjustedLifetimeBenefit 
      : age62Strategy.lifetimeBenefit;

    const additionalLifetimeBenefit = comparisonBenefit - age62Benefit;
    const percentageIncrease = (additionalLifetimeBenefit / age62Benefit) * 100;

    // Sort strategies by lifetime benefit (descending) to show best alternatives
    const sortedStrategies = [...strategies].sort((a, b) => {
      const benefitA = useInflationAdjusted ? a.inflationAdjustedLifetimeBenefit : a.lifetimeBenefit;
      const benefitB = useInflationAdjusted ? b.inflationAdjustedLifetimeBenefit : b.lifetimeBenefit;
      return benefitB - benefitA;
    });

    // Filter alternative strategies within 2% of optimal
    const optimalBenefit = useInflationAdjusted 
      ? optimalStrategy.inflationAdjustedLifetimeBenefit 
      : optimalStrategy.lifetimeBenefit;
    
    const alternativeStrategies = sortedStrategies.filter(s => {
      const benefit = useInflationAdjusted ? s.inflationAdjustedLifetimeBenefit : s.lifetimeBenefit;
      const percentDifference = Math.abs((benefit - optimalBenefit) / optimalBenefit) * 100;
      return percentDifference <= 2 && s.claimingAge !== optimalAge;
    });

    return {
      optimalAge,
      optimalMonthlyBenefit: optimalStrategy.monthlyBenefit,
      optimalLifetimeBenefit: optimalStrategy.lifetimeBenefit,
      optimalInflationAdjustedBenefit: optimalStrategy.inflationAdjustedLifetimeBenefit,
      fra,
      strategies: sortedStrategies,
      alternativeStrategies,
      chartData,
      comparisonWithAge62: {
        age62MonthlyBenefit: age62Strategy.monthlyBenefit,
        age62LifetimeBenefit: useInflationAdjusted 
          ? age62Strategy.inflationAdjustedLifetimeBenefit 
          : age62Strategy.lifetimeBenefit,
        additionalLifetimeBenefit,
        percentageIncrease,
      },
    };
  }

  /**
   * Generate human-readable description for a claiming strategy
   * 
   * Creates explanatory text describing the strategy and its implications.
   * 
   * @param claimingAge - Age when claiming benefits
   * @param fra - Full Retirement Age
   * @param monthlyBenefit - Monthly benefit amount
   * @param adjustmentPercentage - Percentage adjustment from PIA
   * @returns Description string
   */
  private generateStrategyDescription(
    claimingAge: number,
    fra: number,
    monthlyBenefit: number,
    adjustmentPercentage: number
  ): string {
    const formattedBenefit = monthlyBenefit.toFixed(2);
    const formattedAdjustment = Math.abs(adjustmentPercentage).toFixed(1);

    if (claimingAge === fra) {
      return `Claim at Full Retirement Age (${fra}). Receive $${formattedBenefit}/month with no reduction or increase.`;
    } else if (claimingAge < fra) {
      const monthsEarly = Math.round((fra - claimingAge) * 12);
      const yearsEarly = Math.floor(monthsEarly / 12);
      const remainingMonths = monthsEarly % 12;
      const timeDescription = yearsEarly > 0 
        ? `${yearsEarly} year${yearsEarly > 1 ? 's' : ''}${remainingMonths > 0 ? ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
        : `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      
      return `Claim ${timeDescription} before Full Retirement Age. Receive $${formattedBenefit}/month with a ${formattedAdjustment}% reduction.`;
    } else {
      const monthsLate = Math.round((claimingAge - fra) * 12);
      const yearsLate = Math.floor(monthsLate / 12);
      const remainingMonths = monthsLate % 12;
      const timeDescription = yearsLate > 0 
        ? `${yearsLate} year${yearsLate > 1 ? 's' : ''}${remainingMonths > 0 ? ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
        : `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      
      return `Delay claiming ${timeDescription} after Full Retirement Age. Receive $${formattedBenefit}/month with a ${formattedAdjustment}% increase from delayed retirement credits.`;
    }
  }

  /**
   * Calculate optimal claiming strategy for a married couple
   * 
   * Analyzes all possible claiming age combinations for both spouses (62-70 each),
   * calculates spousal benefits, survivor benefits, and determines the optimal
   * coordinated strategy that maximizes total household lifetime benefits.
   * 
   * @param input - Couple calculation input
   * @returns Calculation result with optimal strategy and alternatives
   */
  calculateCouple(input: CoupleInput): CoupleResult {
    // Validate input
    const validation = this.validateCoupleInput(input);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    // Extract birth years and calculate FRAs for both spouses
    const spouse1BirthDate = new Date(input.spouse1.birthDate);
    const spouse2BirthDate = new Date(input.spouse2.birthDate);
    const spouse1BirthYear = spouse1BirthDate.getFullYear();
    const spouse2BirthYear = spouse2BirthDate.getFullYear();
    const spouse1Fra = this.ssaRules.calculateFRA(spouse1BirthYear);
    const spouse2Fra = this.ssaRules.calculateFRA(spouse2BirthYear);

    // Determine higher earner
    const higherEarnerSpouse: 1 | 2 = input.spouse1.pia >= input.spouse2.pia ? 1 : 2;
    const higherPIA = Math.max(input.spouse1.pia, input.spouse2.pia);

    // Generate all possible claiming age combinations
    const allStrategies: CoupleStrategy[] = [];

    for (let spouse1Age = 62; spouse1Age <= 70; spouse1Age++) {
      for (let spouse2Age = 62; spouse2Age <= 70; spouse2Age++) {
        const strategy = this.calculateCoupleStrategy(
          input,
          spouse1Age,
          spouse2Age,
          spouse1Fra,
          spouse2Fra,
          higherPIA
        );
        allStrategies.push(strategy);
      }
    }

    // Determine optimal strategy based on maximum combined lifetime benefits
    const useInflationAdjusted = input.inflationRate > 0;
    const sortedStrategies = [...allStrategies].sort((a, b) => {
      const benefitA = useInflationAdjusted 
        ? a.inflationAdjustedCombinedBenefit 
        : a.combinedLifetimeBenefit;
      const benefitB = useInflationAdjusted 
        ? b.inflationAdjustedCombinedBenefit 
        : b.combinedLifetimeBenefit;
      return benefitB - benefitA;
    });

    const optimalStrategy = sortedStrategies[0];

    // Filter alternative strategies within 2% of optimal
    const optimalBenefit = useInflationAdjusted 
      ? optimalStrategy.inflationAdjustedCombinedBenefit 
      : optimalStrategy.combinedLifetimeBenefit;

    const alternativeStrategies = sortedStrategies.filter(s => {
      const benefit = useInflationAdjusted 
        ? s.inflationAdjustedCombinedBenefit 
        : s.combinedLifetimeBenefit;
      const percentDifference = Math.abs((benefit - optimalBenefit) / optimalBenefit) * 100;
      return percentDifference <= 2 && 
             (s.spouse1ClaimingAge !== optimalStrategy.spouse1ClaimingAge || 
              s.spouse2ClaimingAge !== optimalStrategy.spouse2ClaimingAge);
    });

    return {
      optimalStrategy,
      alternativeStrategies,
      allStrategies: sortedStrategies,
      spouse1Fra,
      spouse2Fra,
      higherEarnerSpouse,
    };
  }

  /**
   * Calculate a specific couple claiming strategy
   * 
   * Calculates individual benefits, spousal benefits, and survivor scenarios
   * for a specific combination of claiming ages.
   * 
   * @param input - Couple calculation input
   * @param spouse1Age - Spouse 1 claiming age
   * @param spouse2Age - Spouse 2 claiming age
   * @param spouse1Fra - Spouse 1 Full Retirement Age
   * @param spouse2Fra - Spouse 2 Full Retirement Age
   * @param higherPIA - Higher PIA between both spouses
   * @returns Complete couple strategy with all benefit calculations
   */
  private calculateCoupleStrategy(
    input: CoupleInput,
    spouse1Age: number,
    spouse2Age: number,
    spouse1Fra: number,
    spouse2Fra: number,
    higherPIA: number
  ): CoupleStrategy {
    // Calculate individual benefits for both spouses
    const spouse1MonthlyBenefit = this.ssaRules.getMonthlyBenefit(
      input.spouse1.pia,
      spouse1Age,
      spouse1Fra
    );

    const spouse2MonthlyBenefit = this.ssaRules.getMonthlyBenefit(
      input.spouse2.pia,
      spouse2Age,
      spouse2Fra
    );

    // Calculate spousal benefit (50% of higher earner's PIA at FRA, reduced if claimed early)
    // Spousal benefit is the difference between 50% of higher PIA and own benefit
    const spouse1SpousalBenefit = this.calculateSpousalBenefitAmount(
      input.spouse1.pia,
      higherPIA,
      spouse1Age,
      spouse1Fra
    );

    const spouse2SpousalBenefit = this.calculateSpousalBenefitAmount(
      input.spouse2.pia,
      higherPIA,
      spouse2Age,
      spouse2Fra
    );

    // Total spousal benefit amount (only one spouse typically receives spousal benefits)
    const spousalBenefitAmount = Math.max(spouse1SpousalBenefit, spouse2SpousalBenefit);

    // Combined monthly benefit
    const combinedMonthlyBenefit = spouse1MonthlyBenefit + spouse2MonthlyBenefit + spousalBenefitAmount;

    // Calculate lifetime benefits for both spouses while both are alive
    const spouse1Projection = this.projectionService.projectLifetimeBenefits(
      spouse1MonthlyBenefit,
      spouse1Age,
      input.spouse1.lifeExpectancy,
      input.inflationRate
    );

    const spouse2Projection = this.projectionService.projectLifetimeBenefits(
      spouse2MonthlyBenefit,
      spouse2Age,
      input.spouse2.lifeExpectancy,
      input.inflationRate
    );

    // Calculate spousal benefit lifetime value
    const spousalBenefitLifetime = this.calculateSpousalBenefitLifetime(
      spousalBenefitAmount,
      Math.max(spouse1Age, spouse2Age), // Spousal benefits start when both have claimed
      Math.min(input.spouse1.lifeExpectancy, input.spouse2.lifeExpectancy), // Ends when first spouse dies
      input.inflationRate
    );

    // Calculate survivor benefit scenarios
    const survivorScenarios = this.calculateSurvivorScenarios(
      input,
      spouse1Age,
      spouse2Age,
      spouse1MonthlyBenefit,
      spouse2MonthlyBenefit
    );

    // Total combined lifetime benefit including survivor benefits
    const combinedLifetimeBenefit = 
      spouse1Projection.totalLifetimeBenefit +
      spouse2Projection.totalLifetimeBenefit +
      spousalBenefitLifetime.totalBenefit +
      survivorScenarios.reduce((sum, scenario) => sum + scenario.totalSurvivorBenefit, 0);

    const inflationAdjustedCombinedBenefit = 
      spouse1Projection.inflationAdjustedBenefit +
      spouse2Projection.inflationAdjustedBenefit +
      spousalBenefitLifetime.inflationAdjustedBenefit +
      survivorScenarios.reduce((sum, scenario) => sum + scenario.inflationAdjustedSurvivorBenefit, 0);

    // Generate description
    const description = this.generateCoupleStrategyDescription(
      spouse1Age,
      spouse2Age,
      spouse1Fra,
      spouse2Fra,
      combinedMonthlyBenefit,
      spousalBenefitAmount
    );

    return {
      spouse1ClaimingAge: spouse1Age,
      spouse2ClaimingAge: spouse2Age,
      spouse1MonthlyBenefit,
      spouse2MonthlyBenefit,
      spousalBenefitAmount,
      combinedMonthlyBenefit,
      combinedLifetimeBenefit,
      inflationAdjustedCombinedBenefit,
      survivorBenefitScenarios: survivorScenarios,
      description,
    };
  }

  /**
   * Calculate spousal benefit amount for a spouse
   * 
   * Spousal benefit is 50% of higher earner's PIA at FRA, reduced if claimed early.
   * Only applies if it's higher than the spouse's own benefit.
   * 
   * @param ownPIA - Spouse's own PIA
   * @param higherPIA - Higher earner's PIA
   * @param claimingAge - Age when claiming
   * @param fra - Full Retirement Age
   * @returns Spousal benefit amount (0 if own benefit is higher)
   */
  private calculateSpousalBenefitAmount(
    ownPIA: number,
    higherPIA: number,
    claimingAge: number,
    fra: number
  ): number {
    // Spousal benefit at FRA is 50% of higher earner's PIA
    const spousalBenefitAtFRA = higherPIA * 0.5;

    // If own PIA is higher than spousal benefit, no spousal benefit
    if (ownPIA >= spousalBenefitAtFRA) {
      return 0;
    }

    // Apply early claiming reduction if claiming before FRA
    let spousalBenefit = spousalBenefitAtFRA;
    if (claimingAge < fra) {
      const reductionPercentage = this.ssaRules.calculateEarlyReductionPercentage(claimingAge, fra);
      spousalBenefit = spousalBenefitAtFRA * (1 - reductionPercentage);
    }

    // Return the difference between spousal benefit and own benefit
    const ownBenefit = this.ssaRules.getMonthlyBenefit(ownPIA, claimingAge, fra);
    return Math.max(0, spousalBenefit - ownBenefit);
  }

  /**
   * Calculate lifetime value of spousal benefits
   * 
   * @param monthlyAmount - Monthly spousal benefit amount
   * @param startAge - Age when spousal benefits start
   * @param endAge - Age when spousal benefits end (first spouse dies)
   * @param inflationRate - Annual inflation rate
   * @returns Lifetime spousal benefit projection
   */
  private calculateSpousalBenefitLifetime(
    monthlyAmount: number,
    startAge: number,
    endAge: number,
    inflationRate: number
  ): { totalBenefit: number; inflationAdjustedBenefit: number } {
    if (monthlyAmount === 0 || endAge <= startAge) {
      return { totalBenefit: 0, inflationAdjustedBenefit: 0 };
    }

    const projection = this.projectionService.projectLifetimeBenefits(
      monthlyAmount,
      startAge,
      endAge,
      inflationRate
    );

    return {
      totalBenefit: projection.totalLifetimeBenefit,
      inflationAdjustedBenefit: projection.inflationAdjustedBenefit
    };
  }

  /**
   * Calculate survivor benefit scenarios for both spouses
   * 
   * Calculates benefits for scenarios where each spouse dies first,
   * and the surviving spouse receives survivor benefits.
   * 
   * @param input - Couple calculation input
   * @param spouse1Age - Spouse 1 claiming age
   * @param spouse2Age - Spouse 2 claiming age
   * @param spouse1Benefit - Spouse 1 monthly benefit
   * @param spouse2Benefit - Spouse 2 monthly benefit
   * @returns Array of survivor scenarios
   */
  private calculateSurvivorScenarios(
    input: CoupleInput,
    _spouse1Age: number,
    _spouse2Age: number,
    spouse1Benefit: number,
    spouse2Benefit: number
  ): SurvivorScenario[] {
    const scenarios: SurvivorScenario[] = [];

    // Scenario 1: Spouse 1 dies first, Spouse 2 survives
    if (input.spouse2.lifeExpectancy > input.spouse1.lifeExpectancy) {
      const survivorBenefit = Math.max(spouse1Benefit, spouse2Benefit); // Survivor gets higher benefit
      const survivorAge = input.spouse1.lifeExpectancy;
      const yearsAsSurvivor = input.spouse2.lifeExpectancy - input.spouse1.lifeExpectancy;

      const survivorProjection = this.projectionService.projectLifetimeBenefits(
        survivorBenefit,
        survivorAge,
        input.spouse2.lifeExpectancy,
        input.inflationRate
      );

      scenarios.push({
        deceasedSpouse: 1,
        survivorAge,
        survivorBenefit,
        yearsAsSurvivor,
        totalSurvivorBenefit: survivorProjection.totalLifetimeBenefit,
        inflationAdjustedSurvivorBenefit: survivorProjection.inflationAdjustedBenefit,
      });
    }

    // Scenario 2: Spouse 2 dies first, Spouse 1 survives
    if (input.spouse1.lifeExpectancy > input.spouse2.lifeExpectancy) {
      const survivorBenefit = Math.max(spouse1Benefit, spouse2Benefit); // Survivor gets higher benefit
      const survivorAge = input.spouse2.lifeExpectancy;
      const yearsAsSurvivor = input.spouse1.lifeExpectancy - input.spouse2.lifeExpectancy;

      const survivorProjection = this.projectionService.projectLifetimeBenefits(
        survivorBenefit,
        survivorAge,
        input.spouse1.lifeExpectancy,
        input.inflationRate
      );

      scenarios.push({
        deceasedSpouse: 2,
        survivorAge,
        survivorBenefit,
        yearsAsSurvivor,
        totalSurvivorBenefit: survivorProjection.totalLifetimeBenefit,
        inflationAdjustedSurvivorBenefit: survivorProjection.inflationAdjustedBenefit,
      });
    }

    return scenarios;
  }

  /**
   * Generate human-readable description for a couple claiming strategy
   * 
   * @param spouse1Age - Spouse 1 claiming age
   * @param spouse2Age - Spouse 2 claiming age
   * @param spouse1Fra - Spouse 1 FRA
   * @param spouse2Fra - Spouse 2 FRA
   * @param combinedMonthly - Combined monthly benefit
   * @param spousalAmount - Spousal benefit amount
   * @returns Description string
   */
  private generateCoupleStrategyDescription(
    spouse1Age: number,
    spouse2Age: number,
    spouse1Fra: number,
    spouse2Fra: number,
    combinedMonthly: number,
    spousalAmount: number
  ): string {
    const formattedCombined = combinedMonthly.toFixed(2);
    
    let description = `Spouse 1 claims at ${spouse1Age}, Spouse 2 claims at ${spouse2Age}. `;
    
    if (spouse1Age === spouse1Fra && spouse2Age === spouse2Fra) {
      description += `Both claim at their Full Retirement Age. `;
    } else if (spouse1Age < spouse1Fra && spouse2Age < spouse2Fra) {
      description += `Both claim early with reduced benefits. `;
    } else if (spouse1Age > spouse1Fra && spouse2Age > spouse2Fra) {
      description += `Both delay claiming for increased benefits. `;
    } else {
      description += `Coordinated strategy with different claiming ages. `;
    }

    if (spousalAmount > 0) {
      description += `Includes $${spousalAmount.toFixed(2)}/month spousal benefit. `;
    }

    description += `Combined monthly benefit: $${formattedCombined}.`;

    return description;
  }
}

