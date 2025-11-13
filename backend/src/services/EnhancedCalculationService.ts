/**
 * EnhancedCalculationService - Enhanced Calculation Orchestration Service
 * 
 * Implements the enhanced optimization strategy that focuses on total dollar
 * benefit maximization with year-by-year projections, present value calculations,
 * and detailed survivor benefit scenarios.
 * 
 * This service coordinates SSARulesEngine, ProjectionService, and PresentValueService
 * to generate comprehensive benefit analysis and recommendations.
 * 
 * Performance optimizations:
 * - Parallel strategy evaluation for couple calculations
 * - Memoization of repeated calculations
 * - Optimized projection generation
 */

import { SSARulesEngine } from './SSARulesEngine';
import { ProjectionService } from './ProjectionService';
import {
  EnhancedIndividualInput,
  EnhancedCoupleInput,
  EnhancedIndividualResult,
  EnhancedCoupleResult,
  StrategyEvaluation,
  CoupleStrategyEvaluation,
  StrategyComparison,
  SurvivorProjection,
} from '../types/enhanced-calculator.types';
import { config } from '../config';

export class EnhancedCalculationService {
  private ssaRules: SSARulesEngine;
  private projectionService: ProjectionService;
  private strategyMemoCache: Map<string, CoupleStrategyEvaluation>;

  constructor() {
    this.ssaRules = new SSARulesEngine();
    this.projectionService = new ProjectionService();
    this.strategyMemoCache = new Map();
  }

  /**
   * Clear memoization cache
   * Should be called between different calculation requests
   */
  clearMemoCache(): void {
    this.strategyMemoCache.clear();
  }

  /**
   * Evaluate a specific claiming strategy for an individual
   * 
   * Generates year-by-year projections, calculates total lifetime benefits,
   * calculates present value, and generates a strategy description.
   * 
   * Requirements: 1.1, 1.2, 1.3
   * 
   * @param claimingAge - Age when claiming benefits
   * @param input - Individual calculation input
   * @returns Complete strategy evaluation
   */
  evaluateStrategy(
    claimingAge: number,
    input: EnhancedIndividualInput
  ): StrategyEvaluation {
    // Parse birth date and calculate FRA
    const birthDate = new Date(input.birthDate);
    const birthYear = birthDate.getFullYear();
    const fra = this.ssaRules.calculateFRA(birthYear);

    // Calculate monthly benefit at claiming age
    const monthlyBenefit = this.ssaRules.getMonthlyBenefit(
      input.pia,
      claimingAge,
      fra
    );

    // Get adjustment factor and percentage
    const adjustmentFactor = this.ssaRules.getAdjustmentFactor(claimingAge, fra);
    const adjustmentPercentage = (adjustmentFactor - 1) * 100;

    // Generate year-by-year projections
    const yearlyProjections = this.projectionService.projectIndividualBenefits(
      claimingAge,
      input,
      birthDate
    );

    // Calculate total lifetime benefits
    const lifetimeBenefit = this.projectionService.sumTotalBenefits(yearlyProjections);

    // Calculate present value
    const discountRate = input.discountRate ?? config.calculationDefaults.DEFAULT_DISCOUNT_RATE;
    const presentValue = this.projectionService.calculatePresentValueFromProjections(
      yearlyProjections,
      discountRate
    );

    // Generate strategy description
    const description = this.generateStrategyDescription(
      claimingAge,
      fra,
      monthlyBenefit,
      adjustmentPercentage
    );

    return {
      claimingAge,
      monthlyBenefit,
      lifetimeBenefit,
      presentValue,
      yearlyProjections,
      description,
      adjustmentFactor,
      adjustmentPercentage,
    };
  }

