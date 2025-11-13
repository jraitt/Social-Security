/**
 * ProjectionService - Lifetime Benefits Projection Service
 * 
 * Calculates lifetime benefit projections including:
 * - Total lifetime benefits from claiming age to life expectancy
 * - Year-by-year cumulative benefit totals
 * - Inflation-adjusted calculations
 * - Chart data generation for visualization
 * - Enhanced year-by-year projections for individuals and couples
 * - Survivor scenario modeling
 */

import { 
  YearlyProjection, 
  CoupleYearlyProjection, 
  SurvivorProjection,
  EnhancedIndividualInput,
  EnhancedCoupleInput
} from '../types/enhanced-calculator.types';
import { SSARulesEngine } from './SSARulesEngine';
import { PresentValueService } from './PresentValueService';

export interface ProjectionResult {
  totalLifetimeBenefit: number;
  inflationAdjustedBenefit: number;
  yearsOfBenefits: number;
  monthsOfBenefits: number;
}

export interface CumulativeBenefitData {
  year: number;
  age: number;
  cumulativeBenefit: number;
  inflationAdjustedCumulative: number;
}

export interface ChartDataPoint {
  claimingAge: number;
  monthlyBenefit: number;
  lifetimeBenefit: number;
  inflationAdjustedLifetimeBenefit: number;
  cumulativeBenefits: CumulativeBenefitData[];
}

export class ProjectionService {
  private ssaRules: SSARulesEngine;
  private presentValueService: PresentValueService;
  private monthlyBenefitCache: Map<string, number>;

  constructor() {
    this.ssaRules = new SSARulesEngine();
    this.presentValueService = new PresentValueService();
    this.monthlyBenefitCache = new Map();
  }

  /**
   * Clear monthly benefit cache
   */
  clearCache(): void {
    this.monthlyBenefitCache.clear();
  }

  /**
   * Get cached monthly benefit or calculate and cache it
   */
  private getCachedMonthlyBenefit(pia: number, claimingAge: number, fra: number): number {
    const key = `${pia}-${claimingAge}-${fra}`;
    let benefit = this.monthlyBenefitCache.get(key);
    
    if (benefit === undefined) {
      benefit = this.ssaRules.getMonthlyBenefit(pia, claimingAge, fra);
      this.monthlyBenefitCache.set(key, benefit);
    }
    
    return benefit;
  }

  /**
   * Generate year-by-year benefit projections for an individual
   * 
   * Creates detailed projections from claiming age to life expectancy,
   * applying COLA adjustments year-over-year and inflation adjustments if enabled.
   * 
   * @param claimingAge - Age when claiming benefits
   * @param input - Individual calculation input with PIA, life expectancy, etc.
   * @param birthDate - Birth date for calculating calendar years
   * @param colaRate - Annual COLA rate (default 0 for no COLA)
   * @returns Array of yearly projections
   */
  projectIndividualBenefits(
    claimingAge: number,
    input: EnhancedIndividualInput,
    birthDate: Date,
    colaRate: number = 0
  ): YearlyProjection[] {
    const projections: YearlyProjection[] = [];
    
    // Calculate FRA and initial monthly benefit (with caching)
    const birthYear = birthDate.getFullYear();
    const fra = this.ssaRules.calculateFRA(birthYear);
    const initialMonthlyBenefit = this.getCachedMonthlyBenefit(input.pia, claimingAge, fra);
    
    // Calculate claiming year
    const claimingYear = birthYear + claimingAge;
    
    // Generate projections from claiming age to life expectancy
    let cumulativeBenefit = 0;
    
    for (let age = claimingAge; age <= input.lifeExpectancy; age++) {
      const year = birthYear + age;
      const yearsFromClaiming = age - claimingAge;
      
      // Apply COLA to monthly benefit
      const monthlyBenefitWithCOLA = this.ssaRules.applyCOLA(
        initialMonthlyBenefit,
        yearsFromClaiming,
        colaRate
      );
      
      // Calculate annual benefit (12 months)
      // For the claiming year, may receive partial year
      let monthsInYear = 12;
      if (age === claimingAge) {
        // Assume claiming at start of year for simplicity
        monthsInYear = 12;
      }
      if (age === input.lifeExpectancy) {
        // Last year may be partial
        monthsInYear = Math.min(12, Math.round((input.lifeExpectancy - Math.floor(input.lifeExpectancy)) * 12) || 12);
      }
      
      const annualBenefit = monthlyBenefitWithCOLA * monthsInYear;
      
      // Apply inflation adjustment if enabled
      let inflationAdjustedBenefit = annualBenefit;
      if (input.inflationRate > 0) {
        const yearsFromBase = year - claimingYear;
        inflationAdjustedBenefit = annualBenefit / Math.pow(1 + input.inflationRate, yearsFromBase);
      }
      
      // Update cumulative benefit
      cumulativeBenefit += annualBenefit;
      
      projections.push({
        year,
        age,
        retirementBenefit: monthlyBenefitWithCOLA,
        annualBenefit,
        inflationAdjustedBenefit,
        cumulativeBenefit,
      });
    }
    
    return projections;
  }

