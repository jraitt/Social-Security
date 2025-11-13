/**
 * Unit tests for EnhancedCalculationService
 * 
 * Tests strategy evaluation, optimal strategy identification, and alternative strategy generation
 * as specified in Requirements 1.1 and 1.3
 */

import { EnhancedCalculationService } from '../EnhancedCalculationService';
import { 
  EnhancedIndividualInput,
  EnhancedCoupleInput 
} from '../../types/enhanced-calculator.types';

describe('EnhancedCalculationService', () => {
  let service: EnhancedCalculationService;

  beforeEach(() => {
    service = new EnhancedCalculationService();
  });

  describe('evaluateStrategy', () => {
    it('should evaluate a strategy with year-by-year projections', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const strategy = service.evaluateStrategy(67, input);

      expect(strategy.claimingAge).toBe(67);
      expect(strategy.monthlyBenefit).toBeGreaterThan(0);
      expect(strategy.lifetimeBenefit).toBeGreaterThan(0);
      expect(strategy.presentValue).toBeGreaterThan(0);
      expect(strategy.yearlyProjections).toBeDefined();
      expect(strategy.yearlyProjections.length).toBeGreaterThan(0);
      expect(strategy.description).toContain('Full Retirement Age');
    });

    it('should calculate present value for strategy', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const strategy = service.evaluateStrategy(70, input);

      expect(strategy.presentValue).toBeLessThan(strategy.lifetimeBenefit);
      expect(strategy.presentValue).toBeGreaterThan(0);
    });
  });

  describe('calculateIndividualOptimal', () => {
    it('should identify optimal strategy with highest total benefits', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const result = service.calculateIndividualOptimal(input);

      expect(result.optimalAge).toBeGreaterThanOrEqual(62);
      expect(result.optimalAge).toBeLessThanOrEqual(70);
      expect(result.optimalLifetimeBenefit).toBeGreaterThan(0);
      expect(result.optimalPresentValue).toBeGreaterThan(0);
      expect(result.fra).toBeCloseTo(67, 0); // FRA for 1960 birth year
      expect(result.allStrategies).toHaveLength(9); // Ages 62-70
    });

    it('should generate alternative strategies within 2%', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const result = service.calculateIndividualOptimal(input);

      // Check that alternatives are within 2% of optimal
      result.alternativeStrategies.forEach(alt => {
        const percentDiff = Math.abs(
          (alt.lifetimeBenefit - result.optimalLifetimeBenefit) / result.optimalLifetimeBenefit
        );
        expect(percentDiff).toBeLessThanOrEqual(0.02);
      });
    });

    it('should calculate comparison with age 62', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const result = service.calculateIndividualOptimal(input);

      expect(result.comparisonWithAge62).toBeDefined();
      expect(result.comparisonWithAge62.age62LifetimeBenefit).toBeGreaterThan(0);
      expect(result.comparisonWithAge62.additionalLifetimeBenefit).toBeDefined();
      expect(result.comparisonWithAge62.percentageIncrease).toBeDefined();
    });
  });

  describe('calculateCoupleOptimal', () => {
    it('should identify optimal couple strategy', () => {
      const input: EnhancedCoupleInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 85,
        },
        spouse2: {
          birthDate: '1962-01-01',
          pia: 2000,
          lifeExpectancy: 87,
        },
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const result = service.calculateCoupleOptimal(input);

      expect(result.optimalStrategy).toBeDefined();
      expect(result.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(result.optimalStrategy.spouse1ClaimingAge).toBeLessThanOrEqual(70);
      expect(result.optimalStrategy.spouse2ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(result.optimalStrategy.spouse2ClaimingAge).toBeLessThanOrEqual(70);
      expect(result.optimalStrategy.combinedLifetimeBenefit).toBeGreaterThan(0);
      expect(result.allStrategies).toHaveLength(81); // 9x9 combinations
    });

    it('should generate survivor scenarios', () => {
      const input: EnhancedCoupleInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 85,
        },
        spouse2: {
          birthDate: '1962-01-01',
          pia: 2000,
          lifeExpectancy: 87,
        },
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const result = service.calculateCoupleOptimal(input);

      expect(result.survivorScenarios).toBeDefined();
      expect(result.survivorScenarios.spouse1Outlives).toBeDefined();
      expect(result.survivorScenarios.spouse2Outlives).toBeDefined();
    });
  });

  describe('compareStrategies', () => {
    it('should compare two individual strategies', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const strategy1 = service.evaluateStrategy(62, input);
      const strategy2 = service.evaluateStrategy(70, input);

      const comparison = service.compareStrategies(strategy1, strategy2);

      expect(comparison.lifetimeBenefitDifference).toBeDefined();
      expect(comparison.lifetimeBenefitPercentage).toBeDefined();
      expect(comparison.presentValueDifference).toBeDefined();
      expect(comparison.presentValuePercentage).toBeDefined();
      expect(comparison.betterStrategy).toBeGreaterThanOrEqual(1);
      expect(comparison.betterStrategy).toBeLessThanOrEqual(2);
    });
  });
});