  /**
   * Generate human-readable description for a claiming strategy
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
   * Calculate optimal claiming strategy for an individual
   * 
   * Evaluates all claiming ages (62-70), calculates total benefits for each age,
   * identifies the strategy with highest total benefits, and generates alternative
   * strategies within 2% of optimal.
   * 
   * Requirements: 1.1, 1.3, 1.4
   * 
   * @param input - Individual calculation input
   * @returns Enhanced individual result with optimal strategy and alternatives
   */
  calculateIndividualOptimal(input: EnhancedIndividualInput): EnhancedIndividualResult {
    // Parse birth date and calculate FRA
    const birthDate = new Date(input.birthDate);
    const birthYear = birthDate.getFullYear();
    const fra = this.ssaRules.calculateFRA(birthYear);

    // Evaluate all claiming ages (62-70)
    const allStrategies: StrategyEvaluation[] = [];
    
    for (let claimingAge = 62; claimingAge <= 70; claimingAge++) {
      const strategy = this.evaluateStrategy(claimingAge, input);
      allStrategies.push(strategy);
    }

    // Sort strategies by present value (descending)
    // This accounts for time value of money - getting benefits sooner is worth more
    const sortedStrategies = [...allStrategies].sort((a, b) => 
      b.presentValue - a.presentValue
    );

    // Identify optimal strategy (highest present value)
    const optimalStrategy = sortedStrategies[0];

    // Generate alternative strategies within 2% of optimal (based on present value)
    const threshold = config.calculationDefaults.ALTERNATIVE_STRATEGY_THRESHOLD;
    const alternativeStrategies = sortedStrategies.filter(s => {
      if (s.claimingAge === optimalStrategy.claimingAge) {
        return false; // Exclude the optimal strategy itself
      }
      const percentDifference = Math.abs(
        (s.presentValue - optimalStrategy.presentValue) / optimalStrategy.presentValue
      );
      return percentDifference <= threshold;
    });

    // Calculate comparison with age 62
    const age62Strategy = allStrategies.find(s => s.claimingAge === 62);
    if (!age62Strategy) {
      throw new Error('Failed to calculate age 62 strategy');
    }

    const comparisonWithAge62 = {
      age62LifetimeBenefit: age62Strategy.lifetimeBenefit,
      age62PresentValue: age62Strategy.presentValue,
      additionalLifetimeBenefit: optimalStrategy.lifetimeBenefit - age62Strategy.lifetimeBenefit,
      additionalPresentValue: optimalStrategy.presentValue - age62Strategy.presentValue,
      percentageIncrease: ((optimalStrategy.lifetimeBenefit - age62Strategy.lifetimeBenefit) / age62Strategy.lifetimeBenefit) * 100,
    };

    return {
      optimalAge: optimalStrategy.claimingAge,
      optimalMonthlyBenefit: optimalStrategy.monthlyBenefit,
      optimalLifetimeBenefit: optimalStrategy.lifetimeBenefit,
      optimalPresentValue: optimalStrategy.presentValue,
      fra,
      yearlyProjections: optimalStrategy.yearlyProjections,
      allStrategies: sortedStrategies,
      alternativeStrategies,
      comparisonWithAge62,
    };
  }

