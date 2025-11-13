/**
 * Unit tests for PresentValueService
 * 
 * Tests present value calculations, NPV comparisons, and edge cases
 * as specified in Requirements 3.1 and 3.6
 */

import { PresentValueService } from '../PresentValueService';
import { 
  YearlyProjection, 
  CoupleYearlyProjection,
  StrategyEvaluation,
  CoupleStrategyEvaluation 
} from '../../types/enhanced-calculator.types';

describe('PresentValueService', () => {
  let service: PresentValueService;

  beforeEach(() => {
    service = new PresentValueService();
  });

  describe('calculatePresentValue', () => {
    it('should calculate present value with 3% discount rate', () => {
      const projections: YearlyProjection[] = [
        { year: 2025, age: 65, retirementBenefit: 3333.33, annualBenefit: 40000, inflationAdjustedBenefit: 40000, cumulativeBenefit: 40000 },
        { year: 2026, age: 66, retirementBenefit: 3333.33, annualBenefit: 40000, inflationAdjustedBenefit: 40000, cumulativeBenefit: 80000 },
        { year: 2027, age: 67, retirementBenefit: 3333.33, annualBenefit: 40000, inflationAdjustedBenefit: 40000, cumulativeBenefit: 120000 },
      ];

      const pv = service.calculatePresentValue(projections, 0.03, 2025);

      // Expected: 40000 + 40000/1.03 + 40000/1.03^2
      // = 40000 + 38834.95 + 37703.84 = 116538.79
      expect(pv).toBeCloseTo(116538.79, 1);
    });

    it('should calculate present value with 5% discount rate', () => {
      const projections: YearlyProjection[] = [
        { year: 2025, age: 65, retirementBenefit: 4166.67, annualBenefit: 50000, inflationAdjustedBenefit: 50000, cumulativeBenefit: 50000 },
        { year: 2026, age: 66, retirementBenefit: 4166.67, annualBenefit: 50000, inflationAdjustedBenefit: 50000, cumulativeBenefit: 100000 },
      ];

      const pv = service.calculatePresentValue(projections, 0.05, 2025);

      // Expected: 50000 + 50000/1.05 = 50000 + 47619.05 = 97619.05
      expect(pv).toBeCloseTo(97619.05, 2);
    });

    it('should handle 0% discount rate (edge case)', () => {
      const projections: YearlyProjection[] = [
        { year: 2025, age: 65, retirementBenefit: 2500, annualBenefit: 30000, inflationAdjustedBenefit: 30000, cumulativeBenefit: 30000 },
        { year: 2026, age: 66, retirementBenefit: 2500, annualBenefit: 30000, inflationAdjustedBenefit: 30000, cumulativeBenefit: 60000 },
        { year: 2027, age: 67, retirementBenefit: 2500, annualBenefit: 30000, inflationAdjustedBenefit: 30000, cumulativeBenefit: 90000 },
      ];

      const pv = service.calculatePresentValue(projections, 0, 2025);

      // With 0% discount rate, PV equals sum of nominal benefits
      expect(pv).toBe(90000);
    });

    it('should handle 10% discount rate (edge case)', () => {
      const projections: YearlyProjection[] = [
        { year: 2025, age: 65, retirementBenefit: 5000, annualBenefit: 60000, inflationAdjustedBenefit: 60000, cumulativeBenefit: 60000 },
        { year: 2026, age: 66, retirementBenefit: 5000, annualBenefit: 60000, inflationAdjustedBenefit: 60000, cumulativeBenefit: 120000 },
      ];

      const pv = service.calculatePresentValue(projections, 0.10, 2025);

      // Expected: 60000 + 60000/1.10 = 60000 + 54545.45 = 114545.45
      expect(pv).toBeCloseTo(114545.45, 2);
    });

    it('should throw error for discount rate below 0%', () => {
      const projections: YearlyProjection[] = [
        { year: 2025, age: 65, retirementBenefit: 3333.33, annualBenefit: 40000, inflationAdjustedBenefit: 40000, cumulativeBenefit: 40000 },
      ];

      expect(() => {
        service.calculatePresentValue(projections, -0.01, 2025);
      }).toThrow('Discount rate must be between 0% and 10%');
    });

    it('should throw error for discount rate above 10%', () => {
      const projections: YearlyProjection[] = [
        { year: 2025, age: 65, retirementBenefit: 3333.33, annualBenefit: 40000, inflationAdjustedBenefit: 40000, cumulativeBenefit: 40000 },
      ];

      expect(() => {
        service.calculatePresentValue(projections, 0.11, 2025);
      }).toThrow('Discount rate must be between 0% and 10%');
    });

    it('should handle empty projections array', () => {
      const projections: YearlyProjection[] = [];

      const pv = service.calculatePresentValue(projections, 0.03, 2025);

      expect(pv).toBe(0);
    });

    it('should only discount future benefits', () => {
      const projections: YearlyProjection[] = [
        { year: 2024, age: 64, retirementBenefit: 833.33, annualBenefit: 10000, inflationAdjustedBenefit: 10000, cumulativeBenefit: 10000 },
        { year: 2025, age: 65, retirementBenefit: 3333.33, annualBenefit: 40000, inflationAdjustedBenefit: 40000, cumulativeBenefit: 50000 },
        { year: 2026, age: 66, retirementBenefit: 3333.33, annualBenefit: 40000, inflationAdjustedBenefit: 40000, cumulativeBenefit: 90000 },
      ];

      const pv = service.calculatePresentValue(projections, 0.03, 2025);

      // Year 2024 should be ignored (yearsFromBase < 0)
      // Expected: 40000 + 40000/1.03 = 40000 + 38834.95 = 78834.95
      expect(pv).toBeCloseTo(78834.95, 2);
    });
  });

  describe('calculateCouplePresentValue', () => {
    it('should calculate present value for couple projections', () => {
      const projections: CoupleYearlyProjection[] = [
        {
          year: 2025,
          spouse1Age: 65,
          spouse2Age: 63,
          spouse1RetirementBenefit: 2500,
          spouse2RetirementBenefit: 1666.67,
          spousalBenefit: 0,
          survivorBenefit: 0,
          totalMonthlyBenefit: 4166.67,
          totalAnnualBenefit: 50000,
          inflationAdjustedTotal: 50000,
          cumulativeBenefit: 50000,
        },
        {
          year: 2026,
          spouse1Age: 66,
          spouse2Age: 64,
          spouse1RetirementBenefit: 2500,
          spouse2RetirementBenefit: 1666.67,
          spousalBenefit: 0,
          survivorBenefit: 0,
          totalMonthlyBenefit: 4166.67,
          totalAnnualBenefit: 50000,
          inflationAdjustedTotal: 50000,
          cumulativeBenefit: 100000,
        },
      ];

      const pv = service.calculateCouplePresentValue(projections, 0.03, 2025);

      // Expected: 50000 + 50000/1.03 = 50000 + 48543.69 = 98543.69
      expect(pv).toBeCloseTo(98543.69, 2);
    });

    it('should handle 0% discount rate for couple projections', () => {
      const projections: CoupleYearlyProjection[] = [
        {
          year: 2025,
          spouse1Age: 65,
          spouse2Age: 63,
          spouse1RetirementBenefit: 2500,
          spouse2RetirementBenefit: 1666.67,
          spousalBenefit: 0,
          survivorBenefit: 0,
          totalMonthlyBenefit: 4166.67,
          totalAnnualBenefit: 50000,
          inflationAdjustedTotal: 50000,
          cumulativeBenefit: 50000,
        },
        {
          year: 2026,
          spouse1Age: 66,
          spouse2Age: 64,
          spouse1RetirementBenefit: 2500,
          spouse2RetirementBenefit: 1666.67,
          spousalBenefit: 0,
          survivorBenefit: 0,
          totalMonthlyBenefit: 4166.67,
          totalAnnualBenefit: 50000,
          inflationAdjustedTotal: 50000,
          cumulativeBenefit: 100000,
        },
      ];

      const pv = service.calculateCouplePresentValue(projections, 0, 2025);

      expect(pv).toBe(100000);
    });
  });

  describe('calculateNPV', () => {
    it('should calculate NPV for individual strategy', () => {
      const strategy: StrategyEvaluation = {
        claimingAge: 67,
        monthlyBenefit: 3000,
        lifetimeBenefit: 540000,
        presentValue: 0, // Will be calculated
        yearlyProjections: [
          { year: 2025, age: 67, retirementBenefit: 3000, annualBenefit: 36000, inflationAdjustedBenefit: 36000, cumulativeBenefit: 36000 },
          { year: 2026, age: 68, retirementBenefit: 3000, annualBenefit: 36000, inflationAdjustedBenefit: 36000, cumulativeBenefit: 72000 },
          { year: 2027, age: 69, retirementBenefit: 3000, annualBenefit: 36000, inflationAdjustedBenefit: 36000, cumulativeBenefit: 108000 },
        ],
        description: 'Claim at 67',
        adjustmentFactor: 1.0,
        adjustmentPercentage: 0,
      };

      const npv = service.calculateNPV(strategy, 0.03);

      // Expected: 36000 + 36000/1.03 + 36000/1.03^2
      // = 36000 + 34951.46 + 33932.00 = 104884.91
      expect(npv).toBeCloseTo(104884.91, 1);
    });

    it('should calculate NPV with 0% discount rate', () => {
      const strategy: StrategyEvaluation = {
        claimingAge: 70,
        monthlyBenefit: 4000,
        lifetimeBenefit: 480000,
        presentValue: 0,
        yearlyProjections: [
          { year: 2025, age: 70, retirementBenefit: 4000, annualBenefit: 48000, inflationAdjustedBenefit: 48000, cumulativeBenefit: 48000 },
          { year: 2026, age: 71, retirementBenefit: 4000, annualBenefit: 48000, inflationAdjustedBenefit: 48000, cumulativeBenefit: 96000 },
        ],
        description: 'Claim at 70',
        adjustmentFactor: 1.32,
        adjustmentPercentage: 32,
      };

      const npv = service.calculateNPV(strategy, 0);

      expect(npv).toBe(96000);
    });

    it('should calculate NPV with 10% discount rate', () => {
      const strategy: StrategyEvaluation = {
        claimingAge: 62,
        monthlyBenefit: 2000,
        lifetimeBenefit: 552000,
        presentValue: 0,
        yearlyProjections: [
          { year: 2025, age: 62, retirementBenefit: 2000, annualBenefit: 24000, inflationAdjustedBenefit: 24000, cumulativeBenefit: 24000 },
          { year: 2026, age: 63, retirementBenefit: 2000, annualBenefit: 24000, inflationAdjustedBenefit: 24000, cumulativeBenefit: 48000 },
        ],
        description: 'Claim at 62',
        adjustmentFactor: 0.70,
        adjustmentPercentage: -30,
      };

      const npv = service.calculateNPV(strategy, 0.10);

      // Expected: 24000 + 24000/1.10 = 24000 + 21818.18 = 45818.18
      expect(npv).toBeCloseTo(45818.18, 2);
    });
  });

  describe('calculateCoupleNPV', () => {
    it('should calculate NPV for couple strategy', () => {
      const strategy: CoupleStrategyEvaluation = {
        spouse1ClaimingAge: 67,
        spouse2ClaimingAge: 65,
        spouse1MonthlyBenefit: 3000,
        spouse2MonthlyBenefit: 2000,
        spousalBenefitAmount: 0,
        combinedMonthlyBenefit: 5000,
        combinedLifetimeBenefit: 1200000,
        combinedPresentValue: 0,
        yearlyProjections: [
          {
            year: 2025,
            spouse1Age: 67,
            spouse2Age: 65,
            spouse1RetirementBenefit: 3000,
            spouse2RetirementBenefit: 2000,
            spousalBenefit: 0,
            survivorBenefit: 0,
            totalMonthlyBenefit: 5000,
            totalAnnualBenefit: 60000,
            inflationAdjustedTotal: 60000,
            cumulativeBenefit: 60000,
          },
          {
            year: 2026,
            spouse1Age: 68,
            spouse2Age: 66,
            spouse1RetirementBenefit: 3000,
            spouse2RetirementBenefit: 2000,
            spousalBenefit: 0,
            survivorBenefit: 0,
            totalMonthlyBenefit: 5000,
            totalAnnualBenefit: 60000,
            inflationAdjustedTotal: 60000,
            cumulativeBenefit: 120000,
          },
        ],
        survivorScenarios: [],
        description: 'Spouse 1 at 67, Spouse 2 at 65',
      };

      const npv = service.calculateCoupleNPV(strategy, 0.03);

      // Expected: 60000 + 60000/1.03 = 60000 + 58252.43 = 118252.43
      expect(npv).toBeCloseTo(118252.43, 2);
    });
  });

  describe('comparePresentValues', () => {
    it('should compare two present values and identify higher strategy', () => {
      const strategy1PV = 500000;
      const strategy2PV = 450000;

      const comparison = service.comparePresentValues(strategy1PV, strategy2PV);

      expect(comparison.difference).toBe(50000);
      expect(comparison.percentageDifference).toBeCloseTo(11.11, 2);
      expect(comparison.higherStrategy).toBe(1);
    });

    it('should handle strategy 2 having higher present value', () => {
      const strategy1PV = 400000;
      const strategy2PV = 450000;

      const comparison = service.comparePresentValues(strategy1PV, strategy2PV);

      expect(comparison.difference).toBe(-50000);
      expect(comparison.percentageDifference).toBeCloseTo(-11.11, 2);
      expect(comparison.higherStrategy).toBe(2);
    });

    it('should handle equal present values', () => {
      const strategy1PV = 500000;
      const strategy2PV = 500000;

      const comparison = service.comparePresentValues(strategy1PV, strategy2PV);

      expect(comparison.difference).toBe(0);
      expect(comparison.percentageDifference).toBe(0);
      expect(comparison.higherStrategy).toBe(1); // Strategy 1 when equal
    });

    it('should handle zero strategy 2 present value', () => {
      const strategy1PV = 100000;
      const strategy2PV = 0;

      const comparison = service.comparePresentValues(strategy1PV, strategy2PV);

      expect(comparison.difference).toBe(100000);
      expect(comparison.percentageDifference).toBe(0);
      expect(comparison.higherStrategy).toBe(1);
    });

    it('should calculate negative percentage difference correctly', () => {
      const strategy1PV = 300000;
      const strategy2PV = 400000;

      const comparison = service.comparePresentValues(strategy1PV, strategy2PV);

      expect(comparison.difference).toBe(-100000);
      expect(comparison.percentageDifference).toBe(-25);
      expect(comparison.higherStrategy).toBe(2);
    });
  });

  describe('calculateAnnuityPresentValue', () => {
    it('should calculate present value for annuity with 3% discount rate', () => {
      const pv = service.calculateAnnuityPresentValue(40000, 10, 0.03);

      // Using annuity formula: PV = PMT * [(1 - (1 + r)^-n) / r]
      // = 40000 * [(1 - 1.03^-10) / 0.03]
      // = 40000 * 8.5302 = 341208
      expect(pv).toBeCloseTo(341208, 0);
    });

    it('should calculate present value for annuity with 0% discount rate', () => {
      const pv = service.calculateAnnuityPresentValue(50000, 5, 0);

      // With 0% discount rate, PV = annual benefit * years
      expect(pv).toBe(250000);
    });

    it('should calculate present value for annuity with 10% discount rate', () => {
      const pv = service.calculateAnnuityPresentValue(30000, 15, 0.10);

      // Using annuity formula
      // = 30000 * [(1 - 1.10^-15) / 0.10]
      // = 30000 * 7.6061 = 228182.39
      expect(pv).toBeCloseTo(228182, 0);
    });

    it('should handle single year annuity', () => {
      const pv = service.calculateAnnuityPresentValue(60000, 1, 0.05);

      // For 1 year: PV = 60000 * [(1 - 1.05^-1) / 0.05]
      // = 60000 * 0.9524 = 57142.86
      expect(pv).toBeCloseTo(57143, 0);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should validate discount rate in calculateCouplePresentValue', () => {
      const projections: CoupleYearlyProjection[] = [
        {
          year: 2025,
          spouse1Age: 65,
          spouse2Age: 63,
          spouse1RetirementBenefit: 2500,
          spouse2RetirementBenefit: 1666.67,
          spousalBenefit: 0,
          survivorBenefit: 0,
          totalMonthlyBenefit: 4166.67,
          totalAnnualBenefit: 50000,
          inflationAdjustedTotal: 50000,
          cumulativeBenefit: 50000,
        },
      ];

      expect(() => {
        service.calculateCouplePresentValue(projections, 0.15, 2025);
      }).toThrow('Discount rate must be between 0% and 10%');
    });

    it('should validate discount rate in calculateNPV', () => {
      const strategy: StrategyEvaluation = {
        claimingAge: 67,
        monthlyBenefit: 3000,
        lifetimeBenefit: 540000,
        presentValue: 0,
        yearlyProjections: [
          { year: 2025, age: 67, retirementBenefit: 3000, annualBenefit: 36000, inflationAdjustedBenefit: 36000, cumulativeBenefit: 36000 },
        ],
        description: 'Claim at 67',
        adjustmentFactor: 1.0,
        adjustmentPercentage: 0,
      };

      expect(() => {
        service.calculateNPV(strategy, -0.05);
      }).toThrow('Discount rate must be between 0% and 10%');
    });

    it('should validate discount rate in calculateAnnuityPresentValue', () => {
      expect(() => {
        service.calculateAnnuityPresentValue(40000, 10, 0.12);
      }).toThrow('Discount rate must be between 0% and 10%');
    });
  });
});
