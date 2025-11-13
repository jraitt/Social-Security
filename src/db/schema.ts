import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Calculations table - stores calculation history for analytics and caching
 */
export const calculations = sqliteTable('calculations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  calculationType: text('calculation_type').notNull(), // 'individual' or 'couple'

  // Individual fields
  birthYear: integer('birth_year'),
  currentAge: integer('current_age'),
  monthlyBenefitAtFRA: real('monthly_benefit_at_fra'),
  lifeExpectancy: integer('life_expectancy'),

  // Couple fields (null for individual calculations)
  spouse1BirthYear: integer('spouse1_birth_year'),
  spouse1CurrentAge: integer('spouse1_current_age'),
  spouse1MonthlyBenefitAtFRA: real('spouse1_monthly_benefit_at_fra'),
  spouse1LifeExpectancy: integer('spouse1_life_expectancy'),

  spouse2BirthYear: integer('spouse2_birth_year'),
  spouse2CurrentAge: integer('spouse2_current_age'),
  spouse2MonthlyBenefitAtFRA: real('spouse2_monthly_benefit_at_fra'),
  spouse2LifeExpectancy: integer('spouse2_life_expectancy'),

  // Assumptions
  inflationRate: real('inflation_rate').default(0.025),
  discountRate: real('discount_rate').default(0.03),

  // Results (stored as JSON)
  optimalStrategy: text('optimal_strategy'), // JSON string
  alternativeStrategies: text('alternative_strategies'), // JSON string
  projections: text('projections'), // JSON string

  // Metadata
  calculatedAt: integer('calculated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  // Optional user tracking (for future authentication)
  userId: text('user_id'),
  sessionId: text('session_id'),
})

export type Calculation = typeof calculations.$inferSelect
export type NewCalculation = typeof calculations.$inferInsert