  /**
   * Generate year-by-year benefit projections for a couple
   * 
   * Creates detailed projections including retirement benefits for both spouses,
   * spousal benefits when applicable, and coordinates benefit timing.
   * 
   * @param spouse1ClaimingAge - Spouse 1 claiming age
   * @param spouse2ClaimingAge - Spouse 2 claiming age
   * @param input - Couple calculation input
   * @param spouse1BirthDate - Spouse 1 birth date
   * @param spouse2BirthDate - Spouse 2 birth date
   * @param colaRate - Annual COLA rate (default 0 for no COLA)
   * @returns Array of yearly couple projections
   */
  projectCoupleBenefits(
    spouse1ClaimingAge: number,
    spouse2ClaimingAge: number,
    input: EnhancedCoupleInput,
    spouse1BirthDate: Date,
    spouse2BirthDate: Date,
    colaRate: number = 0
  ): CoupleYearlyProjection[] {
    const projections: CoupleYearlyProjection[] = [];
    
    // Calculate FRAs
    const spouse1BirthYear = spouse1BirthDate.getFullYear();
    const spouse2BirthYear = spouse2BirthDate.getFullYear();
    const spouse1FRA = this.ssaRules.calculateFRA(spouse1BirthYear);
    const spouse2FRA = this.ssaRules.calculateFRA(spouse2BirthYear);
    
    // Calculate initial monthly benefits (with caching)
    const spouse1InitialBenefit = this.getCachedMonthlyBenefit(
      input.spouse1.pia,
      spouse1ClaimingAge,
      spouse1FRA
    );
    const spouse2InitialBenefit = this.getCachedMonthlyBenefit(
      input.spouse2.pia,
      spouse2ClaimingAge,
      spouse2FRA
    );
    
    // Determine projection range (from earliest claiming to latest life expectancy)
    const earliestClaimingAge = Math.min(spouse1ClaimingAge, spouse2ClaimingAge);
    const latestLifeExpectancy = Math.max(input.spouse1.lifeExpectancy, input.spouse2.lifeExpectancy);
    const spouse1ClaimingYear = spouse1BirthYear + spouse1ClaimingAge;
    const spouse2ClaimingYear = spouse2BirthYear + spouse2ClaimingAge;
    const baseYear = Math.min(spouse1ClaimingYear, spouse2ClaimingYear);
    
    let cumulativeBenefit = 0;
    
    // Generate projections year by year
    for (let yearOffset = 0; yearOffset <= (latestLifeExpectancy - earliestClaimingAge); yearOffset++) {
      const year = baseYear + yearOffset;
      const spouse1Age = year - spouse1BirthYear;
      const spouse2Age = year - spouse2BirthYear;
      
      // Check if each spouse is alive and has claimed
      const spouse1Alive = spouse1Age <= input.spouse1.lifeExpectancy;
      const spouse2Alive = spouse2Age <= input.spouse2.lifeExpectancy;
      const spouse1Claimed = spouse1Age >= spouse1ClaimingAge;
      const spouse2Claimed = spouse2Age >= spouse2ClaimingAge;
      
      // Calculate retirement benefits with COLA
      let spouse1RetirementBenefit = 0;
      let spouse2RetirementBenefit = 0;
      
      if (spouse1Alive && spouse1Claimed) {
        const yearsFromClaiming = spouse1Age - spouse1ClaimingAge;
        spouse1RetirementBenefit = this.ssaRules.applyCOLA(
          spouse1InitialBenefit,
          yearsFromClaiming,
          colaRate
        );
      }
      
      if (spouse2Alive && spouse2Claimed) {
        const yearsFromClaiming = spouse2Age - spouse2ClaimingAge;
        spouse2RetirementBenefit = this.ssaRules.applyCOLA(
          spouse2InitialBenefit,
          yearsFromClaiming,
          colaRate
        );
      }
      
      // Calculate spousal benefits (only when both are alive and both have claimed)
      let spousalBenefit = 0;
      if (spouse1Alive && spouse2Alive && spouse1Claimed && spouse2Claimed) {
        // Check if spouse 1 is eligible for spousal benefit
        const spouse1SpousalBenefit = this.ssaRules.calculateSpousalBenefit(
          input.spouse1.pia,
          input.spouse2.pia,
          spouse1ClaimingAge,
          spouse1FRA
        );
        
        // Check if spouse 2 is eligible for spousal benefit
        const spouse2SpousalBenefit = this.ssaRules.calculateSpousalBenefit(
          input.spouse2.pia,
          input.spouse1.pia,
          spouse2ClaimingAge,
          spouse2FRA
        );
        
        // Apply COLA to spousal benefits
        if (spouse1SpousalBenefit > 0) {
          const yearsFromClaiming = spouse1Age - spouse1ClaimingAge;
          spousalBenefit += this.ssaRules.applyCOLA(spouse1SpousalBenefit, yearsFromClaiming, colaRate);
        }
        if (spouse2SpousalBenefit > 0) {
          const yearsFromClaiming = spouse2Age - spouse2ClaimingAge;
          spousalBenefit += this.ssaRules.applyCOLA(spouse2SpousalBenefit, yearsFromClaiming, colaRate);
        }
      }
      
      // No survivor benefits in this projection (handled separately)
      const survivorBenefit = 0;
      
      // Calculate totals
      const totalMonthlyBenefit = spouse1RetirementBenefit + spouse2RetirementBenefit + spousalBenefit;
      const totalAnnualBenefit = totalMonthlyBenefit * 12;
      
      // Apply inflation adjustment if enabled
      let inflationAdjustedTotal = totalAnnualBenefit;
      if (input.inflationRate > 0) {
        const yearsFromBase = year - baseYear;
        inflationAdjustedTotal = totalAnnualBenefit / Math.pow(1 + input.inflationRate, yearsFromBase);
      }
      
      cumulativeBenefit += totalAnnualBenefit;
      
      projections.push({
        year,
        spouse1Age,
        spouse2Age,
        spouse1RetirementBenefit,
        spouse2RetirementBenefit,
        spousalBenefit,
        survivorBenefit,
        totalMonthlyBenefit,
        totalAnnualBenefit,
        inflationAdjustedTotal,
        cumulativeBenefit,
      });
    }
    
    return projections;
  }

