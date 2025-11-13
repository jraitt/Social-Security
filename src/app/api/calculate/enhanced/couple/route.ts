import { NextRequest, NextResponse } from 'next/server'
import { EnhancedCalculationService } from '@/lib/services/EnhancedCalculationService'
import { config } from '@/lib/config'

const enhancedCalculationService = new EnhancedCalculationService()

/**
 * POST /api/calculate/enhanced/couple
 *
 * Calculate optimal claiming strategy for a married couple with enhanced features.
 * Includes year-by-year projections, present value calculations, spousal benefits,
 * and survivor benefit scenarios.
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
    const { spouse1, spouse2, inflationRate, discountRate } = body

    // Validation
    if (!spouse1 || !spouse2 || inflationRate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate spouse1
    if (!spouse1.birthDate || !spouse1.pia || !spouse1.lifeExpectancy) {
      return NextResponse.json(
        { error: 'Missing required fields for spouse1' },
        { status: 400 }
      )
    }

    // Validate spouse2
    if (!spouse2.birthDate || !spouse2.pia || !spouse2.lifeExpectancy) {
      return NextResponse.json(
        { error: 'Missing required fields for spouse2' },
        { status: 400 }
      )
    }

    // Validate PIA ranges
    if (spouse1.pia < 1 || spouse1.pia > 5000 || spouse2.pia < 1 || spouse2.pia > 5000) {
      return NextResponse.json(
        { error: 'PIA must be between 1 and 5000 for both spouses' },
        { status: 400 }
      )
    }

    // Validate life expectancy ranges
    if (
      spouse1.lifeExpectancy < 70 || spouse1.lifeExpectancy > 100 ||
      spouse2.lifeExpectancy < 70 || spouse2.lifeExpectancy > 100
    ) {
      return NextResponse.json(
        { error: 'Life expectancy must be between 70 and 100 for both spouses' },
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

    const result = enhancedCalculationService.calculateCoupleOptimal({
      spouse1,
      spouse2,
      inflationRate,
      discountRate: effectiveDiscountRate,
    })

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
    }

    return NextResponse.json(enhancedResult)
  } catch (error) {
    console.error('Enhanced couple calculation error:', error)
    return NextResponse.json(
      {
        error: 'Calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 422 }
    )
  }
}
