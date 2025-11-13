'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Import components
const CalculatorForm = dynamic(() => import('@/components/CalculatorForm'), {
  ssr: false,
  loading: () => <p>Loading calculator...</p>,
})

const ResultsDisplay = dynamic(() => import('@/components/ResultsDisplay'), {
  ssr: false,
})

export default function Home() {
  const [calculationMode, setCalculationMode] = useState<'individual' | 'couple'>('individual')
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async (data: any) => {
    setIsLoading(true)
    setError(null)
    setCalculationResult(null)

    try {
      const endpoint = calculationMode === 'individual'
        ? '/api/calculate/enhanced/individual'
        : '/api/calculate/enhanced/couple'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Calculation failed')
      }

      const result = await response.json()
      setCalculationResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Calculation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeChange = (mode: 'individual' | 'couple') => {
    setCalculationMode(mode)
    setCalculationResult(null)
    setError(null)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleModeChange('individual')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              calculationMode === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => handleModeChange('couple')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              calculationMode === 'couple'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Married Couple
          </button>
        </div>

        <CalculatorForm
          mode={calculationMode}
          onCalculate={handleCalculate}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-800">Calculating optimal strategy...</p>
        </div>
      )}

      {calculationResult && !isLoading && (
        <ResultsDisplay
          result={calculationResult}
          mode={calculationMode}
        />
      )}
    </div>
  )
}