  /**
   * Generate survivor benefit scenario projection
   * 
   * Models benefits if one spouse predeceases the other, calculating
   * survivor benefits from year of death through surviving spouse's life expectancy.
   * 
   * @param deceasedSpouse - Which spouse passed away (1 or 2)
   * @param input - Couple calculation input
   * @param spouse1ClaimingAge - Spouse 1 claiming age
   * @param spouse2ClaimingAge - Spouse 2 claiming age
   * @param spouse1BirthDate - Spouse 1 birth date
   * @param spouse2BirthDate - Spouse 2 birth date
   * @param colaRate - Annual COLA rate (default 0 for no COLA)
   * @returns Survivor projection with yearly benefits
   */
  projectSurvivorScenario(
    deceasedSpouse: 1 | 2,
    input: EnhancedCoupleInput,
    spouse1ClaimingAge: number,
    spouse2ClaimingAge: number,
    spouse1BirthDate: Date,
    spouse2BirthDate: Date,
    colaRate: number = 0
  ): SurvivorProjection {
    // Determine survivor and deceased
    const survivorSpouse = deceasedSpouse === 1 ? 2 : 1;
    const survivorInput = survivorSpouse === 1 ? input.spouse1 : input.spouse2;
    const deceasedInput = deceasedSpouse === 1 ? input.spouse1 : input.spouse2;
    const survivorBirthDate = survivorSpouse === 1 ? spouse1BirthDate : spouse2BirthDate;
    const deceasedBirthDate = deceasedSpouse === 1 ? spouse1BirthDate : spouse2BirthDate;
    const survivorClaimingAge = survivorSpouse === 1 ? spouse1ClaimingAge : spouse2ClaimingAge;
    const deceasedClaimingAge = deceasedSpouse === 1 ? spouse1ClaimingAge : spouse2ClaimingAge;
    
    // Calculate FRAs
    const survivorBirthYear = survivorBirthDate.getFullYear();
    const deceasedBirthYear = deceasedBirthDate.getFullYear();
    const survivorFRA = this.ssaRules.calculateFRA(survivorBirthYear);
    const deceasedFRA = this.ssaRules.calculateFRA(deceasedBirthYear);
    
    // Year of death is at deceased's life expectancy
    const yearOfDeath = Math.floor(deceasedBirthYear + deceasedInput.lifeExpectancy);
    const survivorAgeAtDeath = yearOfDeath - survivorBirthYear;
    
    // If survivor would already be past their life expectancy, adjust scenario
    // In reality, we model the scenario where survivor outlives the deceased
    const yearsAsSurvivor = Math.max(0, survivorInput.lifeExpectancy - survivorAgeAtDeath);
    
    // Calculate deceased's benefit at time of death (with caching)
    const yearsFromDeceasedClaiming = deceasedInput.lifeExpectancy - deceasedClaimingAge;
    const deceasedInitialBenefit = this.getCachedMonthlyBenefit(
      deceasedInput.pia,
      deceasedClaimingAge,
      deceasedFRA
    );
    const deceasedBenefitAtDeath = this.ssaRules.applyCOLA(
      deceasedInitialBenefit,
      yearsFromDeceasedClaiming,
      colaRate
    );
    
    // Calculate survivor's own benefit at time of death (with caching)
    const survivorInitialBenefit = this.getCachedMonthlyBenefit(
      survivorInput.pia,
      survivorClaimingAge,
      survivorFRA
    );
    const yearsFromSurvivorClaiming = survivorAgeAtDeath - survivorClaimingAge;
    const survivorOwnBenefit = this.ssaRules.applyCOLA(
      survivorInitialBenefit,
      yearsFromSurvivorClaiming,
      colaRate
    );
    
    // Calculate survivor benefit (100% of deceased's benefit)
    const survivorBenefitAmount = this.ssaRules.calculateSurvivorBenefit(
      deceasedBenefitAtDeath,
      survivorAgeAtDeath,
      survivorFRA
    );
    
    // Survivor receives higher of own benefit or survivor benefit
    const monthlyBenefit = Math.max(survivorOwnBenefit, survivorBenefitAmount);
    
    // Generate year-by-year projections for survivor
    const yearlyProjections: YearlyProjection[] = [];
    let totalSurvivorBenefit = 0;
    
    for (let yearOffset = 0; yearOffset <= yearsAsSurvivor; yearOffset++) {
      const year = yearOfDeath + yearOffset;
      const age = survivorAgeAtDeath + yearOffset;
      
      // Apply COLA to survivor benefit
      const benefitWithCOLA = this.ssaRules.applyCOLA(monthlyBenefit, yearOffset, colaRate);
      const annualBenefit = benefitWithCOLA * 12;
      
      // Apply inflation adjustment if enabled
      let inflationAdjustedBenefit = annualBenefit;
      if (input.inflationRate > 0) {
        inflationAdjustedBenefit = annualBenefit / Math.pow(1 + input.inflationRate, yearOffset);
      }
      
      totalSurvivorBenefit += annualBenefit;
      
      yearlyProjections.push({
        year,
        age,
        retirementBenefit: benefitWithCOLA,
        annualBenefit,
        inflationAdjustedBenefit,
        cumulativeBenefit: totalSurvivorBenefit,
      });
    }
    
    // Calculate present value of survivor benefits
    const discountRate = input.discountRate || 0.03;
    const presentValueSurvivorBenefit = this.presentValueService.calculatePresentValue(
      yearlyProjections,
      discountRate,
      yearOfDeath
    );
    
    return {
      deceasedSpouse,
      yearOfDeath,
      survivorAge: survivorAgeAtDeath,
      survivorBenefit: monthlyBenefit,
      yearsAsSurvivor,
      yearlyProjections,
      totalSurvivorBenefit,
      presentValueSurvivorBenefit,
    };
  }

