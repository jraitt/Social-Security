/**
 * Type Definitions Index
 * 
 * Central export point for all type definitions used in the backend.
 * Includes both legacy types (for backward compatibility) and enhanced types.
 */

// Export enhanced types
export * from './enhanced-calculator.types';

// Re-export legacy types from services for backward compatibility
export type {
  IndividualInput,
  PersonInput,
  CoupleInput,
  Strategy,
  IndividualResult,
  ValidationResult,
  SurvivorScenario,
  CoupleStrategy,
  CoupleResult,
} from '../services/CalculationService';

export type {
  ProjectionResult,
  CumulativeBenefitData,
  ChartDataPoint,
} from '../services/ProjectionService';
