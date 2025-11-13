import { BenefitBreakdown } from '../types/enhanced-calculator.types';
import { cacheService } from './CacheService';

/**
 * SSARulesEngine - Social Security Administration Rules Engine
 * 
 * Implements SSA benefit calculation rules including:
 * - Full Retirement Age (FRA) determination
 * - Early claiming reductions
 * - Delayed retirement credits
 * - Spousal benefits
 * - Survivor benefits
 * - Benefit coordination
 * 
 * Uses CacheService for performance optimization of repeated calculations.
 */

export class SSARulesEngine {
  /**
   * Calculate Full Retirement Age (FRA) based on birth year
   * 
   * SSA Rules:
   * - Born 1943-1954: FRA is 66
   * - Born 1955-1959: FRA increases by 2 months per year (66 + 2 months to 66 + 10 months)
   * - Born 1960+: FRA is 67
   * 
   * Uses cache for performance optimization.
   * 
   * @param birthYear - Year of birth
   * @returns Full Retirement Age in years (with months as decimal)
   */
  calculateFRA(birthYear: number): number {
    // Check cache first
    const cached = cacheService.getFRA(birthYear);
    if (cached !== undefined) {
      return cached;
    }

    // Calculate FRA
    let fra: number;
    if (birthYear <= 1937) {
      fra = 65;
    } else if (birthYear >= 1938 && birthYear <= 1942) {
      // FRA increases by 2 months per year from 65 to 66
      const monthsToAdd = (birthYear - 1937) * 2;
      fra = 65 + monthsToAdd / 12;
    } else if (birthYear >= 1943 && birthYear <= 1954) {
      fra = 66;
    } else if (birthYear >= 1955 && birthYear <= 1959) {
      // FRA increases by 2 months per year from 66 to 67
      const monthsToAdd = (birthYear - 1954) * 2;
      fra = 66 + monthsToAdd / 12;
    } else {
      // Born 1960 or later
      fra = 67;
    }

    // Cache the result
    cacheService.setFRA(birthYear, fra);
    return fra;
  }

  /**
   * Calculate early claiming reduction percentage
   * 
   * SSA Rules:
   * - First 36 months before FRA: 5/9 of 1% per month (0.5556% per month)
   * - Beyond 36 months before FRA: 5/12 of 1% per month (0.4167% per month)
   * - Maximum reduction at age 62 is approximately 30% (for FRA 67)
   * 
   * @param claimingAge - Age when claiming benefits
   * @param fra - Full Retirement Age
   * @returns Reduction percentage (e.g., 0.25 for 25% reduction)
   */
  calculateEarlyReductionPercentage(claimingAge: number, fra: number): number {
    if (claimingAge >= fra) {
      return 0; // No reduction if claiming at or after FRA
    }

    const monthsEarly = Math.round((fra - claimingAge) * 12);
    
    let reductionPercentage = 0;
    
    if (monthsEarly <= 36) {
      // First 36 months: 5/9 of 1% per month
      reductionPercentage = monthsEarly * (5 / 9) * 0.01;
    } else {
      // First 36 months at 5/9 of 1%
      reductionPercentage = 36 * (5 / 9) * 0.01;
      // Additional months at 5/12 of 1%
      const additionalMonths = monthsEarly - 36;
      reductionPercentage += additionalMonths * (5 / 12) * 0.01;
    }
    
    return reductionPercentage;
  }

  /**
   * Calculate delayed retirement credits
   * 
   * SSA Rules:
   * - 2/3 of 1% per month after FRA (8% per year)
   * - Credits stop accruing at age 70
   * - Maximum increase is 24% (for FRA 67, delaying to 70)
   * 
   * @param claimingAge - Age when claiming benefits
   * @param fra - Full Retirement Age
   * @returns Credit percentage (e.g., 0.24 for 24% increase)
   */
  calculateDelayedCredits(claimingAge: number, fra: number): number {
    if (claimingAge <= fra) {
      return 0; // No credits if claiming at or before FRA
    }

    // Cap at age 70
    const effectiveClaimingAge = Math.min(claimingAge, 70);
    const monthsDelayed = Math.round((effectiveClaimingAge - fra) * 12);
    
    // 2/3 of 1% per month = 8% per year
    const creditPercentage = monthsDelayed * (2 / 3) * 0.01;
    
    return creditPercentage;
  }

