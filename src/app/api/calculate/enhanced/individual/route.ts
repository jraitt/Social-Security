import { NextRequest, NextResponse } from 'next/server'
import { EnhancedCalculationService } from '@/lib/services/EnhancedCalculationService'
import { config } from '@/lib/config'

const enhancedCalculationService = new EnhancedCalculationService()

/**
 * POST /api/calculate/enhanced/individual
 *
 * Calculate optimal claiming strategy for an individual with enhanced features.
 * Includes year-by-year projections, present value calculations, and detailed
 * strategy comparisons.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if enhanced optimization is enabled
    if (!config.featureFlags.ENABLE_ENHANCED_OPTIMIZATION) {
      return NextResponse.json(
        { error: 'Enhanced optimization feature is not enabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { birthDate, pia, lifeExpectancy, inflationRate, discountRate } = body

    // Validation
    if (!birthDate || !pia || !lifeExpectancy || inflationRate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (pia < 1 || pia > 5000) {
      return NextResponse.json(
        { error: 'PIA must be between 1 and 5000' },
        { status: 400 }
      )
    }

    if (lifeExpectancy < 70 || lifeExpectancy > 100) {
      return NextResponse.json(
        { error: 'Life expectancy must be between 70 and 100' },
        { status: 400 }
      )
    }

    if (inflationRate < 0 || inflationRate > 0.10) {
      return NextResponse.json(
        { error: 'Inflation rate must be between 0 and 0.10' },
        { status: 400 }
      )
    }

    if (discountRate !== undefined && (discountRate < 0 || discountRate > 0.10)) {
      return NextResponse.json(
        { error: 'Discount rate must be between 0 and 0.10' },
        { status: 400 }
      )
    }

    const effectiveDiscountRate = discountRate ?? config.calculationDefaults.DEFAULT_DISCOUNT_RATE

    const result = enhancedCalculationService.calculateIndividualOptimal({
      birthDate,
      pia,
      lifeExpectancy,
      inflationRate,
      discountRate: effectiveDiscountRate,
    })

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
    }

    return NextResponse.json(enhancedResult)
  } catch (error) {
    console.error('Enhanced individual calculation error:', error)
    return NextResponse.json(
      {
        error: 'Calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 422 }
    )
  }
}