  /**
   * Sum total benefits from projections
   * 
   * Aggregates all annual benefits from a projection array to calculate
   * total lifetime benefits.
   * 
   * @param projections - Array of yearly projections
   * @returns Total lifetime benefits (nominal)
   */
  sumTotalBenefits(projections: YearlyProjection[]): number {
    return projections.reduce((sum, proj) => sum + proj.annualBenefit, 0);
  }

  /**
   * Sum total benefits from couple projections
   * 
   * Aggregates all annual benefits from a couple projection array.
   * 
   * @param projections - Array of yearly couple projections
   * @returns Total lifetime benefits (nominal)
   */
  sumCoupleTotalBenefits(projections: CoupleYearlyProjection[]): number {
    return projections.reduce((sum, proj) => sum + proj.totalAnnualBenefit, 0);
  }

  /**
   * Calculate present value of benefit stream from projections
   * 
   * Uses the PresentValueService to calculate the present value of
   * all future benefit payments.
   * 
   * @param projections - Array of yearly projections
   * @param discountRate - Annual discount rate (0-0.10)
   * @returns Present value of benefit stream
   */
  calculatePresentValueFromProjections(
    projections: YearlyProjection[],
    discountRate: number
  ): number {
    if (projections.length === 0) {
      return 0;
    }
    
    const baseYear = projections[0].year;
    return this.presentValueService.calculatePresentValue(projections, discountRate, baseYear);
  }