  /**
   * Calculate spousal benefit amount with eligibility checks
   * 
   * SSA Rules:
   * - Spousal benefit is calculated as 50% of higher earner's PIA at FRA
   * - The actual spousal benefit paid is: (50% of spouse's PIA) - (your own PIA)
   * - This is the "excess" benefit that brings total to 50% of spouse's PIA
   * - Reduced if claimed before FRA (using spousal reduction rules)
   * - Only eligible if spouse's own PIA is less than 50% of higher earner's PIA
   * 
   * @param ownPIA - Primary Insurance Amount of spouse claiming spousal benefit
   * @param spousePIA - Primary Insurance Amount of higher earning spouse
   * @param claimingAge - Age when claiming spousal benefits
   * @param fra - Full Retirement Age of spouse claiming benefits
   * @returns Monthly spousal benefit amount (0 if not eligible)
   */
  calculateSpousalBenefit(
    ownPIA: number,
    spousePIA: number,
    claimingAge: number,
    fra: number
  ): number {
    // Check eligibility: only eligible if own PIA is less than 50% of spouse's PIA
    const maxSpousalBenefit = spousePIA * 0.5;
    
    if (ownPIA >= maxSpousalBenefit) {
      // Not eligible for spousal benefit
      return 0;
    }
    
    // Spousal benefit is the EXCESS: (50% of spouse's PIA) - (own PIA)
    // This brings the total benefit up to 50% of the higher earner's PIA
    let excessBenefit = maxSpousalBenefit - ownPIA;
    
    // Apply early claiming reduction if claiming before FRA
    // Note: The reduction applies to the excess benefit amount
    if (claimingAge < fra) {
      const reductionPercentage = this.calculateSpousalReductionPercentage(claimingAge, fra);
      excessBenefit = excessBenefit * (1 - reductionPercentage);
    }
    
    return excessBenefit;
  }

  /**
   * Calculate spousal benefit reduction percentage for early claiming
   * 
   * SSA Rules for spousal benefits:
   * - 25/36 of 1% per month for first 36 months before FRA (0.6944% per month)
   * - 5/12 of 1% per month beyond 36 months (0.4167% per month)
   * - Maximum reduction at age 62 is approximately 35% (for FRA 67)
   * 
   * Note: Spousal benefits have different reduction rates than retirement benefits
   * 
   * @param claimingAge - Age when claiming spousal benefits
   * @param fra - Full Retirement Age
   * @returns Reduction percentage (e.g., 0.30 for 30% reduction)
   */
  calculateSpousalReductionPercentage(claimingAge: number, fra: number): number {
    if (claimingAge >= fra) {
      return 0; // No reduction if claiming at or after FRA
    }

    const monthsEarly = Math.round((fra - claimingAge) * 12);
    
    let reductionPercentage = 0;
    
    if (monthsEarly <= 36) {
      // First 36 months: 25/36 of 1% per month
      reductionPercentage = monthsEarly * (25 / 36) * 0.01;
    } else {
      // First 36 months at 25/36 of 1%
      reductionPercentage = 36 * (25 / 36) * 0.01;
      // Additional months at 5/12 of 1%
      const additionalMonths = monthsEarly - 36;
      reductionPercentage += additionalMonths * (5 / 12) * 0.01;
    }
    
    return reductionPercentage;
  }

  /**
   * Check if spouse is eligible for spousal benefits
   * 
   * @param ownPIA - Primary Insurance Amount of spouse
   * @param spousePIA - Primary Insurance Amount of higher earning spouse
   * @returns true if eligible for spousal benefits
   */
  isSpousalBenefitEligible(ownPIA: number, spousePIA: number): boolean {
    return ownPIA < (spousePIA * 0.5);
  }

