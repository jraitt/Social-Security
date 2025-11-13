import { NextRequest, NextResponse } from 'next/server'
import { CalculationService } from '@/lib/services/CalculationService'

const calculationService = new CalculationService()

/**
 * POST /api/calculate/individual
 *
 * Calculate optimal claiming strategy for an individual.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { birthDate, pia, lifeExpectancy, inflationRate } = body

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

    const result = calculationService.calculateIndividual({
      birthDate,
      pia,
      lifeExpectancy,
      inflationRate,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Individual calculation error:', error)
    return NextResponse.json(
      {
        error: 'Calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 422 }
    )
  }
}
