/**
 * Integration test for complete couple calculation flow
 * 
 * Tests Requirements:
 * - 4.1: Spousal benefit coordination
 * - 5.1: Survivor benefit scenarios
 * - 6.1: Strategy comparison interface
 * - 9.1: Data export capability
 */

import request from 'supertest';
import express, { Application } from 'express';
import calculationRoutes from '../../routes/calculation.routes';
import { errorHandler } from '../../middleware/errorHandler.middleware';

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/calculate', calculationRoutes);
  app.use(errorHandler);
  return app;
};

describe('Couple Flow Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Complete Couple Calculation Flow', () => {
    const coupleInput = {
      spouse1: {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 95,
      },
      spouse2: {
        birthDate: '1962-06-15',
        pia: 2500,
        lifeExpectancy: 95,
      },
      inflationRate: 0.025,
    };

    it('should complete full couple calculation with all benefit types', async () => {
      // Submit couple calculation
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('type', 'couple');
      expect(response.body).toHaveProperty('couple');
      expect(response.body).toHaveProperty('metadata');

      const { couple, metadata } = response.body;

      // Verify optimal strategy
      expect(couple.optimalStrategy).toBeDefined();
      expect(couple.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(couple.optimalStrategy.spouse1ClaimingAge).toBeLessThanOrEqual(70);
      expect(couple.optimalStrategy.spouse2ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(couple.optimalStrategy.spouse2ClaimingAge).toBeLessThanOrEqual(70);

      // Verify combined benefits
      expect(couple.optimalStrategy.combinedMonthlyBenefit).toBeGreaterThan(0);
      expect(couple.optimalStrategy.combinedLifetimeBenefit).toBeGreaterThan(0);
      expect(couple.optimalStrategy.combinedPresentValue).toBeGreaterThan(0);

      // Verify FRAs are calculated
      expect(couple.spouse1Fra).toBeDefined();
      expect(couple.spouse2Fra).toBeDefined();
      expect(couple.higherEarnerSpouse).toBeDefined();
      expect([1, 2]).toContain(couple.higherEarnerSpouse);

      // Verify projections
      expect(couple.yearlyProjections).toBeDefined();
      expect(Array.isArray(couple.yearlyProjections)).toBe(true);
      expect(couple.yearlyProjections.length).toBeGreaterThan(0);

      // Verify metadata
      expect(metadata.discountRate).toBe(0.03);
      expect(metadata.calculatedAt).toBeDefined();
    });

    it('should verify spousal benefits are calculated correctly', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple } = response.body;

      // Verify spousal benefit amount is present
      expect(couple.optimalStrategy.spousalBenefitAmount).toBeDefined();
      expect(couple.optimalStrategy.spousalBenefitAmount).toBeGreaterThanOrEqual(0);

      // Check projections include spousal benefits
      const projectionsWithSpousal = couple.yearlyProjections.filter(
        (proj: any) => proj.spousalBenefit > 0
      );

      // If there's a spousal benefit, it should appear in projections
      if (couple.optimalStrategy.spousalBenefitAmount > 0) {
        expect(projectionsWithSpousal.length).toBeGreaterThan(0);
      }

      // Verify each projection has spousal benefit field
      couple.yearlyProjections.forEach((proj: any) => {
        expect(proj).toHaveProperty('spousalBenefit');
        expect(proj.spousalBenefit).toBeGreaterThanOrEqual(0);
      });
    });

    it('should verify survivor scenarios are displayed', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple } = response.body;

      // Verify survivor scenarios exist
      expect(couple.survivorScenarios).toBeDefined();
      expect(couple.survivorScenarios.spouse1Outlives).toBeDefined();
      expect(couple.survivorScenarios.spouse2Outlives).toBeDefined();

      // Verify spouse1 outlives scenario
      const s1Outlives = couple.survivorScenarios.spouse1Outlives;
      expect(s1Outlives.deceasedSpouse).toBe(2);
      expect(s1Outlives.yearOfDeath).toBeDefined();
      expect(s1Outlives.survivorBenefit).toBeGreaterThan(0);
      expect(s1Outlives.yearsAsSurvivor).toBeGreaterThanOrEqual(0);
      expect(s1Outlives.totalSurvivorBenefit).toBeGreaterThanOrEqual(0);
      expect(s1Outlives.presentValueSurvivorBenefit).toBeGreaterThanOrEqual(0);

      // Verify spouse2 outlives scenario
      const s2Outlives = couple.survivorScenarios.spouse2Outlives;
      expect(s2Outlives.deceasedSpouse).toBe(1);
      expect(s2Outlives.yearOfDeath).toBeDefined();
      expect(s2Outlives.survivorBenefit).toBeGreaterThan(0);
      expect(s2Outlives.yearsAsSurvivor).toBeGreaterThanOrEqual(0);
      expect(s2Outlives.totalSurvivorBenefit).toBeGreaterThanOrEqual(0);
      expect(s2Outlives.presentValueSurvivorBenefit).toBeGreaterThanOrEqual(0);
    });

    it('should verify survivor benefits in projections', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple } = response.body;

      // Check that projections include survivor benefit field
      couple.yearlyProjections.forEach((proj: any) => {
        expect(proj).toHaveProperty('survivorBenefit');
        expect(proj.survivorBenefit).toBeGreaterThanOrEqual(0);
      });

      // Note: Survivor benefits are modeled in separate survivor scenarios
      // The main couple projections assume both spouses are alive
      // Survivor benefits appear in survivorScenarios.spouse1Outlives and spouse2Outlives
      expect(couple.survivorScenarios).toBeDefined();
      expect(couple.survivorScenarios.spouse1Outlives.yearlyProjections).toBeDefined();
      expect(couple.survivorScenarios.spouse2Outlives.yearlyProjections).toBeDefined();
    });

    it('should test strategy comparison', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple } = response.body;

      // Should have multiple strategies to compare
      expect(couple.allStrategies).toBeDefined();
      expect(couple.allStrategies.length).toBe(81); // 9x9 combinations

      // Each strategy should have required fields
      couple.allStrategies.forEach((strategy: any) => {
        expect(strategy).toHaveProperty('spouse1ClaimingAge');
        expect(strategy).toHaveProperty('spouse2ClaimingAge');
        expect(strategy).toHaveProperty('combinedLifetimeBenefit');
        expect(strategy).toHaveProperty('combinedPresentValue');
        expect(strategy).toHaveProperty('description');
      });

      // Optimal strategy should have highest combined benefit
      const optimalStrategy = couple.allStrategies.find(
        (s: any) =>
          s.spouse1ClaimingAge === couple.optimalStrategy.spouse1ClaimingAge &&
          s.spouse2ClaimingAge === couple.optimalStrategy.spouse2ClaimingAge
      );
      expect(optimalStrategy).toBeDefined();
      expect(optimalStrategy.combinedLifetimeBenefit).toBe(
        couple.optimalStrategy.combinedLifetimeBenefit
      );

      // Compare optimal with another strategy
      const alternativeStrategy = couple.allStrategies.find(
        (s: any) =>
          s.spouse1ClaimingAge !== couple.optimalStrategy.spouse1ClaimingAge ||
          s.spouse2ClaimingAge !== couple.optimalStrategy.spouse2ClaimingAge
      );

      if (alternativeStrategy) {
        const difference =
          couple.optimalStrategy.combinedLifetimeBenefit -
          alternativeStrategy.combinedLifetimeBenefit;
        expect(difference).toBeGreaterThanOrEqual(0);
      }
    });

    it('should provide alternative strategies within 2%', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple } = response.body;

      // Should have alternative strategies
      expect(couple.alternativeStrategies).toBeDefined();
      expect(Array.isArray(couple.alternativeStrategies)).toBe(true);

      // Each alternative should be within 2% of optimal
      const optimalBenefit = couple.optimalStrategy.combinedLifetimeBenefit;
      couple.alternativeStrategies.forEach((strategy: any) => {
        const difference = Math.abs(strategy.combinedLifetimeBenefit - optimalBenefit);
        const percentDiff = (difference / optimalBenefit) * 100;
        expect(percentDiff).toBeLessThanOrEqual(2);
      });
    });

    it('should verify projections span both spouses lifetimes', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple } = response.body;
      const projections = couple.yearlyProjections;

      // Projections should start when first spouse claims
      const firstProjection = projections[0];
      expect(firstProjection.year).toBeDefined();
      expect(firstProjection.spouse1Age).toBeDefined();
      expect(firstProjection.spouse2Age).toBeDefined();

      // Projections should extend to longer-lived spouse's life expectancy
      const lastProjection = projections[projections.length - 1];
      const maxLE = Math.max(
        coupleInput.spouse1.lifeExpectancy,
        coupleInput.spouse2.lifeExpectancy
      );
      expect(
        lastProjection.spouse1Age <= maxLE + 1 || lastProjection.spouse2Age <= maxLE + 1
      ).toBe(true);

      // Each projection should have all benefit types
      projections.forEach((proj: any) => {
        expect(proj).toHaveProperty('year');
        expect(proj).toHaveProperty('spouse1Age');
        expect(proj).toHaveProperty('spouse2Age');
        expect(proj).toHaveProperty('spouse1RetirementBenefit');
        expect(proj).toHaveProperty('spouse2RetirementBenefit');
        expect(proj).toHaveProperty('spousalBenefit');
        expect(proj).toHaveProperty('survivorBenefit');
        expect(proj).toHaveProperty('totalAnnualBenefit');
        expect(proj).toHaveProperty('inflationAdjustedTotal');
        expect(proj).toHaveProperty('cumulativeBenefit');
      });
    });

    it('should handle discount rate adjustment for couples', async () => {
      // Test with default discount rate
      const response1 = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const pv1 = response1.body.couple.optimalPresentValue;

      // Test with higher discount rate
      const response2 = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send({ ...coupleInput, discountRate: 0.06 })
        .expect(200);

      const pv2 = response2.body.couple.optimalPresentValue;

      // Higher discount rate should result in lower present value
      expect(pv2).toBeLessThan(pv1);
      expect(response2.body.metadata.discountRate).toBe(0.06);
    });

    it('should verify higher earner identification', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple } = response.body;

      // Higher earner should be spouse 1 (PIA 3000 > 2500)
      expect(couple.higherEarnerSpouse).toBe(1);

      // Test with reversed PIAs
      const reversedInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 2000,
          lifeExpectancy: 85,
        },
        spouse2: {
          birthDate: '1962-06-15',
          pia: 3500,
          lifeExpectancy: 87,
        },
        inflationRate: 0.025,
      };

      const response2 = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(reversedInput)
        .expect(200);

      // Higher earner should be spouse 2
      expect(response2.body.couple.higherEarnerSpouse).toBe(2);
    });
  });

  describe('Export Functionality for Couples', () => {
    it('should provide all data needed for CSV export', async () => {
      const coupleInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 85,
        },
        spouse2: {
          birthDate: '1962-06-15',
          pia: 2500,
          lifeExpectancy: 87,
        },
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(coupleInput)
        .expect(200);

      const { couple, metadata } = response.body;

      // Verify all export-required data is present
      expect(metadata.calculatedAt).toBeDefined();
      expect(metadata.assumptions).toBeDefined();
      expect(metadata.discountRate).toBeDefined();

      // Summary information for both spouses
      expect(couple.optimalStrategy.spouse1ClaimingAge).toBeDefined();
      expect(couple.optimalStrategy.spouse2ClaimingAge).toBeDefined();
      expect(couple.optimalStrategy.combinedLifetimeBenefit).toBeDefined();
      expect(couple.optimalPresentValue).toBeDefined();

      // Year-by-year projections with all benefit types
      expect(couple.yearlyProjections).toBeDefined();
      expect(couple.yearlyProjections.length).toBeGreaterThan(0);

      couple.yearlyProjections.forEach((proj: any) => {
        expect(proj.year).toBeDefined();
        expect(proj.spouse1Age).toBeDefined();
        expect(proj.spouse2Age).toBeDefined();
        expect(proj.spouse1RetirementBenefit).toBeDefined();
        expect(proj.spouse2RetirementBenefit).toBeDefined();
        expect(proj.spousalBenefit).toBeDefined();
        expect(proj.survivorBenefit).toBeDefined();
        expect(proj.totalAnnualBenefit).toBeDefined();
      });

      // Survivor scenarios for export
      expect(couple.survivorScenarios.spouse1Outlives).toBeDefined();
      expect(couple.survivorScenarios.spouse2Outlives).toBeDefined();
    });
  });
});
