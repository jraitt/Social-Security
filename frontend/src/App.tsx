/**
 * App Component
 * 
 * Root component managing application state and coordinating data flow between
 * all child components. Handles mode switching, calculation submission, error
 * handling, and conditional rendering based on calculation state.
 */

import { useState } from 'react';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import BenefitsChart from './components/BenefitsChart';
import {
  CalculationInput,
  CalculationResult,
  AssumptionData,
  ApiError,
} from './types/calculator.types';
import { 
  calculateIndividual, 
  calculateCouple, 
  calculateIndividualEnhanced,
  calculateCoupleEnhanced,
  isApiError 
} from './services/api';

function App() {
  // Application state
  const [mode, setMode] = useState<'individual' | 'couple'>('couple');
  const [inputData, setInputData] = useState<CalculationInput | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Assumptions state for recalculation
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [assumptions, setAssumptions] = useState<AssumptionData>({
    inflationRate: 0.025,
    useInflationAdjusted: true,
    discountRate: 0.03, // Default 3%
  });
  
  // Discount rate state for present value calculations
  const [discountRate, setDiscountRate] = useState(0.03); // Default 3%

  /**
   * Handle mode switching between individual and couple
   */
  const handleModeChange = (newMode: 'individual' | 'couple') => {
    setMode(newMode);
    // Clear results when switching modes
    setResults(null);
    setError(null);
  };

  /**
   * Handle calculation submission from form
   */
  const handleCalculate = async (data: CalculationInput) => {
    setIsLoading(true);
    setError(null);
    setInputData(data);

    try {
      // Use discount rate from assumptions if provided, otherwise use default
      const currentDiscountRate = data.assumptions.discountRate || 0.03;
      setDiscountRate(currentDiscountRate);

      if (data.mode === 'individual' && data.individual) {
        // Call enhanced individual calculation API with discount rate
        const enhancedInput = {
          ...data.individual,
          discountRate: currentDiscountRate,
        };
        
        const result = await calculateIndividualEnhanced(enhancedInput);
        
        // Store results with metadata
        const calculationResult: CalculationResult = {
          type: 'individual',
          individual: result,
          metadata: {
            calculatedAt: new Date().toISOString(),
            assumptions: data.assumptions,
          },
        };
        
        setResults(calculationResult);
        
        // Update assumptions state from input
        setLifeExpectancy(data.individual.lifeExpectancy);
        setAssumptions(data.assumptions);
      } else if (data.mode === 'couple' && data.couple) {
        // Call enhanced couple calculation API with discount rate
        const enhancedInput = {
          ...data.couple,
          discountRate: currentDiscountRate,
        };
        
        const result = await calculateCoupleEnhanced(enhancedInput);
        
        // Store results with metadata
        const calculationResult: CalculationResult = {
          type: 'couple',
          couple: result,
          metadata: {
            calculatedAt: new Date().toISOString(),
            assumptions: data.assumptions,
          },
        };
        
        setResults(calculationResult);
        
        // Update assumptions state from input (use spouse1's life expectancy as default)
        setLifeExpectancy(data.couple.spouse1.lifeExpectancy);
        setAssumptions(data.assumptions);
      }
    } catch (err) {
      // Handle API errors
      if (isApiError(err)) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle recalculation with updated assumptions
   */
  const handleRecalculate = async () => {
    if (!inputData) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update input data with new assumptions
      const updatedInput: CalculationInput = {
        ...inputData,
        assumptions,
      };

      if (inputData.mode === 'individual' && inputData.individual) {
        // Update individual input with new life expectancy and inflation
        const updatedIndividualInput = {
          ...inputData.individual,
          lifeExpectancy,
          inflationRate: assumptions.inflationRate,
        };
        
        const result = await calculateIndividual(updatedIndividualInput);
        
        const calculationResult: CalculationResult = {
          type: 'individual',
          individual: result,
          metadata: {
            calculatedAt: new Date().toISOString(),
            assumptions,
          },
        };
        
        setResults(calculationResult);
        
        // Update stored input data
        setInputData({
          ...updatedInput,
          individual: updatedIndividualInput,
        });
      } else if (inputData.mode === 'couple' && inputData.couple) {
        // Update couple input with new life expectancy and inflation
        const updatedCoupleInput = {
          spouse1: {
            ...inputData.couple.spouse1,
            lifeExpectancy,
          },
          spouse2: {
            ...inputData.couple.spouse2,
            lifeExpectancy,
          },
          inflationRate: assumptions.inflationRate,
        };
        
        const result = await calculateCouple(updatedCoupleInput);
        
        const calculationResult: CalculationResult = {
          type: 'couple',
          couple: result,
          metadata: {
            calculatedAt: new Date().toISOString(),
            assumptions,
          },
        };
        
        setResults(calculationResult);
        
        // Update stored input data
        setInputData({
          ...updatedInput,
          couple: updatedCoupleInput,
        });
      }
    } catch (err) {
      // Handle API errors
      if (isApiError(err)) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Recalculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle error dismissal
   */
  const handleDismissError = () => {
    setError(null);
  };

  /**
   * Handle discount rate change and trigger recalculation
   */
  const handleDiscountRateChange = async (newRate: number) => {
    // Update discount rate state
    setDiscountRate(newRate);
    
    // If we don't have input data or results, just update the state
    if (!inputData || !results) {
      return;
    }

    // Trigger recalculation with new discount rate
    setError(null);

    try {
      // Update assumptions with new discount rate
      const updatedAssumptions: AssumptionData = {
        ...assumptions,
        discountRate: newRate,
      };
      setAssumptions(updatedAssumptions);

      if (inputData.mode === 'individual' && inputData.individual) {
        // Recalculate individual with new discount rate
        const enhancedInput = {
          ...inputData.individual,
          discountRate: newRate,
        };
        
        const result = await calculateIndividualEnhanced(enhancedInput);
        
        const calculationResult: CalculationResult = {
          type: 'individual',
          individual: result,
          metadata: {
            calculatedAt: new Date().toISOString(),
            assumptions: updatedAssumptions,
          },
        };
        
        setResults(calculationResult);
      } else if (inputData.mode === 'couple' && inputData.couple) {
        // Recalculate couple with new discount rate
        const enhancedInput = {
          ...inputData.couple,
          discountRate: newRate,
        };
        
        const result = await calculateCoupleEnhanced(enhancedInput);
        
        const calculationResult: CalculationResult = {
          type: 'couple',
          couple: result,
          metadata: {
            calculatedAt: new Date().toISOString(),
            assumptions: updatedAssumptions,
          },
        };
        
        setResults(calculationResult);
      }
    } catch (err) {
      // Handle API errors
      if (isApiError(err)) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } else {
        setError('An unexpected error occurred while recalculating. Please try again.');
      }
      console.error('Discount rate recalculation error:', err);
    }
  };

  /**
   * Get chart data from results
   */
  const getChartData = () => {
    if (!results) return null;
    
    if (results.type === 'individual' && results.individual) {
      return results.individual.chartData;
    }
    
    // For couple mode, we would need to aggregate chart data
    // This is a simplified version - actual implementation may vary
    return null;
  };

  /**
   * Get optimal age from results
   */
  const getOptimalAge = () => {
    if (!results) return 0;
    
    if (results.type === 'individual' && results.individual) {
      return results.individual.optimalAge;
    } else if (results.type === 'couple' && results.couple) {
      // For couple, we could show the higher earner's optimal age
      // or create a combined metric
      return results.couple.optimalStrategy.spouse1ClaimingAge;
    }
    
    return 0;
  };

  /**
   * Get present value data from results
   */
  const getPresentValueData = () => {
    if (!results) return null;
    
    if (results.type === 'individual' && results.individual) {
      // For individual, use the optimal strategy's present value
      const optimalPV = (results.individual as any).optimalPresentValue || 0;
      
      return {
        selectedStrategyPV: optimalPV,
        optimalStrategyPV: optimalPV,
      };
    } else if (results.type === 'couple' && results.couple) {
      // For couple, use the optimal strategy's present value
      const optimalPV = (results.couple as any).optimalPresentValue || 0;
      
      return {
        selectedStrategyPV: optimalPV,
        optimalStrategyPV: optimalPV,
      };
    }
    
    return null;
  };

  /**
   * Check if enhanced features are available in results
   */
  const hasEnhancedFeatures = () => {
    if (!results) return false;
    
    if (results.type === 'individual' && results.individual) {
      return 'optimalPresentValue' in results.individual;
    } else if (results.type === 'couple' && results.couple) {
      return 'optimalPresentValue' in results.couple;
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600">
            Social Security Calculator
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Calculate your optimal Social Security claiming strategy
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={handleDismissError}
                  className="inline-flex text-red-400 hover:text-red-600 focus:outline-none min-w-[44px] min-h-[44px] items-center justify-center"
                  aria-label="Dismiss error"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Form */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <CalculatorForm
            mode={mode}
            onCalculate={handleCalculate}
            isLoading={isLoading}
            onModeChange={handleModeChange}
          />
        </div>

        {/* Results Section - Only show if we have results */}
        {results && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Results Display - Full width */}
            <ResultsDisplay 
              result={results} 
              mode={mode}
              discountRate={discountRate * 100}
              onDiscountRateChange={(rate) => handleDiscountRateChange(rate / 100)}
              inputData={
                mode === 'individual' && inputData?.individual
                  ? {
                      birthDate: inputData.individual.birthDate,
                      pia: inputData.individual.pia,
                      lifeExpectancy: inputData.individual.lifeExpectancy,
                    }
                  : mode === 'couple' && inputData?.couple
                  ? {
                      spouse1: inputData.couple.spouse1,
                      spouse2: inputData.couple.spouse2,
                    }
                  : undefined
              }
            />

            {/* Benefits Chart - Full width */}
            {results.type === 'individual' && getChartData() && (
              <div>
                <BenefitsChart
                  data={getChartData()!}
                  optimalAge={getOptimalAge()}
                  mode={mode}
                />
              </div>
            )}
          </div>
        )}

        {/* Welcome Message - Only show if no results */}
        {!results && !isLoading && (
          <div className="card">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Welcome</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
              This calculator helps you determine the optimal age to claim Social Security benefits
              based on your personal information and life expectancy.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                <li>Choose between individual or married couple calculation</li>
                <li>Enter your birth date, Primary Insurance Amount (PIA), and life expectancy</li>
                <li>Click "Calculate Optimal Strategy" to see your personalized recommendation</li>
                <li>Adjust assumptions to see how different scenarios affect your strategy</li>
              </ol>
            </div>
          </div>
        )}

        {/* Loading Indicator - Show during calculation */}
        {isLoading && !results && (
          <div className="card text-center py-8 sm:py-12">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-primary-600 mb-3 sm:mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-base sm:text-lg font-medium text-gray-700">
                Calculating your optimal strategy...
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                This may take a few moments
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-gray-500 text-xs sm:text-sm">
            Social Security Calculator &copy; {new Date().getFullYear()}
          </p>
          <p className="text-center text-gray-400 text-xs mt-1 sm:mt-2 px-4">
            This calculator provides estimates based on current Social Security rules. 
            Consult with a financial advisor for personalized advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