  /**
   * Calculate present value of couple benefit stream from projections
   * 
   * Uses the PresentValueService to calculate the present value of
   * all future benefit payments for a couple.
   * 
   * @param projections - Array of yearly couple projections
   * @param discountRate - Annual discount rate (0-0.10)
   * @returns Present value of benefit stream
   */
  calculateCouplePresentValueFromProjections(
    projections: CoupleYearlyProjection[],
    discountRate: number
  ): number {
    if (projections.length === 0) {
      return 0;
    }
    
    const baseYear = projections[0].year;
    return this.presentValueService.calculateCouplePresentValue(projections, discountRate, baseYear);
  }

  /**
   * Project lifetime benefits from claiming age to life expectancy
   * 
   * Calculates total benefits received over the lifetime, both nominal
   * and inflation-adjusted values.
   * 
   * @param monthlyBenefit - Monthly benefit amount at claiming age
   * @param claimingAge - Age when benefits are claimed
   * @param lifeExpectancy - Expected age at death
   * @param inflationRate - Annual inflation rate (e.g., 0.025 for 2.5%)
   * @returns Projection result with lifetime totals
   */
  projectLifetimeBenefits(
    monthlyBenefit: number,
    claimingAge: number,
    lifeExpectancy: number,
    inflationRate: number
  ): ProjectionResult {
    // Validate inputs
    if (claimingAge >= lifeExpectancy) {
      return {
        totalLifetimeBenefit: 0,
        inflationAdjustedBenefit: 0,
        yearsOfBenefits: 0,
        monthsOfBenefits: 0,
      };
    }

    const yearsOfBenefits = lifeExpectancy - claimingAge;
    const monthsOfBenefits = Math.round(yearsOfBenefits * 12);

    // Calculate nominal lifetime benefit (no inflation adjustment)
    const totalLifetimeBenefit = monthlyBenefit * monthsOfBenefits;

    // Calculate inflation-adjusted lifetime benefit
    let inflationAdjustedBenefit = 0;
    for (let month = 0; month < monthsOfBenefits; month++) {
      const yearsFromStart = month / 12;
      const adjustedBenefit = this.applyInflation(monthlyBenefit, yearsFromStart, inflationRate);
      inflationAdjustedBenefit += adjustedBenefit;
    }

    return {
      totalLifetimeBenefit,
      inflationAdjustedBenefit,
      yearsOfBenefits,
      monthsOfBenefits,
    };
  }