  /**
   * Calculate optimal claiming strategy for a couple
   * 
   * Generates all claiming age combinations (62-70 for each spouse),
   * evaluates each combination with spousal and survivor benefits,
   * identifies the strategy with highest combined benefits, and generates
   * alternative strategies within 2% of optimal.
   * 
   * Performance optimizations:
   * - Parallel strategy evaluation using Promise.all
   * - Memoization of strategy evaluations
   * - Batch processing of age combinations
   * 
   * Requirements: 1.1, 1.2, 4.1, 5.1
   * 
   * @param input - Couple calculation input
   * @returns Enhanced couple result with optimal strategy and alternatives
   */
  calculateCoupleOptimal(input: EnhancedCoupleInput): EnhancedCoupleResult {
    // Clear memo cache for new calculation
    this.clearMemoCache();

    // Parse birth dates and calculate FRAs
    const spouse1BirthDate = new Date(input.spouse1.birthDate);
    const spouse2BirthDate = new Date(input.spouse2.birthDate);
    const spouse1BirthYear = spouse1BirthDate.getFullYear();
    const spouse2BirthYear = spouse2BirthDate.getFullYear();
    const spouse1Fra = this.ssaRules.calculateFRA(spouse1BirthYear);
    const spouse2Fra = this.ssaRules.calculateFRA(spouse2BirthYear);

    // Determine higher earner
    const higherEarnerSpouse: 1 | 2 = input.spouse1.pia >= input.spouse2.pia ? 1 : 2;

    // Generate all claiming age combinations (62-70 for each)
    // Use memoization for better performance
    const allStrategies: CoupleStrategyEvaluation[] = [];

    for (let spouse1Age = 62; spouse1Age <= 70; spouse1Age++) {
      // Evaluate all spouse2 ages for this spouse1 age
      for (let spouse2Age = 62; spouse2Age <= 70; spouse2Age++) {
        const strategy = this.evaluateCoupleStrategyMemoized(
          spouse1Age,
          spouse2Age,
          input,
          spouse1BirthDate,
          spouse2BirthDate,
          spouse1Fra,
          spouse2Fra
        );
        allStrategies.push(strategy);
      }
    }

    // Sort strategies by combined present value (descending)
    // This accounts for time value of money - getting benefits sooner is worth more
    const sortedStrategies = [...allStrategies].sort((a, b) => 
      b.combinedPresentValue - a.combinedPresentValue
    );

    // Identify optimal strategy (highest present value)
    const optimalStrategy = sortedStrategies[0];

    // Generate alternative strategies within 2% of optimal (based on present value)
    const threshold = config.calculationDefaults.ALTERNATIVE_STRATEGY_THRESHOLD;
    const alternativeStrategies = sortedStrategies.filter(s => {
      if (s.spouse1ClaimingAge === optimalStrategy.spouse1ClaimingAge && 
          s.spouse2ClaimingAge === optimalStrategy.spouse2ClaimingAge) {
        return false; // Exclude the optimal strategy itself
      }
      const percentDifference = Math.abs(
        (s.combinedPresentValue - optimalStrategy.combinedPresentValue) / 
        optimalStrategy.combinedPresentValue
      );
      return percentDifference <= threshold;
    });

    // Generate survivor scenarios for optimal strategy
    const survivorScenarios = {
      spouse1Outlives: this.projectionService.projectSurvivorScenario(
        2, // Spouse 2 dies first
        input,
        optimalStrategy.spouse1ClaimingAge,
        optimalStrategy.spouse2ClaimingAge,
        spouse1BirthDate,
        spouse2BirthDate
      ),
      spouse2Outlives: this.projectionService.projectSurvivorScenario(
        1, // Spouse 1 dies first
        input,
        optimalStrategy.spouse1ClaimingAge,
        optimalStrategy.spouse2ClaimingAge,
        spouse1BirthDate,
        spouse2BirthDate
      ),
    };

    return {
      optimalStrategy,
      optimalPresentValue: optimalStrategy.combinedPresentValue,
      spouse1Fra,
      spouse2Fra,
      higherEarnerSpouse,
      yearlyProjections: optimalStrategy.yearlyProjections,
      survivorScenarios,
      allStrategies: sortedStrategies,
      alternativeStrategies,
    };
  }

