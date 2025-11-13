/**
 * ProjectionService Tests
 * 
 * Tests for enhanced projection service methods including:
 * - Individual year-by-year projections
 * - Couple year-by-year projections
 * - Survivor scenario modeling
 * - Projection summary methods
 */

import { ProjectionService } from '../ProjectionService';
import { EnhancedIndividualInput, EnhancedCoupleInput } from '../../types/enhanced-calculator.types';

describe('ProjectionService - Enhanced Methods', () => {
  let projectionService: ProjectionService;

  beforeEach(() => {
    projectionService = new ProjectionService();
  });

  describe('projectIndividualBenefits', () => {
    it('should generate year-by-year projections for an individual', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };
      const birthDate = new Date(1960, 0, 1); // Use year, month (0-indexed), day
      const claimingAge = 67;

      const projections = projectionService.projectIndividualBenefits(
        claimingAge,
        input,
        birthDate,
        0.025
      );

      // Should have projections from claiming age to life expectancy
      expect(projections.length).toBe(85 - 67 + 1); // 19 years
      
      // First projection should be at claiming age
      expect(projections[0].age).toBe(67);
      expect(projections[0].year).toBe(1960 + 67); // Birth year + age
      
      // Last projection should be at life expectancy
      expect(projections[projections.length - 1].age).toBe(85);
      
      // Benefits should increase with COLA
      expect(projections[1].retirementBenefit).toBeGreaterThan(projections[0].retirementBenefit);
      
      // Cumulative benefits should increase
      expect(projections[1].cumulativeBenefit).toBeGreaterThan(projections[0].cumulativeBenefit);
    });

    it('should apply inflation adjustments when enabled', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 70,
        inflationRate: 0.03,
        discountRate: 0.03,
      };
      const birthDate = new Date(1960, 0, 1);

      const projections = projectionService.projectIndividualBenefits(67, input, birthDate);

      // Inflation-adjusted benefits should be less than nominal for future years
      expect(projections[1].inflationAdjustedBenefit).toBeLessThan(projections[1].annualBenefit);
    });
  });

  describe('projectCoupleBenefits', () => {
    it('should generate year-by-year projections for a couple', () => {
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
      const spouse1BirthDate = new Date(1960, 0, 1);
      const spouse2BirthDate = new Date(1962, 0, 1);

      const projections = projectionService.projectCoupleBenefits(
        67,
        67,
        input,
        spouse1BirthDate,
        spouse2BirthDate
      );

      // Should have projections
      expect(projections.length).toBeGreaterThan(0);
      
      // Find a projection where both spouses have claimed
      const projectionWithBoth = projections.find(p => 
        p.spouse1RetirementBenefit > 0 && p.spouse2RetirementBenefit > 0
      );
      
      expect(projectionWithBoth).toBeDefined();
      if (projectionWithBoth) {
        // Should have both spouses' benefits
        expect(projectionWithBoth.spouse1RetirementBenefit).toBeGreaterThan(0);
        expect(projectionWithBoth.spouse2RetirementBenefit).toBeGreaterThan(0);
        
        // Total should be sum of individual benefits
        expect(projectionWithBoth.totalMonthlyBenefit).toBeCloseTo(
          projectionWithBoth.spouse1RetirementBenefit + 
          projectionWithBoth.spouse2RetirementBenefit + 
          projectionWithBoth.spousalBenefit
        );
      }
    });

    it('should calculate spousal benefits when applicable', () => {
      const input: EnhancedCoupleInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 85,
        },
        spouse2: {
          birthDate: '1962-01-01',
          pia: 1000, // Low PIA, eligible for spousal benefit
          lifeExpectancy: 87,
        },
        inflationRate: 0.025,
        discountRate: 0.03,
      };
      const spouse1BirthDate = new Date(1960, 0, 1);
      const spouse2BirthDate = new Date(1962, 0, 1);

      const projections = projectionService.projectCoupleBenefits(
        67,
        67,
        input,
        spouse1BirthDate,
        spouse2BirthDate
      );

      // Spouse 2 should be eligible for spousal benefit (50% of spouse 1's PIA = 1500 > 1000)
      // Find a projection where both have claimed
      const projectionWithBoth = projections.find(p => 
        p.spouse1Age >= 67 && p.spouse2Age >= 67
      );
      
      expect(projectionWithBoth).toBeDefined();
      if (projectionWithBoth) {
        expect(projectionWithBoth.spousalBenefit).toBeGreaterThan(0);
      }
    });
  });

  describe('projectSurvivorScenario', () => {
    it('should model survivor benefits when spouse 1 dies first', () => {
      const input: EnhancedCoupleInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 80,
        },
        spouse2: {
          birthDate: '1962-01-01',
          pia: 2000,
          lifeExpectancy: 87,
        },
        inflationRate: 0.025,
        discountRate: 0.03,
      };
      const spouse1BirthDate = new Date(1960, 0, 1);
      const spouse2BirthDate = new Date(1962, 0, 1);

      const survivorProjection = projectionService.projectSurvivorScenario(
        1, // Spouse 1 dies
        input,
        67,
        67,
        spouse1BirthDate,
        spouse2BirthDate
      );

      expect(survivorProjection.deceasedSpouse).toBe(1);
      expect(survivorProjection.yearOfDeath).toBe(1960 + 80); // Birth year + life expectancy
      expect(survivorProjection.survivorBenefit).toBeGreaterThan(0);
      expect(survivorProjection.totalSurvivorBenefit).toBeGreaterThan(0);
      expect(survivorProjection.yearlyProjections.length).toBeGreaterThan(0);
    });

    it('should model survivor benefits when spouse 2 dies first', () => {
      const input: EnhancedCoupleInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 87,
        },
        spouse2: {
          birthDate: '1962-01-01',
          pia: 2000,
          lifeExpectancy: 80,
        },
        inflationRate: 0.025,
        discountRate: 0.03,
      };
      const spouse1BirthDate = new Date(1960, 0, 1);
      const spouse2BirthDate = new Date(1962, 0, 1);

      const survivorProjection = projectionService.projectSurvivorScenario(
        2, // Spouse 2 dies
        input,
        67,
        67,
        spouse1BirthDate,
        spouse2BirthDate
      );

      expect(survivorProjection.deceasedSpouse).toBe(2);
      expect(survivorProjection.yearOfDeath).toBe(1962 + 80); // Birth year + life expectancy
      expect(survivorProjection.survivorBenefit).toBeGreaterThan(0);
    });

    it('should calculate present value of survivor benefits', () => {
      const input: EnhancedCoupleInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 80,
        },
        spouse2: {
          birthDate: '1962-01-01',
          pia: 2000,
          lifeExpectancy: 87,
        },
        inflationRate: 0.025,
        discountRate: 0.03,
      };
      const spouse1BirthDate = new Date(1960, 0, 1);
      const spouse2BirthDate = new Date(1962, 0, 1);

      const survivorProjection = projectionService.projectSurvivorScenario(
        1,
        input,
        67,
        67,
        spouse1BirthDate,
        spouse2BirthDate
      );

      // Present value should be less than total nominal benefits
      expect(survivorProjection.presentValueSurvivorBenefit).toBeGreaterThan(0);
      expect(survivorProjection.presentValueSurvivorBenefit).toBeLessThan(
        survivorProjection.totalSurvivorBenefit
      );
    });
  });

  describe('sumTotalBenefits', () => {
    it('should sum total benefits from individual projections', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 70,
        inflationRate: 0.025,
        discountRate: 0.03,
      };
      const birthDate = new Date(1960, 0, 1);

      const projections = projectionService.projectIndividualBenefits(67, input, birthDate);
      const total = projectionService.sumTotalBenefits(projections);

      expect(total).toBeGreaterThan(0);
      // Total should equal the last cumulative benefit
      expect(total).toBeCloseTo(projections[projections.length - 1].cumulativeBenefit, 0);
    });
  });

  describe('sumCoupleTotalBenefits', () => {
    it('should sum total benefits from couple projections', () => {
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
      const spouse1BirthDate = new Date(1960, 0, 1);
      const spouse2BirthDate = new Date(1962, 0, 1);

      const projections = projectionService.projectCoupleBenefits(
        67,
        67,
        input,
        spouse1BirthDate,
        spouse2BirthDate
      );
      const total = projectionService.sumCoupleTotalBenefits(projections);

      expect(total).toBeGreaterThan(0);
      // Total should equal the last cumulative benefit
      expect(total).toBeCloseTo(projections[projections.length - 1].cumulativeBenefit, 0);
    });
  });

  describe('calculatePresentValueFromProjections', () => {
    it('should calculate present value from individual projections', () => {
      const input: EnhancedIndividualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 70,
        inflationRate: 0.025,
        discountRate: 0.03,
      };
      const birthDate = new Date(1960, 0, 1);

      const projections = projectionService.projectIndividualBenefits(67, input, birthDate);
      const presentValue = projectionService.calculatePresentValueFromProjections(
        projections,
        0.03
      );

      expect(presentValue).toBeGreaterThan(0);
      
      // Present value should be less than nominal total
      const nominalTotal = projectionService.sumTotalBenefits(projections);
      expect(presentValue).toBeLessThan(nominalTotal);
    });
  });

  describe('calculateCouplePresentValueFromProjections', () => {
    it('should calculate present value from couple projections', () => {
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
      const spouse1BirthDate = new Date(1960, 0, 1);
      const spouse2BirthDate = new Date(1962, 0, 1);

      const projections = projectionService.projectCoupleBenefits(
        67,
        67,
        input,
        spouse1BirthDate,
        spouse2BirthDate
      );
      const presentValue = projectionService.calculateCouplePresentValueFromProjections(
        projections,
        0.03
      );

      expect(presentValue).toBeGreaterThan(0);
      
      // Present value should be less than nominal total
      const nominalTotal = projectionService.sumCoupleTotalBenefits(projections);
      expect(presentValue).toBeLessThan(nominalTotal);
    });
  });
});