  /**
   * Project cumulative benefits year-by-year
   * 
   * Generates an array of cumulative benefit totals for each year
   * from claiming age to life expectancy. Useful for visualization.
   * 
   * @param monthlyBenefit - Monthly benefit amount at claiming age
   * @param claimingAge - Age when benefits are claimed
   * @param lifeExpectancy - Expected age at death
   * @param inflationRate - Annual inflation rate (optional, defaults to 0)
   * @returns Array of cumulative benefit data by year
   */
  projectCumulativeBenefits(
    monthlyBenefit: number,
    claimingAge: number,
    lifeExpectancy: number,
    inflationRate: number = 0
  ): CumulativeBenefitData[] {
    const cumulativeData: CumulativeBenefitData[] = [];

    if (claimingAge >= lifeExpectancy) {
      return cumulativeData;
    }

    const yearsOfBenefits = Math.ceil(lifeExpectancy - claimingAge);
    let cumulativeBenefit = 0;
    let inflationAdjustedCumulative = 0;

    for (let year = 0; year <= yearsOfBenefits; year++) {
      const currentAge = claimingAge + year;

      // Calculate benefits for this year (12 months)
      const monthsInYear = Math.min(12, Math.round((lifeExpectancy - currentAge) * 12));
      
      if (monthsInYear > 0) {
        // Add nominal benefits for the year
        const yearlyBenefit = monthlyBenefit * monthsInYear;
        cumulativeBenefit += yearlyBenefit;

        // Add inflation-adjusted benefits for the year
        for (let month = 0; month < monthsInYear; month++) {
          const totalMonthsFromStart = year * 12 + month;
          const yearsFromStart = totalMonthsFromStart / 12;
          const adjustedBenefit = this.applyInflation(monthlyBenefit, yearsFromStart, inflationRate);
          inflationAdjustedCumulative += adjustedBenefit;
        }
      }

      cumulativeData.push({
        year,
        age: currentAge,
        cumulativeBenefit,
        inflationAdjustedCumulative,
      });
    }

    return cumulativeData;
  }