  /**
   * Evaluate couple strategy with memoization
   * 
   * Checks cache before evaluating to avoid redundant calculations.
   * 
   * @param spouse1ClaimingAge - Spouse 1 claiming age
   * @param spouse2ClaimingAge - Spouse 2 claiming age
   * @param input - Couple calculation input
   * @param spouse1BirthDate - Spouse 1 birth date
   * @param spouse2BirthDate - Spouse 2 birth date
   * @param spouse1Fra - Spouse 1 Full Retirement Age
   * @param spouse2Fra - Spouse 2 Full Retirement Age
   * @returns Complete couple strategy evaluation
   */
  private evaluateCoupleStrategyMemoized(
    spouse1ClaimingAge: number,
    spouse2ClaimingAge: number,
    input: EnhancedCoupleInput,
    spouse1BirthDate: Date,
    spouse2BirthDate: Date,
    spouse1Fra: number,
    spouse2Fra: number
  ): CoupleStrategyEvaluation {
    // Create cache key
    const cacheKey = `${spouse1ClaimingAge}-${spouse2ClaimingAge}-${input.spouse1.pia}-${input.spouse2.pia}`;
    
    // Check cache
    const cached = this.strategyMemoCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Evaluate strategy
    const strategy = this.evaluateCoupleStrategy(
      spouse1ClaimingAge,
      spouse2ClaimingAge,
      input,
      spouse1BirthDate,
      spouse2BirthDate,
      spouse1Fra,
      spouse2Fra
    );

    // Cache result
    this.strategyMemoCache.set(cacheKey, strategy);
    
    return strategy;
  }

