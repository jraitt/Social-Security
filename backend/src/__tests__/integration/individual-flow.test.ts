/**
 * Integration test for complete individual calculation flow
 * 
 * Tests Requirements:
 * - 1.1: Enhanced calculation engine
 * - 2.1: Year-by-year benefit projections
 * - 3.1: Present value calculations
 * - 8.1: Discount rate configuration
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

describe('Individual Flow Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Complete Individual Calculation Flow', () => {
    const individualInput = {
      birthDate: '1960-01-01',
      pia: 3000,
      lifeExpectancy: 85,
      inflationRate: 0.025,
    };

    it('should complete full individual calculation with projections', async () => {
      // Submit individual calculation
      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('type', 'individual');
      expect(response.body).toHaveProperty('individual');
      expect(response.body).toHaveProperty('metadata');

      const { individual, metadata } = response.body;

      // Verify optimal strategy is calculated
      expect(individual.optimalAge).toBeGreaterThanOrEqual(62);
      expect(individual.optimalAge).toBeLessThanOrEqual(70);
      expect(individual.optimalMonthlyBenefit).toBeGreaterThan(0);
      expect(individual.optimalLifetimeBenefit).toBeGreaterThan(0);

      // Verify projections are displayed
      expect(individual.yearlyProjections).toBeDefined();
      expect(Array.isArray(individual.yearlyProjections)).toBe(true);
      expect(individual.yearlyProjections.length).toBeGreaterThan(0);

      // Verify each projection has required fields
      const firstProjection = individual.yearlyProjections[0];
      expect(firstProjection).toHaveProperty('year');
      expect(firstProjection).toHaveProperty('age');
      expect(firstProjection).toHaveProperty('retirementBenefit');
      expect(firstProjection).toHaveProperty('inflationAdjustedBenefit');
      expect(firstProjection).toHaveProperty('cumulativeBenefit');

      // Verify present value is calculated
      expect(individual.optimalPresentValue).toBeGreaterThan(0);
      expect(individual.optimalPresentValue).toBeLessThan(individual.optimalLifetimeBenefit);

      // Verify metadata includes discount rate
      expect(metadata.discountRate).toBe(0.03); // Default
      expect(metadata.calculatedAt).toBeDefined();
      expect(metadata.assumptions).toBeDefined();
    });

    it('should handle discount rate adjustment', async () => {
      // Test with default discount rate (3%)
      const response1 = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      const pv1 = response1.body.individual.optimalPresentValue;

      // Test with higher discount rate (5%)
      const response2 = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send({ ...individualInput, discountRate: 0.05 })
        .expect(200);

      const pv2 = response2.body.individual.optimalPresentValue;

      // Higher discount rate should result in lower present value
      expect(pv2).toBeLessThan(pv1);
      expect(response2.body.metadata.discountRate).toBe(0.05);

      // Test with lower discount rate (1%)
      const response3 = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send({ ...individualInput, discountRate: 0.01 })
        .expect(200);

      const pv3 = response3.body.individual.optimalPresentValue;

      // Lower discount rate should result in higher present value
      expect(pv3).toBeGreaterThan(pv1);
      expect(response3.body.metadata.discountRate).toBe(0.01);
    });

    it('should verify all strategies are evaluated', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      const { individual } = response.body;

      // Should have 9 strategies (ages 62-70)
      expect(individual.allStrategies).toBeDefined();
      expect(individual.allStrategies.length).toBe(9);

      // Each strategy should have required fields
      individual.allStrategies.forEach((strategy: any) => {
        expect(strategy).toHaveProperty('claimingAge');
        expect(strategy).toHaveProperty('monthlyBenefit');
        expect(strategy).toHaveProperty('lifetimeBenefit');
        expect(strategy).toHaveProperty('presentValue');
        expect(strategy).toHaveProperty('yearlyProjections');
        expect(strategy).toHaveProperty('description');
      });

      // Optimal strategy should have highest lifetime benefit
      const optimalStrategy = individual.allStrategies.find(
        (s: any) => s.claimingAge === individual.optimalAge
      );
      expect(optimalStrategy).toBeDefined();
      expect(optimalStrategy.lifetimeBenefit).toBe(individual.optimalLifetimeBenefit);
    });

    it('should provide alternative strategies within 2%', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      const { individual } = response.body;

      // Should have alternative strategies
      expect(individual.alternativeStrategies).toBeDefined();
      expect(Array.isArray(individual.alternativeStrategies)).toBe(true);

      // Each alternative should be within 2% of optimal
      const optimalBenefit = individual.optimalLifetimeBenefit;
      individual.alternativeStrategies.forEach((strategy: any) => {
        const difference = Math.abs(strategy.lifetimeBenefit - optimalBenefit);
        const percentDiff = (difference / optimalBenefit) * 100;
        expect(percentDiff).toBeLessThanOrEqual(2);
      });
    });

    it('should verify comparison with age 62', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      const { individual } = response.body;

      // Should have comparison with age 62
      expect(individual.comparisonWithAge62).toBeDefined();
      expect(individual.comparisonWithAge62).toHaveProperty('age62LifetimeBenefit');
      expect(individual.comparisonWithAge62).toHaveProperty('age62PresentValue');
      expect(individual.comparisonWithAge62).toHaveProperty('additionalLifetimeBenefit');
      expect(individual.comparisonWithAge62).toHaveProperty('additionalPresentValue');
      expect(individual.comparisonWithAge62).toHaveProperty('percentageIncrease');

      // Optimal should be better than age 62 (unless optimal is 62)
      if (individual.optimalAge > 62) {
        expect(individual.comparisonWithAge62.additionalLifetimeBenefit).toBeGreaterThan(0);
        expect(individual.comparisonWithAge62.percentageIncrease).toBeGreaterThan(0);
      }
    });

    it('should verify projections span from claiming age to life expectancy', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      const { individual } = response.body;
      const projections = individual.yearlyProjections;

      // First projection should be at claiming age
      const firstProjection = projections[0];
      expect(firstProjection.age).toBe(individual.optimalAge);

      // Last projection should be at or near life expectancy
      const lastProjection = projections[projections.length - 1];
      expect(lastProjection.age).toBeLessThanOrEqual(individualInput.lifeExpectancy);
      expect(lastProjection.age).toBeGreaterThanOrEqual(individualInput.lifeExpectancy - 1);

      // Projections should be consecutive years
      for (let i = 1; i < projections.length; i++) {
        expect(projections[i].year).toBe(projections[i - 1].year + 1);
        expect(projections[i].age).toBe(projections[i - 1].age + 1);
      }
    });

    it('should verify cumulative benefits increase over time', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      const { individual } = response.body;
      const projections = individual.yearlyProjections;

      // Cumulative benefits should increase each year
      for (let i = 1; i < projections.length; i++) {
        expect(projections[i].cumulativeBenefit).toBeGreaterThan(
          projections[i - 1].cumulativeBenefit
        );
      }

      // Final cumulative should equal total lifetime benefit
      const finalCumulative = projections[projections.length - 1].cumulativeBenefit;
      expect(Math.abs(finalCumulative - individual.optimalLifetimeBenefit)).toBeLessThan(1);
    });

    it('should handle edge case: claiming at 62', async () => {
      const youngInput = {
        birthDate: '1970-01-01',
        pia: 2000,
        lifeExpectancy: 75, // Short life expectancy favors early claiming
        inflationRate: 0.025,
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(youngInput)
        .expect(200);

      expect(response.body.individual.optimalAge).toBeGreaterThanOrEqual(62);
      expect(response.body.individual.yearlyProjections.length).toBeGreaterThan(0);
    });

    it('should handle edge case: long life expectancy', async () => {
      const longLifeInput = {
        birthDate: '1960-01-01',
        pia: 3500,
        lifeExpectancy: 95, // Long life expectancy favors delayed claiming
        inflationRate: 0.025,
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(longLifeInput)
        .expect(200);

      expect(response.body.individual.optimalAge).toBeLessThanOrEqual(70);
      expect(response.body.individual.yearlyProjections.length).toBeGreaterThan(0);
    });
  });

  describe('Export Functionality Verification', () => {
    it('should provide all data needed for CSV export', async () => {
      const individualInput = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
        discountRate: 0.03,
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(individualInput)
        .expect(200);

      const { individual, metadata } = response.body;

      // Verify all export-required data is present
      expect(metadata.calculatedAt).toBeDefined();
      expect(metadata.assumptions).toBeDefined();
      expect(metadata.discountRate).toBeDefined();

      // Input parameters should be in assumptions
      expect(metadata.assumptions).toHaveProperty('inflationRate');

      // Summary information
      expect(individual.optimalAge).toBeDefined();
      expect(individual.optimalLifetimeBenefit).toBeDefined();
      expect(individual.optimalPresentValue).toBeDefined();

      // Year-by-year projections
      expect(individual.yearlyProjections).toBeDefined();
      expect(individual.yearlyProjections.length).toBeGreaterThan(0);

      // Each projection has exportable data
      individual.yearlyProjections.forEach((proj: any) => {
        expect(proj.year).toBeDefined();
        expect(proj.age).toBeDefined();
        expect(proj.retirementBenefit).toBeDefined();
        expect(proj.inflationAdjustedBenefit).toBeDefined();
        expect(proj.cumulativeBenefit).toBeDefined();
      });
    });
  });
});