  /**
   * Calculate survivor benefit amount with age adjustments
   * 
   * SSA Rules:
   * - Survivor receives 100% of deceased spouse's benefit amount at survivor's FRA
   * - This includes any delayed retirement credits the deceased earned
   * - Survivor can claim as early as age 60 (or 50 if disabled)
   * - Reduced if claimed before survivor's FRA
   * - Reduction is 28.5% at age 60 for FRA 67 (approximately 0.475% per month)
   * 
   * @param deceasedBenefit - Monthly benefit amount the deceased was receiving or entitled to
   * @param survivorAge - Age of survivor when claiming survivor benefits
   * @param survivorFRA - Full Retirement Age of the survivor
   * @returns Monthly survivor benefit amount
   */
  calculateSurvivorBenefit(
    deceasedBenefit: number,
    survivorAge: number,
    survivorFRA: number
  ): number {
    // Base survivor benefit is 100% of deceased spouse's benefit
    let survivorBenefit = deceasedBenefit;
    
    // Apply reduction if claiming before survivor's FRA
    if (survivorAge < survivorFRA) {
      const reductionPercentage = this.calculateSurvivorReductionPercentage(
        survivorAge,
        survivorFRA
      );
      survivorBenefit = deceasedBenefit * (1 - reductionPercentage);
    }
    
    return survivorBenefit;
  }

  /**
   * Calculate survivor benefit reduction percentage for early claiming
   * 
   * SSA Rules for survivor benefits:
   * - Can claim as early as age 60
   * - Reduction is approximately 0.475% per month before FRA
   * - Maximum reduction is 28.5% at age 60 (for FRA 67)
   * 
   * @param survivorAge - Age when claiming survivor benefits
   * @param survivorFRA - Full Retirement Age of survivor
   * @returns Reduction percentage (e.g., 0.285 for 28.5% reduction)
   */
  calculateSurvivorReductionPercentage(survivorAge: number, survivorFRA: number): number {
    if (survivorAge >= survivorFRA) {
      return 0; // No reduction if claiming at or after FRA
    }

    // Minimum claiming age for survivor benefits is 60
    const effectiveClaimingAge = Math.max(survivorAge, 60);
    const monthsEarly = Math.round((survivorFRA - effectiveClaimingAge) * 12);
    
    // Survivor benefits reduce at approximately 0.475% per month
    // This gives approximately 28.5% reduction at age 60 for FRA 67
    const reductionPercentage = monthsEarly * 0.00475;
    
    return reductionPercentage;
  }

  /**
   * Determine which benefit to pay: own retirement or survivor benefit
   * 
   * SSA Rules:
   * - Survivor receives the higher of their own retirement benefit or survivor benefit
   * - Cannot receive both full amounts simultaneously
   * 
   * @param ownBenefit - Survivor's own retirement benefit amount
   * @param survivorBenefit - Survivor benefit amount from deceased spouse
   * @returns The higher benefit amount
   */
  coordinateSurvivorBenefit(ownBenefit: number, survivorBenefit: number): number {
    return Math.max(ownBenefit, survivorBenefit);
  }

  /**
   * Get monthly benefit amount combining all adjustment factors
   * 
   * Applies either early reduction or delayed credits based on claiming age
   * relative to FRA.
   * 
   * @param pia - Primary Insurance Amount (benefit at FRA)
   * @param claimingAge - Age when claiming benefits
   * @param fra - Full Retirement Age
   * @returns Monthly benefit amount after adjustments
   */
  getMonthlyBenefit(pia: number, claimingAge: number, fra: number): number {
    if (claimingAge === fra) {
      // Claiming at FRA - no adjustments
      return pia;
    } else if (claimingAge < fra) {
      // Early claiming - apply reduction
      const reductionPercentage = this.calculateEarlyReductionPercentage(claimingAge, fra);
      return pia * (1 - reductionPercentage);
    } else {
      // Delayed claiming - apply credits
      const creditPercentage = this.calculateDelayedCredits(claimingAge, fra);
      return pia * (1 + creditPercentage);
    }
  }