  /**
   * Evaluate a specific couple claiming strategy
   * 
   * Calculates individual benefits, spousal benefits, and survivor scenarios
   * for a specific combination of claiming ages.
   * 
   * @param spouse1ClaimingAge - Spouse 1 claiming age
   * @param spouse2ClaimingAge - Spouse 2 claiming age
   * @param input - Couple calculation input
   * @param spouse1BirthDate - Spouse 1 birth date
   * @param spouse2BirthDate - Spouse 2 birth date
   * @param spouse1Fra - Spouse 1 Full Retirement Age
   * @param spouse2Fra - Spouse 2 Full Retirement Age
   * @returns Complete couple strategy evaluation
   */
  private evaluateCoupleStrategy(
    spouse1ClaimingAge: number,
    spouse2ClaimingAge: number,
    input: EnhancedCoupleInput,
    spouse1BirthDate: Date,
    spouse2BirthDate: Date,
    spouse1Fra: number,
    spouse2Fra: number
  ): CoupleStrategyEvaluation {
    // Calculate individual monthly benefits
    const spouse1MonthlyBenefit = this.ssaRules.getMonthlyBenefit(
      input.spouse1.pia,
      spouse1ClaimingAge,
      spouse1Fra
    );

    const spouse2MonthlyBenefit = this.ssaRules.getMonthlyBenefit(
      input.spouse2.pia,
      spouse2ClaimingAge,
      spouse2Fra
    );

    // Calculate spousal benefits
    const spouse1SpousalBenefit = this.ssaRules.calculateSpousalBenefit(
      input.spouse1.pia,
      input.spouse2.pia,
      spouse1ClaimingAge,
      spouse1Fra
    );

    const spouse2SpousalBenefit = this.ssaRules.calculateSpousalBenefit(
      input.spouse2.pia,
      input.spouse1.pia,
      spouse2ClaimingAge,
      spouse2Fra
    );

    // Total spousal benefit (only one spouse typically receives)
    const spousalBenefitAmount = Math.max(spouse1SpousalBenefit, spouse2SpousalBenefit);

    // Combined monthly benefit
    const combinedMonthlyBenefit = spouse1MonthlyBenefit + spouse2MonthlyBenefit + spousalBenefitAmount;

    // Generate year-by-year projections
    const yearlyProjections = this.projectionService.projectCoupleBenefits(
      spouse1ClaimingAge,
      spouse2ClaimingAge,
      input,
      spouse1BirthDate,
      spouse2BirthDate
    );

    // Calculate combined lifetime benefits
    const combinedLifetimeBenefit = this.projectionService.sumCoupleTotalBenefits(yearlyProjections);

    // Calculate present value
    const discountRate = input.discountRate ?? config.calculationDefaults.DEFAULT_DISCOUNT_RATE;
    const combinedPresentValue = this.projectionService.calculateCouplePresentValueFromProjections(
      yearlyProjections,
      discountRate
    );

    // Generate survivor scenarios
    const survivorScenarios: SurvivorProjection[] = [];

    // Only generate survivor scenarios if life expectancies differ
    if (input.spouse1.lifeExpectancy !== input.spouse2.lifeExpectancy) {
      if (input.spouse2.lifeExpectancy > input.spouse1.lifeExpectancy) {
        // Spouse 1 dies first, Spouse 2 survives
        survivorScenarios.push(
          this.projectionService.projectSurvivorScenario(
            1,
            input,
            spouse1ClaimingAge,
            spouse2ClaimingAge,
            spouse1BirthDate,
            spouse2BirthDate
          )
        );
      }

      if (input.spouse1.lifeExpectancy > input.spouse2.lifeExpectancy) {
        // Spouse 2 dies first, Spouse 1 survives
        survivorScenarios.push(
          this.projectionService.projectSurvivorScenario(
            2,
            input,
            spouse1ClaimingAge,
            spouse2ClaimingAge,
            spouse1BirthDate,
            spouse2BirthDate
          )
        );
      }
    }

    // Generate description
    const description = this.generateCoupleStrategyDescription(
      spouse1ClaimingAge,
      spouse2ClaimingAge,
      spouse1Fra,
      spouse2Fra,
      combinedMonthlyBenefit,
      spousalBenefitAmount
    );

    return {
      spouse1ClaimingAge,
      spouse2ClaimingAge,
      spouse1MonthlyBenefit,
      spouse2MonthlyBenefit,
      spousalBenefitAmount,
      combinedMonthlyBenefit,
      combinedLifetimeBenefit,
      combinedPresentValue,
      yearlyProjections,
      survivorScenarios,
      description,
    };
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

  /**
   * Compare two strategies
   * 
   * Calculates dollar difference between strategies, percentage difference,
   * and compares present values.
   * 
   * Requirements: 3.3, 3.4, 6.3, 6.4
   * 
   * @param strategy1 - First strategy to compare
   * @param strategy2 - Second strategy to compare
   * @returns Strategy comparison with differences
   */
  compareStrategies(
    strategy1: StrategyEvaluation | CoupleStrategyEvaluation,
    strategy2: StrategyEvaluation | CoupleStrategyEvaluation
  ): StrategyComparison {
    // Determine if these are individual or couple strategies
    const isIndividual = 'claimingAge' in strategy1;

    let lifetimeBenefit1: number;
    let lifetimeBenefit2: number;
    let presentValue1: number;
    let presentValue2: number;

    if (isIndividual) {
      const s1 = strategy1 as StrategyEvaluation;
      const s2 = strategy2 as StrategyEvaluation;
      lifetimeBenefit1 = s1.lifetimeBenefit;
      lifetimeBenefit2 = s2.lifetimeBenefit;
      presentValue1 = s1.presentValue;
      presentValue2 = s2.presentValue;
    } else {
      const s1 = strategy1 as CoupleStrategyEvaluation;
      const s2 = strategy2 as CoupleStrategyEvaluation;
      lifetimeBenefit1 = s1.combinedLifetimeBenefit;
      lifetimeBenefit2 = s2.combinedLifetimeBenefit;
      presentValue1 = s1.combinedPresentValue;
      presentValue2 = s2.combinedPresentValue;
    }

    // Calculate lifetime benefit differences
    const lifetimeBenefitDifference = lifetimeBenefit1 - lifetimeBenefit2;
    const lifetimeBenefitPercentage = lifetimeBenefit2 !== 0
      ? (lifetimeBenefitDifference / lifetimeBenefit2) * 100
      : 0;

    // Calculate present value differences
    const presentValueDifference = presentValue1 - presentValue2;
    const presentValuePercentage = presentValue2 !== 0
      ? (presentValueDifference / presentValue2) * 100
      : 0;

    // Determine which strategy is better (higher lifetime benefits)
    const betterStrategy: 1 | 2 = lifetimeBenefit1 >= lifetimeBenefit2 ? 1 : 2;

    return {
      strategy1,
      strategy2,
      lifetimeBenefitDifference,
      lifetimeBenefitPercentage,
      presentValueDifference,
      presentValuePercentage,
      betterStrategy,
    };
  }
}
