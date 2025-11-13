/**
 * AssumptionsPanel Component
 * 
 * Provides adjustable inputs for calculation assumptions including life expectancy
 * and inflation rate. Displays default values from SSA actuarial tables and includes
 * tooltips explaining each assumption.
 * 
 * @example
 * ```tsx
 * <AssumptionsPanel
 *   assumptions={{ inflationRate: 0.025, useInflationAdjusted: true }}
 *   lifeExpectancy={85}
 *   onLifeExpectancyChange={(value) => setLifeExpectancy(value)}
 *   onAssumptionsChange={(assumptions) => setAssumptions(assumptions)}
 *   onRecalculate={() => handleRecalculate()}
 *   disabled={isLoading}
 * />
 * ```
 * 
 * Features:
 * - Life expectancy slider (70-100 years)
 * - Inflation rate slider (0-10%)
 * - Default values from SSA actuarial tables (85 years, 2.5% inflation)
 * - Interactive tooltips explaining each assumption
 * - Reset to defaults button
 * - Recalculate button with loading state
 * - Responsive Tailwind CSS styling
 * - Accessible keyboard navigation and ARIA labels
 */

import React, { useState } from 'react';
import { AssumptionData } from '../types/calculator.types';

interface AssumptionsPanelProps {
  assumptions: AssumptionData;
  lifeExpectancy: number;
  onLifeExpectancyChange: (value: number) => void;
  onAssumptionsChange: (assumptions: AssumptionData) => void;
  onRecalculate: () => void;
  disabled?: boolean;
}

const AssumptionsPanel: React.FC<AssumptionsPanelProps> = ({
  assumptions,
  lifeExpectancy,
  onLifeExpectancyChange,
  onAssumptionsChange,
  onRecalculate,
  disabled = false,
}) => {
  const [showLifeExpectancyTooltip, setShowLifeExpectancyTooltip] = useState(false);
  const [showInflationTooltip, setShowInflationTooltip] = useState(false);

  // Default values from SSA actuarial tables
  const DEFAULT_LIFE_EXPECTANCY = 85;
  const DEFAULT_INFLATION_RATE = 2.5;

  /**
   * Handle life expectancy slider change
   */
  const handleLifeExpectancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onLifeExpectancyChange(value);
  };

  /**
   * Handle inflation rate slider change
   */
  const handleInflationRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newAssumptions: AssumptionData = {
      inflationRate: value / 100,
      useInflationAdjusted: value > 0,
    };
    onAssumptionsChange(newAssumptions);
  };

  /**
   * Reset to default values
   */
  const handleResetDefaults = () => {
    onLifeExpectancyChange(DEFAULT_LIFE_EXPECTANCY);
    onAssumptionsChange({
      inflationRate: DEFAULT_INFLATION_RATE / 100,
      useInflationAdjusted: true,
    });
  };

  const inflationRatePercent = assumptions.inflationRate * 100;

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold">Assumptions</h2>
        <button
          type="button"
          onClick={handleResetDefaults}
          disabled={disabled}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] px-2"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="space-y-6">
        {/* Life Expectancy Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="lifeExpectancy" className="block text-sm font-medium text-gray-700">
              Life Expectancy
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-primary-600">
                {lifeExpectancy} years
              </span>
              <button
                type="button"
                onMouseEnter={() => setShowLifeExpectancyTooltip(true)}
                onMouseLeave={() => setShowLifeExpectancyTooltip(false)}
                onFocus={() => setShowLifeExpectancyTooltip(true)}
                onBlur={() => setShowLifeExpectancyTooltip(false)}
                className="relative text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Life expectancy information"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {showLifeExpectancyTooltip && (
                  <div className="absolute right-0 top-8 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    <p className="mb-2">
                      Your estimated age at death. This affects the total lifetime benefits calculation.
                    </p>
                    <p className="text-gray-300">
                      Default: {DEFAULT_LIFE_EXPECTANCY} years (based on SSA actuarial tables)
                    </p>
                    <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              id="lifeExpectancy"
              min="70"
              max="100"
              step="1"
              value={lifeExpectancy}
              onChange={handleLifeExpectancyChange}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((lifeExpectancy - 70) / 30) * 100}%, #e5e7eb ${((lifeExpectancy - 70) / 30) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>70</span>
              <span>85</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Inflation Rate Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700">
              Annual Inflation Rate
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-primary-600">
                {inflationRatePercent.toFixed(1)}%
              </span>
              <button
                type="button"
                onMouseEnter={() => setShowInflationTooltip(true)}
                onMouseLeave={() => setShowInflationTooltip(false)}
                onFocus={() => setShowInflationTooltip(true)}
                onBlur={() => setShowInflationTooltip(false)}
                className="relative text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Inflation rate information"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {showInflationTooltip && (
                  <div className="absolute right-0 top-8 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    <p className="mb-2">
                      Expected annual inflation rate used to calculate inflation-adjusted benefits over time.
                    </p>
                    <p className="text-gray-300">
                      Default: {DEFAULT_INFLATION_RATE}% (historical average)
                    </p>
                    <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              id="inflationRate"
              min="0"
              max="10"
              step="0.1"
              value={inflationRatePercent}
              onChange={handleInflationRateChange}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(inflationRatePercent / 10) * 100}%, #e5e7eb ${(inflationRatePercent / 10) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>5%</span>
              <span>10%</span>
            </div>
          </div>
        </div>

        {/* Recalculate Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onRecalculate}
            disabled={disabled}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recalculating...
              </span>
            ) : (
              'Recalculate with New Assumptions'
            )}
          </button>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About These Assumptions</p>
              <p className="text-blue-700">
                Adjusting these values will recalculate your optimal claiming strategy. 
                Default values are based on Social Security Administration actuarial tables 
                and historical economic data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionsPanel;
