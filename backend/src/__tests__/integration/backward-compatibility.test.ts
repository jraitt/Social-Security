/**
 * Integration test for backward compatibility
 * 
 * Tests Requirements:
 * - 10.1: Backward compatibility with existing inputs
 * - 10.2: API endpoint compatibility
 * - 10.3: Result format compatibility
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

describe('Backward Compatibility Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Old API Endpoints Still Work', () => {
    it('should support original individual endpoint', async () => {
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

      // Original endpoint should return basic result format
      expect(response.body).toHaveProperty('optimalAge');
      expect(response.body).toHaveProperty('optimalMonthlyBenefit');
      expect(response.body).toHaveProperty('optimalLifetimeBenefit');
      expect(response.body).toHaveProperty('fra');

      // Verify values are reasonable
      expect(response.body.optimalAge).toBeGreaterThanOrEqual(62);
      expect(response.body.optimalAge).toBeLessThanOrEqual(70);
      expect(response.body.optimalMonthlyBenefit).toBeGreaterThan(0);
      expect(response.body.optimalLifetimeBenefit).toBeGreaterThan(0);
    });

    it('should support original couple endpoint', async () => {
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

      // Original endpoint should return basic result format
      expect(response.body).toHaveProperty('optimalStrategy');
      expect(response.body.optimalStrategy).toHaveProperty('spouse1ClaimingAge');
      expect(response.body.optimalStrategy).toHaveProperty('spouse2ClaimingAge');
      expect(response.body.optimalStrategy).toHaveProperty('combinedMonthlyBenefit');
      expect(response.body.optimalStrategy).toHaveProperty('combinedLifetimeBenefit');

      // Verify values are reasonable
      expect(response.body.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(response.body.optimalStrategy.spouse1ClaimingAge).toBeLessThanOrEqual(70);
      expect(response.body.optimalStrategy.spouse2ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(response.body.optimalStrategy.spouse2ClaimingAge).toBeLessThanOrEqual(70);
    });

    it('should handle old endpoint with all original parameters', async () => {
      const input = {
        birthDate: '1958-03-15',
        pia: 2800,
        lifeExpectancy: 82,
        inflationRate: 0.02,
      };

      const response = await request(app)
        .post('/api/calculate/individual')
        .send(input)
        .expect(200);

      expect(response.body.optimalAge).toBeDefined();
      expect(response.body.optimalMonthlyBenefit).toBeDefined();
      expect(response.body.optimalLifetimeBenefit).toBeDefined();
    });
  });

  describe('Old Result Format Still Supported', () => {
    it('should return compatible individual result structure', async () => {
      const input = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
      };

      const oldResponse = await request(app)
        .post('/api/calculate/individual')
        .send(input)
        .expect(200);

      const newResponse = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(input)
        .expect(200);

      // Both endpoints should return valid results with core fields
      expect(oldResponse.body.optimalAge).toBeGreaterThanOrEqual(62);
      expect(oldResponse.body.optimalAge).toBeLessThanOrEqual(70);
      expect(newResponse.body.individual.optimalAge).toBeGreaterThanOrEqual(62);
      expect(newResponse.body.individual.optimalAge).toBeLessThanOrEqual(70);
      
      // Both should have FRA
      expect(oldResponse.body.fra).toBe(newResponse.body.individual.fra);
      
      // Both should calculate monthly benefits
      expect(oldResponse.body.optimalMonthlyBenefit).toBeGreaterThan(0);
      expect(newResponse.body.individual.optimalMonthlyBenefit).toBeGreaterThan(0);
    });

    it('should return compatible couple result structure', async () => {
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

      const oldResponse = await request(app)
        .post('/api/calculate/couple')
        .send(input)
        .expect(200);

      const newResponse = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(input)
        .expect(200);

      // Both endpoints should return valid strategies
      expect(oldResponse.body.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(oldResponse.body.optimalStrategy.spouse1ClaimingAge).toBeLessThanOrEqual(70);
      expect(newResponse.body.couple.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(newResponse.body.couple.optimalStrategy.spouse1ClaimingAge).toBeLessThanOrEqual(70);
      
      // Both should calculate combined benefits
      expect(oldResponse.body.optimalStrategy.combinedMonthlyBenefit).toBeGreaterThan(0);
      expect(newResponse.body.couple.optimalStrategy.combinedMonthlyBenefit).toBeGreaterThan(0);
      expect(oldResponse.body.optimalStrategy.combinedLifetimeBenefit).toBeGreaterThan(0);
      expect(newResponse.body.couple.optimalStrategy.combinedLifetimeBenefit).toBeGreaterThan(0);
    });
  });

  describe('No Breaking Changes', () => {
    it('should accept all original individual input parameters', async () => {
      const inputs = [
        {
          birthDate: '1960-01-01',
          pia: 3000,
          lifeExpectancy: 85,
          inflationRate: 0.025,
        },
        {
          birthDate: '1955-12-31',
          pia: 2500,
          lifeExpectancy: 80,
          inflationRate: 0.03,
        },
        {
          birthDate: '1965-06-15',
          pia: 3500,
          lifeExpectancy: 90,
          inflationRate: 0.02,
        },
      ];

      for (const input of inputs) {
        const response = await request(app)
          .post('/api/calculate/individual')
          .send(input)
          .expect(200);

        expect(response.body.optimalAge).toBeDefined();
        expect(response.body.optimalMonthlyBenefit).toBeDefined();
      }
    });

    it('should accept all original couple input parameters', async () => {
      const inputs = [
        {
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
        },
        {
          spouse1: {
            birthDate: '1958-03-20',
            pia: 2800,
            lifeExpectancy: 82,
          },
          spouse2: {
            birthDate: '1959-11-10',
            pia: 3200,
            lifeExpectancy: 84,
          },
          inflationRate: 0.02,
        },
      ];

      for (const input of inputs) {
        const response = await request(app)
          .post('/api/calculate/couple')
          .send(input)
          .expect(200);

        expect(response.body.optimalStrategy).toBeDefined();
        expect(response.body.optimalStrategy.spouse1ClaimingAge).toBeDefined();
        expect(response.body.optimalStrategy.spouse2ClaimingAge).toBeDefined();
      }
    });

    it('should handle optional parameters gracefully', async () => {
      // Test without discount rate (should use default)
      const inputWithoutDiscountRate = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
      };

      const response1 = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(inputWithoutDiscountRate)
        .expect(200);

      expect(response1.body.metadata.discountRate).toBe(0.03); // Default

      // Test with discount rate
      const inputWithDiscountRate = {
        ...inputWithoutDiscountRate,
        discountRate: 0.05,
      };

      const response2 = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(inputWithDiscountRate)
        .expect(200);

      expect(response2.body.metadata.discountRate).toBe(0.05);
    });

    it('should maintain existing validation rules', async () => {
      // Test invalid PIA
      const invalidPIA = {
        birthDate: '1960-01-01',
        pia: 10000, // Too high
        lifeExpectancy: 85,
        inflationRate: 0.025,
      };

      await request(app)
        .post('/api/calculate/individual')
        .send(invalidPIA)
        .expect(400);

      // Test invalid life expectancy
      const invalidLE = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 50, // Too low
        inflationRate: 0.025,
      };

      await request(app)
        .post('/api/calculate/individual')
        .send(invalidLE)
        .expect(400);

      // Test invalid inflation rate
      const invalidInflation = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.15, // Too high
      };

      await request(app)
        .post('/api/calculate/individual')
        .send(invalidInflation)
        .expect(400);
    });

    it('should maintain existing error handling behavior', async () => {
      // Test missing required field
      const missingField = {
        birthDate: '1960-01-01',
        pia: 3000,
        // Missing lifeExpectancy
        inflationRate: 0.025,
      };

      const response = await request(app)
        .post('/api/calculate/individual')
        .send(missingField)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('details');
    });

    it('should verify enhanced endpoint provides additional features', async () => {
      const input = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
      };

      const oldResponse = await request(app)
        .post('/api/calculate/individual')
        .send(input)
        .expect(200);

      const newResponse = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(input)
        .expect(200);

      // Old response should have basic fields
      expect(oldResponse.body).toHaveProperty('optimalAge');
      expect(oldResponse.body).toHaveProperty('optimalMonthlyBenefit');
      expect(oldResponse.body).toHaveProperty('optimalLifetimeBenefit');

      // New response should have enhanced fields
      expect(newResponse.body.individual).toHaveProperty('yearlyProjections');
      expect(newResponse.body.individual).toHaveProperty('optimalPresentValue');
      expect(newResponse.body.individual).toHaveProperty('allStrategies');
      expect(newResponse.body).toHaveProperty('metadata');
      
      // Enhanced endpoint provides more data
      expect(newResponse.body.individual.yearlyProjections.length).toBeGreaterThan(0);
      expect(newResponse.body.individual.allStrategies.length).toBe(9);
    });
  });

  describe('Cross-Version Consistency', () => {
    it('should produce reasonable results across both endpoints', async () => {
      const input = {
        birthDate: '1960-01-01',
        pia: 3000,
        lifeExpectancy: 85,
        inflationRate: 0.025,
      };

      const oldResponse = await request(app)
        .post('/api/calculate/individual')
        .send(input)
        .expect(200);

      const newResponse = await request(app)
        .post('/api/calculate/enhanced/individual')
        .send(input)
        .expect(200);

      // Both should recommend valid claiming ages
      expect(oldResponse.body.optimalAge).toBeGreaterThanOrEqual(62);
      expect(oldResponse.body.optimalAge).toBeLessThanOrEqual(70);
      expect(newResponse.body.individual.optimalAge).toBeGreaterThanOrEqual(62);
      expect(newResponse.body.individual.optimalAge).toBeLessThanOrEqual(70);
      
      // Both should calculate positive benefits
      expect(oldResponse.body.optimalLifetimeBenefit).toBeGreaterThan(0);
      expect(newResponse.body.individual.optimalLifetimeBenefit).toBeGreaterThan(0);
    });

    it('should produce reasonable couple strategies across endpoints', async () => {
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

      const oldResponse = await request(app)
        .post('/api/calculate/couple')
        .send(input)
        .expect(200);

      const newResponse = await request(app)
        .post('/api/calculate/enhanced/couple')
        .send(input)
        .expect(200);

      // Both should recommend valid strategies
      expect(oldResponse.body.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(oldResponse.body.optimalStrategy.spouse2ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(newResponse.body.couple.optimalStrategy.spouse1ClaimingAge).toBeGreaterThanOrEqual(62);
      expect(newResponse.body.couple.optimalStrategy.spouse2ClaimingAge).toBeGreaterThanOrEqual(62);
      
      // Both should calculate positive combined benefits
      expect(oldResponse.body.optimalStrategy.combinedLifetimeBenefit).toBeGreaterThan(0);
      expect(newResponse.body.couple.optimalStrategy.combinedLifetimeBenefit).toBeGreaterThan(0);
    });
  });
});
