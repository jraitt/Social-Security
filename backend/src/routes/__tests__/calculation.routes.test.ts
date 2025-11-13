/**
 * Integration tests for calculation routes
 * 
 * Tests the enhanced individual and couple calculation endpoints
 * as specified in Requirements 10.1 and 10.2
 */

import request from 'supertest';
import express, { Application } from 'express';
import calculationRoutes from '../calculation.routes';
import { errorHandler } from '../../middleware/errorHandler.middleware';

// Create test app
const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/calculate', calculationRoutes);
  app.use(errorHandler);
  return app;
};

describe('Enhanced Calculation Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/calculate/enhanced/individual', () => {
    const validIndividualInput = {
      birthDate: '1960-01-01',
      pia: 3000,
      lifeExpectancy: 85,
      inflationRate: 0.025,
    };

    it('should calculate optimal strategy for individual without discount rate', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(validIndividualInput)
        .expect(200);

      expect(response.body).toHaveProperty('type', 'individual');
      expect(response.body).toHaveProperty('individual');
      expect(response.body).toHaveProperty('metadata');
      
      const { individual, metadata } = response.body;
      
      // Check optimal strategy fields
      expect(individual).toHaveProperty('optimalAge');
      expect(individual.optimalAge).toBeGreaterThanOrEqual(62);
      expect(individual.optimalAge).toBeLessThanOrEqual(70);
      expect(individual).toHaveProperty('optimalMonthlyBenefit');
      expect(individual).toHaveProperty('optimalLifetimeBenefit');
      expect(individual).toHaveProperty('optimalPresentValue');
      expect(individual).toHaveProperty('fra');
      
      // Check projections
      expect(individual).toHaveProperty('yearlyProjections');
      expect(Array.isArray(individual.yearlyProjections)).toBe(true);
      expect(individual.yearlyProjections.length).toBeGreaterThan(0);
      
      // Check strategies
      expect(individual).toHaveProperty('allStrategies');
      expect(Array.isArray(individual.allStrategies)).toBe(true);
      expect(individual.allStrategies.length).toBe(9); // Ages 62-70
      
      // Check metadata
      expect(metadata).toHaveProperty('calculatedAt');
      expect(metadata).toHaveProperty('discountRate', 0.03); // Default
      expect(metadata.assumptions).toHaveProperty('inflationRate', 0.025);
    });

    it('should calculate optimal strategy with custom discount rate', async () => {
      const inputWithDiscountRate = {
        ...validIndividualInput,
        discountRate: 0.05,
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(inputWithDiscountRate)
        .expect(200);

      expect(response.body.metadata.discountRate).toBe(0.05);
      expect(response.body.individual.optimalPresentValue).toBeGreaterThan(0);
    });

    it('should return validation error for missing required fields', async () => {
      const invalidInput = {
        birthDate: '1960-01-01',
        // Missing pia, lifeExpectancy, inflationRate
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(invalidInput)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
      expect(Array.isArray(response.body.error.details)).toBe(true);
    });

    it('should return validation error for invalid discount rate', async () => {
      const invalidInput = {
        ...validIndividualInput,
        discountRate: 0.15, // Above 10%
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(invalidInput)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.some((d: any) => 
        d.message.includes('Discount rate')
      )).toBe(true);
    });

    it('should return validation error for invalid PIA', async () => {
      const invalidInput = {
        ...validIndividualInput,
        pia: 6000, // Above $5000
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(invalidInput)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid life expectancy', async () => {
      const invalidInput = {
        ...validIndividualInput,
        lifeExpectancy: 60, // Below minimum
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(invalidInput)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/calculate/enhanced/couple', () => {
    const validCoupleInput = {
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
    };

    it('should calculate optimal strategy for couple without discount rate', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(validCoupleInput)
        .expect(200);

      expect(response.body).toHaveProperty('type', 'couple');
      expect(response.body).toHaveProperty('couple');
      expect(response.body).toHaveProperty('metadata');
      
      const { couple, metadata } = response.body;
      
      // Check optimal strategy
      expect(couple).toHaveProperty('optimalStrategy');
      expect(couple.optimalStrategy).toHaveProperty('spouse1ClaimingAge');
      expect(couple.optimalStrategy).toHaveProperty('spouse2ClaimingAge');
      expect(couple.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(couple.optimalStrategy.spouse1ClaimingAge).toBeLessThanOrEqual(70);
      expect(couple.optimalStrategy.spouse2ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(couple.optimalStrategy.spouse2ClaimingAge).toBeLessThanOrEqual(70);
      
      // Check benefits
      expect(couple.optimalStrategy).toHaveProperty('combinedMonthlyBenefit');
      expect(couple.optimalStrategy).toHaveProperty('combinedLifetimeBenefit');
      expect(couple.optimalStrategy).toHaveProperty('combinedPresentValue');
      
      // Check FRAs
      expect(couple).toHaveProperty('spouse1Fra');
      expect(couple).toHaveProperty('spouse2Fra');
      expect(couple).toHaveProperty('higherEarnerSpouse');
      
      // Check projections
      expect(couple).toHaveProperty('yearlyProjections');
      expect(Array.isArray(couple.yearlyProjections)).toBe(true);
      expect(couple.yearlyProjections.length).toBeGreaterThan(0);
      
      // Check survivor scenarios
      expect(couple).toHaveProperty('survivorScenarios');
      expect(couple.survivorScenarios).toHaveProperty('spouse1Outlives');
      expect(couple.survivorScenarios).toHaveProperty('spouse2Outlives');
      
      // Check strategies
      expect(couple).toHaveProperty('allStrategies');
      expect(Array.isArray(couple.allStrategies)).toBe(true);
      expect(couple.allStrategies.length).toBe(81); // 9x9 combinations
      
      // Check metadata
      expect(metadata).toHaveProperty('calculatedAt');
      expect(metadata).toHaveProperty('discountRate', 0.03); // Default
    });

    it('should calculate optimal strategy with custom discount rate', async () => {
      const inputWithDiscountRate = {
        ...validCoupleInput,
        discountRate: 0.04,
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(inputWithDiscountRate)
        .expect(200);

      expect(response.body.metadata.discountRate).toBe(0.04);
      expect(response.body.couple.optimalPresentValue).toBeGreaterThan(0);
    });

    it('should return validation error for missing spouse data', async () => {
      const invalidInput = {
        spouse1: {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 85,
        },
        // Missing spouse2
        inflationRate: 0.025,
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(invalidInput)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid discount rate', async () => {
      const invalidInput = {
        ...validCoupleInput,
        discountRate: -0.01, // Negative
      };

      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(invalidInput)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle spousal benefits correctly', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(validCoupleInput)
        .expect(200);

      const { optimalStrategy } = response.body.couple;
      
      // Check that spousal benefit is calculated
      expect(optimalStrategy).toHaveProperty('spousalBenefitAmount');
      expect(optimalStrategy.spousalBenefitAmount).toBeGreaterThanOrEqual(0);
    });

    it('should include survivor scenarios in projections', async () => {
      const response = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(validCoupleInput)
        .expect(200);

      const { survivorScenarios } = response.body.couple;
      
      // Check spouse1 outlives scenario
      expect(survivorScenarios.spouse1Outlives).toHaveProperty('deceasedSpouse', 2);
      expect(survivorScenarios.spouse1Outlives).toHaveProperty('survivorBenefit');
      expect(survivorScenarios.spouse1Outlives).toHaveProperty('totalSurvivorBenefit');
      
      // Check spouse2 outlives scenario
      expect(survivorScenarios.spouse2Outlives).toHaveProperty('deceasedSpouse', 1);
      expect(survivorScenarios.spouse2Outlives).toHaveProperty('survivorBenefit');
      expect(survivorScenarios.spouse2Outlives).toHaveProperty('totalSurvivorBenefit');
    });
  });

  describe('Backward Compatibility', () => {
    it('should still support original individual endpoint', async () => {
      const input = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
      };

      const response = await request(app)
        .post('/api/calculate/individual')
        .send(input)
        .expect(200);

      // Original endpoint should still work
      expect(response.body).toHaveProperty('optimalAge');
      expect(response.body).toHaveProperty('optimalMonthlyBenefit');
    });

    it('should still support original couple endpoint', async () => {
      const input = {
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
      };

      const response = await request(app)
        .post('/api/calculate/couple')
        .send(input)
        .expect(200);

      // Original endpoint should still work
      expect(response.body).toHaveProperty('optimalStrategy');
    });
  });
});
