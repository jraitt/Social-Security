import { NextRequest, NextResponse } from 'next/server'
import { CalculationService } from '@/lib/services/CalculationService'

const calculationService = new CalculationService()

/**
 * POST /api/calculate/couple
 *
 * Calculate optimal claiming strategy for a married couple.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spouse1, spouse2, inflationRate } = body

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

    const result = calculationService.calculateCouple({
      spouse1,
      spouse2,
      inflationRate,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Couple calculation error:', error)
    return NextResponse.json(
      {
        error: 'Calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 422 }
    )
  }
}
