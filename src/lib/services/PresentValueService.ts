/**
 * PresentValueService - Present Value Calculation Service
 * 
 * Calculates present value of benefit streams for strategy comparison.
 * Implements time value of money calculations using discount rates to
 * compare the value of benefit payments received at different times.
 */

import { 
  YearlyProjection, 
  CoupleYearlyProjection, 
  StrategyEvaluation,
  CoupleStrategyEvaluation 
} from '../types/enhanced-calculator.types';

/**
 * Present value comparison result
 */
export interface PresentValueComparison {
  difference: number; // Dollar difference between strategies
  percentageDifference: number; // Percentage difference
  higherStrategy: 1 | 2; // Which strategy has higher present value
}

export class PresentValueService {
  /**
   * Validate discount rate
   * 
   * Ensures discount rate is within acceptable range (0-10%).
   * 
   * @param discountRate - Annual discount rate (0-0.10)
   * @throws Error if discount rate is invalid
   */
  private validateDiscountRate(discountRate: number): void {
    if (discountRate < 0 || discountRate > 0.10) {
      throw new Error('Discount rate must be between 0% and 10% (0 to 0.10)');
    }
  }

  /**
   * Calculate present value of a benefit stream
   * 
   * Calculates the present value of future benefit payments using the
   * discount rate formula: PV = Σ (Benefit_year / (1 + r)^n)
   * 
   * @param projections - Array of yearly benefit projections
   * @param discountRate - Annual discount rate (0-0.10)
   * @param baseYear - Base year for present value calculation
   * @returns Present value of the benefit stream
   */
  calculatePresentValue(
    projections: YearlyProjection[],
    discountRate: number,
    baseYear: number
  ): number {
    // Validate discount rate
    this.validateDiscountRate(discountRate);

    // If discount rate is 0, return sum of nominal benefits
    if (discountRate === 0) {
      return projections.reduce((sum, proj) => sum + proj.annualBenefit, 0);
    }

    // Calculate present value for each year and sum
    let presentValue = 0;

    for (const projection of projections) {
      const yearsFromBase = projection.year - baseYear;
      
      // Only discount future benefits (yearsFromBase >= 0)
      if (yearsFromBase >= 0) {
        const discountFactor = Math.pow(1 + discountRate, yearsFromBase);
        const yearPresentValue = projection.annualBenefit / discountFactor;
        presentValue += yearPresentValue;
      }
    }

    return presentValue;
  }

  /**
   * Calculate present value for couple projections
   * 
   * Calculates the present value of future benefit payments for a couple
   * using the discount rate formula.
   * 
   * @param projections - Array of yearly couple benefit projections
   * @param discountRate - Annual discount rate (0-0.10)
   * @param baseYear - Base year for present value calculation
   * @returns Present value of the benefit stream
   */
  calculateCouplePresentValue(
    projections: CoupleYearlyProjection[],
    discountRate: number,
    baseYear: number
  ): number {
    // Validate discount rate
    this.validateDiscountRate(discountRate);

    // If discount rate is 0, return sum of nominal benefits
    if (discountRate === 0) {
      return projections.reduce((sum, proj) => sum + proj.totalAnnualBenefit, 0);
    }

    // Calculate present value for each year and sum
    let presentValue = 0;

    for (const projection of projections) {
      const yearsFromBase = projection.year - baseYear;
      
      // Only discount future benefits (yearsFromBase >= 0)
      if (yearsFromBase >= 0) {
        const discountFactor = Math.pow(1 + discountRate, yearsFromBase);
        const yearPresentValue = projection.totalAnnualBenefit / discountFactor;
        presentValue += yearPresentValue;
      }
    }

    return presentValue;
  }

  /**
   * Calculate Net Present Value (NPV) of a strategy
   * 
   * Calculates the NPV of an individual claiming strategy by computing
   * the present value of all future benefit payments.
   * 
   * @param strategy - Strategy evaluation with yearly projections
   * @param discountRate - Annual discount rate (0-0.10)
   * @returns Net present value of the strategy
   */
  calculateNPV(
    strategy: StrategyEvaluation,
    discountRate: number
  ): number {
    // Validate discount rate
    this.validateDiscountRate(discountRate);

    // Use the first projection year as base year
    const baseYear = strategy.yearlyProjections.length > 0 
      ? strategy.yearlyProjections[0].year 
      : new Date().getFullYear();

    return this.calculatePresentValue(
      strategy.yearlyProjections,
      discountRate,
      baseYear
    );
  }

  /**
   * Calculate Net Present Value (NPV) of a couple strategy
   * 
   * Calculates the NPV of a couple claiming strategy by computing
   * the present value of all future benefit payments.
   * 
   * @param strategy - Couple strategy evaluation with yearly projections
   * @param discountRate - Annual discount rate (0-0.10)
   * @returns Net present value of the strategy
   */
  calculateCoupleNPV(
    strategy: CoupleStrategyEvaluation,
    discountRate: number
  ): number {
    // Validate discount rate
    this.validateDiscountRate(discountRate);

    // Use the first projection year as base year
    const baseYear = strategy.yearlyProjections.length > 0 
      ? strategy.yearlyProjections[0].year 
      : new Date().getFullYear();

    return this.calculateCouplePresentValue(
      strategy.yearlyProjections,
      discountRate,
      baseYear
    );
  }

  /**
   * Compare present values of two strategies
   * 
   * Calculates the difference in present value between two strategies
   * and determines which strategy has higher value.
   * 
   * @param strategy1PV - Present value of strategy 1
   * @param strategy2PV - Present value of strategy 2
   * @returns Comparison result with difference and percentage
   */
  comparePresentValues(
    strategy1PV: number,
    strategy2PV: number
  ): PresentValueComparison {
    const difference = strategy1PV - strategy2PV;
    const percentageDifference = strategy2PV !== 0 
      ? (difference / strategy2PV) * 100 
      : 0;

    return {
      difference,
      percentageDifference,
      higherStrategy: strategy1PV >= strategy2PV ? 1 : 2,
    };
  }

  /**
   * Calculate present value for a simple benefit stream
   * 
   * Helper method to calculate present value for a stream of equal
   * annual payments (annuity formula).
   * 
   * @param annualBenefit - Annual benefit amount
   * @param years - Number of years of benefits
   * @param discountRate - Annual discount rate (0-0.10)
   * @returns Present value of the benefit stream
   */
  calculateAnnuityPresentValue(
    annualBenefit: number,
    years: number,
    discountRate: number
  ): number {
    // Validate discount rate
    this.validateDiscountRate(discountRate);

    // If discount rate is 0, return simple sum
    if (discountRate === 0) {
      return annualBenefit * years;
    }

    // Use annuity formula: PV = PMT * [(1 - (1 + r)^-n) / r]
    const discountFactor = Math.pow(1 + discountRate, -years);
    const presentValue = annualBenefit * ((1 - discountFactor) / discountRate);

    return presentValue;
  }
}
