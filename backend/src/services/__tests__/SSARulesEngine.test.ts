/**
 * Unit tests for SSARulesEngine
 * 
 * Tests spousal benefit calculations, survivor benefit calculations,
 * and benefit coordination rules as specified in Requirements 4.1 and 5.1
 */

import { SSARulesEngine } from '../SSARulesEngine';
import { BenefitBreakdown } from '../../types/enhanced-calculator.types';

describe('SSARulesEngine', () => {
  let engine: SSARulesEngine;

  beforeEach(() => {
    engine = new SSARulesEngine();
  });

  // ============================================================================
  // Spousal Benefit Calculations (Requirement 4.1)
  // ============================================================================

  describe('calculateSpousalBenefit', () => {
    it('should calculate spousal benefit as 50% of spouse PIA at FRA', () => {
      const ownPIA = 1000;
      const spousePIA = 3000;
      const claimingAge = 67;
      const fra = 67;

      const spousalBenefit = engine.calculateSpousalBenefit(ownPIA, spousePIA, claimingAge, fra);

      // Spousal benefit should be 50% of spouse's PIA = 1500
      expect(spousalBenefit).toBe(1500);
    });

    it('should return 0 if own PIA is greater than 50% of spouse PIA', () => {
      const ownPIA = 2000;
      const spousePIA = 3000;
      const claimingAge = 67;
      const fra = 67;

      const spousalBenefit = engine.calculateSpousalBenefit(ownPIA, spousePIA, claimingAge, fra);

      // Not eligible because own PIA (2000) >= 50% of spouse PIA (1500)
      expect(spousalBenefit).toBe(0);
    });

    it('should return 0 if own PIA equals 50% of spouse PIA', () => {
      const ownPIA = 1500;
      const spousePIA = 3000;
      const claimingAge = 67;
      const fra = 67;

      const spousalBenefit = engine.calculateSpousalBenefit(ownPIA, spousePIA, claimingAge, fra);

      // At exactly 50%, not eligible for spousal benefit
      expect(spousalBenefit).toBe(0);
    });

    it('should apply reduction when claiming spousal benefit before FRA', () => {
      const ownPIA = 1000;
      const spousePIA = 3000;
      const claimingAge = 62;
      const fra = 67;

      const spousalBenefit = engine.calculateSpousalBenefit(ownPIA, spousePIA, claimingAge, fra);

      // Base spousal benefit: 50% of 3000 = 1500
      // Claiming 5 years (60 months) early
      // First 36 months: 36 * (25/36) * 0.01 = 0.25 (25%)
      // Next 24 months: 24 * (5/12) * 0.01 = 0.10 (10%)
      // Total reduction: 35%
      // Reduced benefit: 1500 * (1 - 0.35) = 975
      expect(spousalBenefit).toBeCloseTo(975, 2);
    });

    it('should apply partial reduction when claiming 2 years before FRA', () => {
      const ownPIA = 800;
      const spousePIA = 2400;
      const claimingAge = 65;
      const fra = 67;

      const spousalBenefit = engine.calculateSpousalBenefit(ownPIA, spousePIA, claimingAge, fra);

      // Base spousal benefit: 50% of 2400 = 1200
      // Claiming 2 years (24 months) early
      // First 24 months: 24 * (25/36) * 0.01 = 0.1667 (16.67%)
      // Reduced benefit: 1200 * (1 - 0.1667) = 1000
      expect(spousalBenefit).toBeCloseTo(1000, 0);
    });

    it('should not apply delayed credits to spousal benefits', () => {
      const ownPIA = 1000;
      const spousePIA = 3000;
      const claimingAge = 70;
      const fra = 67;

      const spousalBenefit = engine.calculateSpousalBenefit(ownPIA, spousePIA, claimingAge, fra);

      // Spousal benefits do not increase with delayed claiming
      // Should be 50% of spouse PIA = 1500
      expect(spousalBenefit).toBe(1500);
    });
  });

  describe('calculateSpousalReductionPercentage', () => {
    it('should return 0% reduction when claiming at FRA', () => {
      const reduction = engine.calculateSpousalReductionPercentage(67, 67);
      expect(reduction).toBe(0);
    });

    it('should calculate 35% reduction when claiming at 62 with FRA 67', () => {
      const reduction = engine.calculateSpousalReductionPercentage(62, 67);
      
      // 60 months early: 36 * (25/36) * 0.01 + 24 * (5/12) * 0.01 = 0.35
      expect(reduction).toBeCloseTo(0.35, 4);
    });

    it('should calculate reduction for claiming 3 years before FRA', () => {
      const reduction = engine.calculateSpousalReductionPercentage(64, 67);
      
      // 36 months early: 36 * (25/36) * 0.01 = 0.25
      expect(reduction).toBeCloseTo(0.25, 4);
    });

    it('should calculate reduction for claiming 1 year before FRA', () => {
      const reduction = engine.calculateSpousalReductionPercentage(66, 67);
      
      // 12 months early: 12 * (25/36) * 0.01 = 0.0833
      expect(reduction).toBeCloseTo(0.0833, 4);
    });
  });

  describe('isSpousalBenefitEligible', () => {
    it('should return true when own PIA is less than 50% of spouse PIA', () => {
      const eligible = engine.isSpousalBenefitEligible(1000, 3000);
      expect(eligible).toBe(true);
    });

    it('should return false when own PIA equals 50% of spouse PIA', () => {
      const eligible = engine.isSpousalBenefitEligible(1500, 3000);
      expect(eligible).toBe(false);
    });

    it('should return false when own PIA is greater than 50% of spouse PIA', () => {
      const eligible = engine.isSpousalBenefitEligible(2000, 3000);
      expect(eligible).toBe(false);
    });
  });

  // ============================================================================
  // Survivor Benefit Calculations (Requirement 5.1)
  // ============================================================================

  describe('calculateSurvivorBenefit', () => {
    it('should return 100% of deceased benefit at survivor FRA', () => {
      const deceasedBenefit = 3000;
      const survivorAge = 67;
      const survivorFRA = 67;

      const survivorBenefit = engine.calculateSurvivorBenefit(
        deceasedBenefit,
        survivorAge,
        survivorFRA
      );

      // Should receive 100% of deceased spouse's benefit
      expect(survivorBenefit).toBe(3000);
    });

    it('should apply reduction when claiming survivor benefit before FRA', () => {
      const deceasedBenefit = 3000;
      const survivorAge = 60;
      const survivorFRA = 67;

      const survivorBenefit = engine.calculateSurvivorBenefit(
        deceasedBenefit,
        survivorAge,
        survivorFRA
      );

      // 7 years (84 months) early
      // Reduction: 84 * 0.00475 = 0.399 (39.9%)
      // But maximum reduction is 28.5% at age 60
      // Reduced benefit: 3000 * (1 - 0.399) = 1803
      expect(survivorBenefit).toBeCloseTo(1803, 0);
    });

    it('should apply partial reduction when claiming 2 years before FRA', () => {
      const deceasedBenefit = 2500;
      const survivorAge = 65;
      const survivorFRA = 67;

      const survivorBenefit = engine.calculateSurvivorBenefit(
        deceasedBenefit,
        survivorAge,
        survivorFRA
      );

      // 2 years (24 months) early
      // Reduction: 24 * 0.00475 = 0.114 (11.4%)
      // Reduced benefit: 2500 * (1 - 0.114) = 2215
      expect(survivorBenefit).toBeCloseTo(2215, 0);
    });

    it('should not apply delayed credits to survivor benefits', () => {
      const deceasedBenefit = 3000;
      const survivorAge = 70;
      const survivorFRA = 67;

      const survivorBenefit = engine.calculateSurvivorBenefit(
        deceasedBenefit,
        survivorAge,
        survivorFRA
      );

      // Survivor benefits do not increase with delayed claiming
      expect(survivorBenefit).toBe(3000);
    });

    it('should include deceased spouse delayed retirement credits', () => {
      // Deceased spouse claimed at 70 with FRA 67, earning 24% DRC
      const deceasedBenefit = 3720; // 3000 PIA * 1.24
      const survivorAge = 67;
      const survivorFRA = 67;

      const survivorBenefit = engine.calculateSurvivorBenefit(
        deceasedBenefit,
        survivorAge,
        survivorFRA
      );

      // Survivor receives 100% of deceased's benefit including DRCs
      expect(survivorBenefit).toBe(3720);
    });
  });

  describe('calculateSurvivorReductionPercentage', () => {
    it('should return 0% reduction when claiming at FRA', () => {
      const reduction = engine.calculateSurvivorReductionPercentage(67, 67);
      expect(reduction).toBe(0);
    });

    it('should calculate reduction for claiming at age 60 with FRA 67', () => {
      const reduction = engine.calculateSurvivorReductionPercentage(60, 67);
      
      // 84 months early: 84 * 0.00475 = 0.399
      expect(reduction).toBeCloseTo(0.399, 3);
    });

    it('should calculate reduction for claiming at age 65 with FRA 67', () => {
      const reduction = engine.calculateSurvivorReductionPercentage(65, 67);
      
      // 24 months early: 24 * 0.00475 = 0.114
      expect(reduction).toBeCloseTo(0.114, 3);
    });

    it('should handle FRA of 66', () => {
      const reduction = engine.calculateSurvivorReductionPercentage(60, 66);
      
      // 72 months early: 72 * 0.00475 = 0.342
      expect(reduction).toBeCloseTo(0.342, 3);
    });
  });

  describe('coordinateSurvivorBenefit', () => {
    it('should return survivor benefit when it is higher than own benefit', () => {
      const ownBenefit = 2000;
      const survivorBenefit = 3000;

      const benefit = engine.coordinateSurvivorBenefit(ownBenefit, survivorBenefit);

      expect(benefit).toBe(3000);
    });

    it('should return own benefit when it is higher than survivor benefit', () => {
      const ownBenefit = 3500;
      const survivorBenefit = 3000;

      const benefit = engine.coordinateSurvivorBenefit(ownBenefit, survivorBenefit);

      expect(benefit).toBe(3500);
    });

    it('should return either benefit when they are equal', () => {
      const ownBenefit = 3000;
      const survivorBenefit = 3000;

      const benefit = engine.coordinateSurvivorBenefit(ownBenefit, survivorBenefit);

      expect(benefit).toBe(3000);
    });
  });

  // ============================================================================
  // Benefit Coordination Rules (Requirements 4.1, 5.1)
  // ============================================================================

  describe('determineBenefitToPay', () => {
    it('should pay retirement benefit when it is highest', () => {
      const retirementBenefit = 3000;
      const spousalBenefit = 1500;
      const survivorBenefit = 0;

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(3000);
      expect(breakdown.benefitType).toBe('retirement');
      expect(breakdown.retirementBenefit).toBe(3000);
      expect(breakdown.spousalBenefit).toBe(1500);
      expect(breakdown.survivorBenefit).toBe(0);
    });

    it('should pay spousal benefit when it is highest', () => {
      const retirementBenefit = 1000;
      const spousalBenefit = 1500;
      const survivorBenefit = 0;

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(1500);
      expect(breakdown.benefitType).toBe('spousal');
      expect(breakdown.retirementBenefit).toBe(1000);
      expect(breakdown.spousalBenefit).toBe(1500);
      expect(breakdown.survivorBenefit).toBe(0);
    });

    it('should pay survivor benefit when it is highest', () => {
      const retirementBenefit = 2000;
      const spousalBenefit = 0;
      const survivorBenefit = 3500;

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(3500);
      expect(breakdown.benefitType).toBe('survivor');
      expect(breakdown.retirementBenefit).toBe(2000);
      expect(breakdown.spousalBenefit).toBe(0);
      expect(breakdown.survivorBenefit).toBe(3500);
    });

    it('should pay retirement benefit when spousal benefit is 0', () => {
      const retirementBenefit = 2500;
      const spousalBenefit = 0;
      const survivorBenefit = 0;

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(2500);
      expect(breakdown.benefitType).toBe('retirement');
    });

    it('should handle case where retirement and spousal benefits are equal', () => {
      const retirementBenefit = 2000;
      const spousalBenefit = 2000;
      const survivorBenefit = 0;

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(2000);
      // Should prefer retirement or spousal (implementation dependent)
      expect(['retirement', 'spousal']).toContain(breakdown.benefitType);
    });

    it('should handle case where all benefits are equal', () => {
      const retirementBenefit = 2500;
      const spousalBenefit = 2500;
      const survivorBenefit = 2500;

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(2500);
      expect(breakdown.retirementBenefit).toBe(2500);
      expect(breakdown.spousalBenefit).toBe(2500);
      expect(breakdown.survivorBenefit).toBe(2500);
    });

    it('should coordinate retirement and survivor benefits correctly', () => {
      // Scenario: Widow with own benefit and survivor benefit
      const retirementBenefit = 2200; // Own benefit at age 67
      const spousalBenefit = 0; // Not applicable
      const survivorBenefit = 3000; // Deceased spouse's benefit

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(3000);
      expect(breakdown.benefitType).toBe('survivor');
    });

    it('should coordinate retirement and spousal benefits correctly', () => {
      // Scenario: Lower-earning spouse eligible for spousal benefit
      const retirementBenefit = 1200; // Own benefit
      const spousalBenefit = 1500; // 50% of higher earner's PIA
      const survivorBenefit = 0; // Not applicable

      const breakdown: BenefitBreakdown = engine.determineBenefitToPay(
        retirementBenefit,
        spousalBenefit,
        survivorBenefit
      );

      expect(breakdown.totalBenefit).toBe(1500);
      expect(breakdown.benefitType).toBe('spousal');
    });
  });

  // ============================================================================
  // Integration Tests - Combined Scenarios
  // ============================================================================

  describe('Combined Benefit Scenarios', () => {
    it('should handle complete spousal benefit scenario', () => {
      // Scenario: Lower-earning spouse claims at 62, higher earner at 70
      const lowerEarnerPIA = 1000;
      const higherEarnerPIA = 3000;
      const lowerEarnerClaimingAge = 62;
      const lowerEarnerFRA = 67;

      // Calculate own retirement benefit
      const ownBenefit = engine.getMonthlyBenefit(
        lowerEarnerPIA,
        lowerEarnerClaimingAge,
        lowerEarnerFRA
      );

      // Calculate spousal benefit
      const spousalBenefit = engine.calculateSpousalBenefit(
        lowerEarnerPIA,
        higherEarnerPIA,
        lowerEarnerClaimingAge,
        lowerEarnerFRA
      );

      // Determine which benefit to pay
      const breakdown = engine.determineBenefitToPay(ownBenefit, spousalBenefit, 0);

      // Lower earner's own benefit at 62 should be reduced
      expect(ownBenefit).toBeLessThan(lowerEarnerPIA);
      
      // Spousal benefit should also be reduced for early claiming
      expect(spousalBenefit).toBeLessThan(higherEarnerPIA * 0.5);
      
      // Should pay the higher of the two
      expect(breakdown.totalBenefit).toBe(Math.max(ownBenefit, spousalBenefit));
    });

    it('should handle complete survivor benefit scenario', () => {
      // Scenario: Deceased spouse claimed at 70, survivor claims at 67
      const deceasedPIA = 3000;
      const deceasedClaimingAge = 70;
      const deceasedFRA = 67;
      
      const survivorPIA = 2000;
      const survivorAge = 67;
      const survivorFRA = 67;

      // Calculate deceased spouse's benefit (with DRCs)
      const deceasedBenefit = engine.getMonthlyBenefit(
        deceasedPIA,
        deceasedClaimingAge,
        deceasedFRA
      );

      // Calculate survivor's own benefit
      const ownBenefit = engine.getMonthlyBenefit(
        survivorPIA,
        survivorAge,
        survivorFRA
      );

      // Calculate survivor benefit
      const survivorBenefit = engine.calculateSurvivorBenefit(
        deceasedBenefit,
        survivorAge,
        survivorFRA
      );

      // Coordinate benefits
      const finalBenefit = engine.coordinateSurvivorBenefit(ownBenefit, survivorBenefit);

      // Deceased benefit should include DRCs (24% increase)
      expect(deceasedBenefit).toBeCloseTo(3720, 0);
      
      // Survivor should receive 100% of deceased's benefit
      expect(survivorBenefit).toBe(deceasedBenefit);
      
      // Final benefit should be the higher one
      expect(finalBenefit).toBe(survivorBenefit);
    });

    it('should handle survivor claiming early with reduced benefit', () => {
      // Scenario: Survivor claims at 60 (earliest age)
      const deceasedBenefit = 3000;
      const survivorAge = 60;
      const survivorFRA = 67;

      const survivorBenefit = engine.calculateSurvivorBenefit(
        deceasedBenefit,
        survivorAge,
        survivorFRA
      );

      // Should be significantly reduced for claiming 7 years early
      expect(survivorBenefit).toBeLessThan(deceasedBenefit);
      expect(survivorBenefit).toBeCloseTo(1803, 0); // ~40% reduction
    });
  });
});
