/**
 * PresentValueDisplay Component
 * 
 * Displays present value calculations and comparisons between strategies.
 * Includes a discount rate control that allows users to adjust the rate
 * and see how it affects the present value calculations.
 * 
 * Features:
 * - Display selected strategy present value
 * - Display optimal strategy present value
 * - Show dollar and percentage difference
 * - Discount rate slider (0-10%)
 * - Tooltip explaining discount rate concept
 * - Reset to default button
 * - Triggers recalculation on rate change
 */

import React, { useState } from 'react';

interface PresentValueDisplayProps {
  selectedStrategyPV: number;
  optimalStrategyPV: number;
  discountRate: number;
  onDiscountRateChange: (rate: number) => void;
  isRecalculating?: boolean;
}

const PresentValueDisplay: React.FC<PresentValueDisplayProps> = ({
  selectedStrategyPV,
  optimalStrategyPV,
  discountRate,
  onDiscountRateChange,
  isRecalculating = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const DEFAULT_DISCOUNT_RATE = 3.0;

  /**
   * Format currency values
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Format percentage values
   */
  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  /**
   * Calculate difference between strategies
   */
  const difference = selectedStrategyPV - optimalStrategyPV;
  const percentageDifference = optimalStrategyPV !== 0 
    ? (difference / optimalStrategyPV) * 100 
    : 0;

  /**
   * Handle discount rate slider change
   */
  const handleRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(event.target.value);
    onDiscountRateChange(newRate);
  };

  /**
   * Reset discount rate to default
   */
  const handleReset = () => {
    onDiscountRateChange(DEFAULT_DISCOUNT_RATE);
  };

  /**
   * Determine if selected strategy is optimal
   */
  const isOptimal = Math.abs(difference) < 100; // Within $100 is considered same

  return (
    <div className="card">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
        Present Value Analysis
      </h3>

      {/* Discount Rate Control */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label htmlFor="discount-rate" className="text-sm font-medium text-gray-700">
              Discount Rate
            </label>
            {/* Info Icon with Tooltip */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Discount rate information"
              >
                ?
              </button>
              {showTooltip && (
                <div className="absolute z-10 w-64 sm:w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                  <p className="mb-2">
                    <strong>What is a discount rate?</strong>
                  </p>
                  <p className="mb-2">
                    The discount rate represents the time value of money - the idea that a dollar today is worth more than a dollar in the future.
                  </p>
                  <p>
                    A higher discount rate means you value money today more, which may favor claiming benefits earlier. A lower rate favors waiting for larger future benefits.
                  </p>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600">
              {discountRate.toFixed(1)}%
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-primary-600 hover:text-primary-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              aria-label="Reset discount rate to default"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            id="discount-rate"
            min="0"
            max="10"
            step="0.1"
            value={discountRate}
            onChange={handleRateChange}
            disabled={isRecalculating}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Adjust discount rate"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={discountRate}
            aria-valuetext={`${discountRate.toFixed(1)} percent`}
          />
          {/* Range labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>5%</span>
            <span>10%</span>
          </div>
        </div>

        {isRecalculating && (
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Recalculating...</span>
          </div>
        )}
      </div>

      {/* Present Value Comparison */}
      <div className="space-y-3">
        {/* Selected Strategy PV */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Selected Strategy Present Value
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatCurrency(selectedStrategyPV)}
              </p>
            </div>
            {isOptimal && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optimal Strategy PV */}
        {!isOptimal && (
          <div className="bg-secondary-50 rounded-lg p-3 sm:p-4 border border-secondary-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs sm:text-sm text-secondary-700 mb-1 font-medium">
                  Optimal Strategy Present Value
                </p>
                <p className="text-xl sm:text-2xl font-bold text-secondary-600">
                  {formatCurrency(optimalStrategyPV)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Difference Display */}
        {!isOptimal && (
          <div className={`rounded-lg p-3 sm:p-4 ${
            difference >= 0 
              ? 'bg-secondary-50 border border-secondary-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Difference from Optimal
            </p>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dollar difference:</span>
                <span className={`text-lg font-bold ${
                  difference >= 0 ? 'text-secondary-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(difference))}
                  {difference < 0 && ' less'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Percentage difference:</span>
                <span className={`text-base font-semibold ${
                  difference >= 0 ? 'text-secondary-600' : 'text-red-600'
                }`}>
                  {formatPercentage(percentageDifference)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Optimal Message */}
        {isOptimal && (
          <div className="bg-secondary-50 rounded-lg p-3 sm:p-4 border border-secondary-200">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-secondary-700">
                  This is the optimal strategy
                </p>
                <p className="text-xs text-secondary-600 mt-1">
                  This strategy provides the highest present value at the current discount rate.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Note:</strong> Present value calculations help compare strategies by accounting for the time value of money. 
          Adjust the discount rate above to see how different assumptions affect which strategy is optimal.
        </p>
      </div>
    </div>
  );
};

export default PresentValueDisplay;
