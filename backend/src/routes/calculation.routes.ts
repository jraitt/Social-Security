/**
 * Calculation Routes
 * 
 * API endpoints for Social Security benefit calculations.
 * Handles both individual and married couple calculation requests.
 */

import { Router, Request, Response } from 'express';
import { CalculationService } from '../services/CalculationService';
import { EnhancedCalculationService } from '../services/EnhancedCalculationService';
import {
  validateIndividualCalculation,
  validateCoupleCalculation,
  validateEnhancedIndividualCalculation,
  validateEnhancedCoupleCalculation,
  handleValidationErrors,
} from '../middleware/validation.middleware';
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware';
import { config } from '../config';

const router = Router();
const calculationService = new CalculationService();
const enhancedCalculationService = new EnhancedCalculationService();

/**
 * POST /api/calculate/individual
 * 
 * Calculate optimal claiming strategy for an individual.
 * 
 * Request Body:
 * - birthDate: string (ISO 8601 format)
 * - pia: number (monthly PIA amount, $1-$5000)
 * - lifeExpectancy: number (years, 70-100)
 * - inflationRate: number (0-0.10)
 * 
 * Response:
 * - optimalAge: number
 * - optimalMonthlyBenefit: number
 * - optimalLifetimeBenefit: number
 * - strategies: Strategy[]
 * - chartData: ChartDataPoint[]
 */
router.post(
  '/individual',
  validateIndividualCalculation,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { birthDate, pia, lifeExpectancy, inflationRate } = req.body;

    try {
      const result = calculationService.calculateIndividual({
        birthDate,
        pia,
        lifeExpectancy,
        inflationRate,
      });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          error.message,
          422,
          'CALCULATION_ERROR'
        );
      }
      throw error;
    }
  })
);

/**
 * POST /api/calculate/couple
 * 
 * Calculate optimal claiming strategy for a married couple.
 * 
 * Request Body:
 * - spouse1: PersonData
 *   - birthDate: string (ISO 8601 format)
 *   - pia: number (monthly PIA amount, $1-$5000)
 *   - lifeExpectancy: number (years, 70-100)
 * - spouse2: PersonData (same structure as spouse1)
 * - inflationRate: number (0-0.10)
 * 
 * Response:
 * - optimalStrategy: CoupleStrategy
 * - alternativeStrategies: CoupleStrategy[]
 * - spouse1Fra: number
 * - spouse2Fra: number
 * - higherEarnerSpouse: 1 | 2
 */
router.post(
  '/couple',
  validateCoupleCalculation,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { spouse1, spouse2, inflationRate } = req.body;

    try {
      const result = calculationService.calculateCouple({
        spouse1,
        spouse2,
        inflationRate,
      });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          error.message,
          422,
          'CALCULATION_ERROR'
        );
      }
      throw error;
    }
  })
);

/**
 * POST /api/calculate/enhanced/individual
 * 
 * Calculate optimal claiming strategy for an individual with enhanced features.
 * Includes year-by-year projections, present value calculations, and detailed
 * strategy comparisons.
 * 
 * Request Body:
 * - birthDate: string (ISO 8601 format)
 * - pia: number (monthly PIA amount, $1-$5000)
 * - lifeExpectancy: number (years, 70-100)
 * - inflationRate: number (0-0.10)
 * - discountRate: number (optional, 0-0.10, default 0.03)
 * 
 * Response:
 * - type: 'individual'
 * - individual: EnhancedIndividualResult
 * - metadata: { calculatedAt, assumptions, discountRate }
 */
router.post(
  '/enhanced/individual',
  validateEnhancedIndividualCalculation,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    // Check if enhanced optimization is enabled
    if (!config.featureFlags.ENABLE_ENHANCED_OPTIMIZATION) {
      throw new AppError(
        'Enhanced optimization feature is not enabled',
        403,
        'FEATURE_DISABLED'
      );
    }

    const { birthDate, pia, lifeExpectancy, inflationRate, discountRate } = req.body;

    try {
      const effectiveDiscountRate = discountRate ?? config.calculationDefaults.DEFAULT_DISCOUNT_RATE;

      const result = enhancedCalculationService.calculateIndividualOptimal({
        birthDate,
        pia,
        lifeExpectancy,
        inflationRate,
        discountRate: effectiveDiscountRate,
      });

      // Wrap result in enhanced format with metadata
      const enhancedResult = {
        type: 'individual' as const,
        individual: result,
        metadata: {
          calculatedAt: new Date().toISOString(),
          assumptions: {
            inflationRate,
            useInflationAdjusted: inflationRate > 0,
            discountRate: effectiveDiscountRate,
          },
          discountRate: effectiveDiscountRate,
        },
      };

      res.status(200).json(enhancedResult);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          error.message,
          422,
          'CALCULATION_ERROR'
        );
      }
      throw error;
    }
  })
);

/**
 * POST /api/calculate/enhanced/couple
 * 
 * Calculate optimal claiming strategy for a married couple with enhanced features.
 * Includes year-by-year projections, present value calculations, spousal benefits,
 * and survivor benefit scenarios.
 * 
 * Request Body:
 * - spouse1: PersonData
 *   - birthDate: string (ISO 8601 format)
 *   - pia: number (monthly PIA amount, $1-$5000)
 *   - lifeExpectancy: number (years, 70-100)
 * - spouse2: PersonData (same structure as spouse1)
 * - inflationRate: number (0-0.10)
 * - discountRate: number (optional, 0-0.10, default 0.03)
 * 
 * Response:
 * - type: 'couple'
 * - couple: EnhancedCoupleResult
 * - metadata: { calculatedAt, assumptions, discountRate }
 */
router.post(
  '/enhanced/couple',
  validateEnhancedCoupleCalculation,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    // Check if enhanced optimization is enabled
    if (!config.featureFlags.ENABLE_ENHANCED_OPTIMIZATION) {
      throw new AppError(
        'Enhanced optimization feature is not enabled',
        403,
        'FEATURE_DISABLED'
      );
    }

    const { spouse1, spouse2, inflationRate, discountRate } = req.body;

    try {
      const effectiveDiscountRate = discountRate ?? config.calculationDefaults.DEFAULT_DISCOUNT_RATE;

      const result = enhancedCalculationService.calculateCoupleOptimal({
        spouse1,
        spouse2,
        inflationRate,
        discountRate: effectiveDiscountRate,
      });

      // Wrap result in enhanced format with metadata
      const enhancedResult = {
        type: 'couple' as const,
        couple: result,
        metadata: {
          calculatedAt: new Date().toISOString(),
          assumptions: {
            inflationRate,
            useInflationAdjusted: inflationRate > 0,
            discountRate: effectiveDiscountRate,
          },
          discountRate: effectiveDiscountRate,
        },
      };

      res.status(200).json(enhancedResult);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          error.message,
          422,
          'CALCULATION_ERROR'
        );
      }
      throw error;
    }
  })
);

export default router;