  /**
   * Generate chart data points for all claiming ages
   * 
   * Creates comprehensive data for visualization showing benefits
   * across all possible claiming ages (62-70).
   * 
   * @param pia - Primary Insurance Amount
   * @param fra - Full Retirement Age
   * @param lifeExpectancy - Expected age at death
   * @param inflationRate - Annual inflation rate
   * @param getMonthlyBenefitFn - Function to calculate monthly benefit for a given claiming age
   * @returns Array of chart data points for each claiming age
   */
  generateChartData(
    pia: number,
    fra: number,
    lifeExpectancy: number,
    inflationRate: number,
    getMonthlyBenefitFn: (pia: number, claimingAge: number, fra: number) => number
  ): ChartDataPoint[] {
    const chartData: ChartDataPoint[] = [];

    // Generate data for claiming ages 62 through 70
    for (let claimingAge = 62; claimingAge <= 70; claimingAge++) {
      const monthlyBenefit = getMonthlyBenefitFn(pia, claimingAge, fra);
      
      const projection = this.projectLifetimeBenefits(
        monthlyBenefit,
        claimingAge,
        lifeExpectancy,
        inflationRate
      );

      const cumulativeBenefits = this.projectCumulativeBenefits(
        monthlyBenefit,
        claimingAge,
        lifeExpectancy,
        inflationRate
      );

      chartData.push({
        claimingAge,
        monthlyBenefit,
        lifetimeBenefit: projection.totalLifetimeBenefit,
        inflationAdjustedLifetimeBenefit: projection.inflationAdjustedBenefit,
        cumulativeBenefits,
      });
    }

    return chartData;
  }

  /**
   * Apply inflation adjustment to a benefit amount
   * 
   * Calculates the present value of a future benefit payment
   * accounting for inflation (discounting).
   * 
   * Formula: PV = FV / (1 + r)^n
   * where r is the inflation rate and n is the number of years
   * 
   * @param amount - Nominal benefit amount
   * @param years - Number of years in the future
   * @param inflationRate - Annual inflation rate (e.g., 0.025 for 2.5%)
   * @returns Inflation-adjusted (present value) amount
   */
  private applyInflation(amount: number, years: number, inflationRate: number): number {
    if (inflationRate === 0 || years === 0) {
      return amount;
    }

    // Calculate present value: PV = FV / (1 + r)^n
    const presentValue = amount / Math.pow(1 + inflationRate, years);
    return presentValue;
  }

  /**
   * Find optimal claiming age based on maximum lifetime benefits
   * 
   * Analyzes all claiming ages and returns the one that maximizes
   * lifetime benefits (either nominal or inflation-adjusted).
   * 
   * @param chartData - Array of chart data points for all claiming ages
   * @param useInflationAdjusted - Whether to use inflation-adjusted values
   * @returns Optimal claiming age
   */
  findOptimalClaimingAge(chartData: ChartDataPoint[], useInflationAdjusted: boolean = false): number {
    if (chartData.length === 0) {
      return 67; // Default to FRA if no data
    }

    let maxBenefit = 0;
    let optimalAge = 67;

    for (const dataPoint of chartData) {
      const benefit = useInflationAdjusted 
        ? dataPoint.inflationAdjustedLifetimeBenefit 
        : dataPoint.lifetimeBenefit;

      if (benefit > maxBenefit) {
        maxBenefit = benefit;
        optimalAge = dataPoint.claimingAge;
      }
    }

    return optimalAge;
  }

  /**
   * Calculate breakeven age between two claiming strategies
   * 
   * Determines the age at which total benefits received from two
   * different claiming ages become equal.
   * 
   * @param earlyClaimingAge - Earlier claiming age
   * @param earlyMonthlyBenefit - Monthly benefit for early claiming
   * @param lateClaimingAge - Later claiming age
   * @param lateMonthlyBenefit - Monthly benefit for late claiming
   * @returns Breakeven age, or null if no breakeven exists
   */
  calculateBreakevenAge(
    earlyClaimingAge: number,
    earlyMonthlyBenefit: number,
    lateClaimingAge: number,
    lateMonthlyBenefit: number
  ): number | null {
    // Early claimer starts receiving benefits immediately
    // Late claimer receives higher benefits but starts later
    
    // Calculate cumulative benefits at various ages
    for (let age = lateClaimingAge; age <= 100; age += 0.5) {
      const earlyMonths = (age - earlyClaimingAge) * 12;
      const lateMonths = (age - lateClaimingAge) * 12;
      
      const earlyTotal = earlyMonthlyBenefit * earlyMonths;
      const lateTotal = lateMonthlyBenefit * lateMonths;
      
      if (lateTotal >= earlyTotal) {
        return age;
      }
    }
    
    return null; // No breakeven found within reasonable lifespan
  }
}