  /**
   * Get adjustment factor for a given claiming age
   * 
   * Returns the multiplier to apply to PIA based on claiming age.
   * Useful for displaying percentage adjustments to users.
   * 
   * Uses cache for performance optimization.
   * 
   * @param claimingAge - Age when claiming benefits
   * @param fra - Full Retirement Age
   * @returns Adjustment factor (e.g., 0.75 for 25% reduction, 1.24 for 24% increase)
   */
  getAdjustmentFactor(claimingAge: number, fra: number): number {
    // Check cache first
    const cached = cacheService.getAdjustmentFactor(claimingAge, fra);
    if (cached !== undefined) {
      return cached;
    }

    // Calculate adjustment factor
    let factor: number;
    if (claimingAge === fra) {
      factor = 1.0;
    } else if (claimingAge < fra) {
      const reductionPercentage = this.calculateEarlyReductionPercentage(claimingAge, fra);
      factor = 1 - reductionPercentage;
    } else {
      const creditPercentage = this.calculateDelayedCredits(claimingAge, fra);
      factor = 1 + creditPercentage;
    }

    // Cache the result
    cacheService.setAdjustmentFactor(claimingAge, fra, factor);
    return factor;
  }

  /**
   * Determine which benefit to pay based on all available benefit types
   * 
   * SSA Rules:
   * - Individual receives the highest benefit they are eligible for
   * - Cannot receive multiple full benefits simultaneously
   * - Retirement benefit is based on own work record
   * - Spousal benefit is based on spouse's work record
   * - Survivor benefit is based on deceased spouse's work record
   * 
   * @param retirementBenefit - Own retirement benefit amount
   * @param spousalBenefit - Spousal benefit amount (0 if not eligible)
   * @param survivorBenefit - Survivor benefit amount (0 if not applicable)
   * @returns BenefitBreakdown showing which benefit is paid and amounts
   */
  determineBenefitToPay(
    retirementBenefit: number,
    spousalBenefit: number,
    survivorBenefit: number
  ): BenefitBreakdown {
    // Determine which benefit is highest
    const maxBenefit = Math.max(retirementBenefit, spousalBenefit, survivorBenefit);
    
    let benefitType: 'retirement' | 'spousal' | 'survivor';
    
    if (survivorBenefit > 0 && survivorBenefit === maxBenefit) {
      benefitType = 'survivor';
    } else if (spousalBenefit > 0 && spousalBenefit === maxBenefit) {
      benefitType = 'spousal';
    } else {
      benefitType = 'retirement';
    }
    
    return {
      retirementBenefit,
      spousalBenefit,
      survivorBenefit,
      totalBenefit: maxBenefit,
      benefitType,
    };
  }

  /**
   * Apply Cost of Living Adjustment (COLA) to benefit amount
   * 
   * SSA applies COLA annually to maintain purchasing power.
   * This method compounds COLA over multiple years.
   * 
   * Uses cache for performance optimization.
   * 
   * @param benefit - Base benefit amount
   * @param years - Number of years to apply COLA
   * @param colaRate - Annual COLA rate (e.g., 0.025 for 2.5%)
   * @returns Benefit amount after COLA adjustments
   */
  applyCOLA(benefit: number, years: number, colaRate: number): number {
    if (years === 0 || colaRate === 0) {
      return benefit;
    }
    
    // Check cache first
    const cached = cacheService.getCOLA(benefit, years, colaRate);
    if (cached !== undefined) {
      return cached;
    }
    
    // Compound COLA over the years
    const result = benefit * Math.pow(1 + colaRate, years);
    
    // Cache the result
    cacheService.setCOLA(benefit, years, colaRate, result);
    return result;
  }
}
