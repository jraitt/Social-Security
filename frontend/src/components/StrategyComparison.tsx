/**
 * StrategyComparison Component
 * 
 * Allows users to compare different Social Security claiming strategies side-by-side.
 * Shows dollar and percentage differences between strategies, highlighting which is better.
 * Supports both individual and couple modes with present value comparisons.
 * 
 * Features:
 * - Dropdown to select alternative strategies
 * - Side-by-side comparison of selected vs optimal strategy
 * - Dollar and percentage difference displays
 * - Present value comparison
 * - Visual indicators for better/worse strategies
 * - Responsive design for mobile and desktop
 * 
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
 */

import React, { useState } from 'react';
import {
  StrategyEvaluation,
  CoupleStrategyEvaluation,
} from '../types/calculator.types';

interface StrategyComparisonProps {
  mode: 'individual' | 'couple';
  optimalStrategy: StrategyEvaluation | CoupleStrategyEvaluation;
  allStrategies: (StrategyEvaluation | CoupleStrategyEvaluation)[];
  selectedStrategy?: StrategyEvaluation | CoupleStrategyEvaluation;
  onStrategySelect: (strategy: StrategyEvaluation | CoupleStrategyEvaluation) => void;
}

const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  mode,
  optimalStrategy,
  allStrategies,
  selectedStrategy,
  onStrategySelect,
}) => {
  // Use optimal strategy as default if no strategy is selected
  const [currentStrategy, setCurrentStrategy] = useState<StrategyEvaluation | CoupleStrategyEvaluation>(
    selectedStrategy || optimalStrategy
  );

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
   * Handle strategy selection from dropdown
   */
  const handleStrategyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const strategyKey = event.target.value;
    const strategy = allStrategies.find((s) => getStrategyKey(s) === strategyKey);
    
    if (strategy) {
      setCurrentStrategy(strategy);
      onStrategySelect(strategy);
    }
  };

  /**
   * Get unique key for a strategy
   */
  const getStrategyKey = (strategy: StrategyEvaluation | CoupleStrategyEvaluation): string => {
    if (mode === 'individual') {
      return `${(strategy as StrategyEvaluation).claimingAge}`;
    } else {
      const coupleStrategy = strategy as CoupleStrategyEvaluation;
      return `${coupleStrategy.spouse1ClaimingAge}-${coupleStrategy.spouse2ClaimingAge}`;
    }
  };

  /**
   * Get display label for a strategy
   */
  const getStrategyLabel = (strategy: StrategyEvaluation | CoupleStrategyEvaluation): string => {
    if (mode === 'individual') {
      const indStrategy = strategy as StrategyEvaluation;
      return `Age ${indStrategy.claimingAge} - ${formatCurrency(indStrategy.monthlyBenefit)}/mo`;
    } else {
      const coupleStrategy = strategy as CoupleStrategyEvaluation;
      return `Ages ${coupleStrategy.spouse1ClaimingAge}/${coupleStrategy.spouse2ClaimingAge} - ${formatCurrency(coupleStrategy.combinedMonthlyBenefit)}/mo`;
    }
  };

  /**
   * Calculate comparison metrics
   */
  const getComparisonMetrics = () => {
    if (mode === 'individual') {
      const optimal = optimalStrategy as StrategyEvaluation;
      const current = currentStrategy as StrategyEvaluation;
      
      const lifetimeDiff = current.lifetimeBenefit - optimal.lifetimeBenefit;
      const lifetimePercent = (lifetimeDiff / optimal.lifetimeBenefit) * 100;
      
      const pvDiff = current.presentValue - optimal.presentValue;
      const pvPercent = (pvDiff / optimal.presentValue) * 100;
      
      return {
        lifetimeDiff,
        lifetimePercent,
        pvDiff,
        pvPercent,
        isBetter: lifetimeDiff >= 0,
      };
    } else {
      const optimal = optimalStrategy as CoupleStrategyEvaluation;
      const current = currentStrategy as CoupleStrategyEvaluation;
      
      const lifetimeDiff = current.combinedLifetimeBenefit - optimal.combinedLifetimeBenefit;
      const lifetimePercent = (lifetimeDiff / optimal.combinedLifetimeBenefit) * 100;
      
      const pvDiff = current.combinedPresentValue - optimal.combinedPresentValue;
      const pvPercent = (pvDiff / optimal.combinedPresentValue) * 100;
      
      return {
        lifetimeDiff,
        lifetimePercent,
        pvDiff,
        pvPercent,
        isBetter: lifetimeDiff >= 0,
      };
    }
  };

  const metrics = getComparisonMetrics();
  const isOptimal = getStrategyKey(currentStrategy) === getStrategyKey(optimalStrategy);

  return (
    <div className="card">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
        Strategy Comparison
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-4">
        Compare different claiming strategies to see how they stack up against the optimal choice:
      </p>

      {/* Strategy Selection Dropdown */}
      <div className="mb-6">
        <label htmlFor="strategy-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Strategy to Compare:
        </label>
        <select
          id="strategy-select"
          value={getStrategyKey(currentStrategy)}
          onChange={handleStrategyChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        >
          {allStrategies.map((strategy) => (
            <option key={getStrategyKey(strategy)} value={getStrategyKey(strategy)}>
              {getStrategyLabel(strategy)}
            </option>
          ))}
        </select>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Selected Strategy */}
        <div className={`rounded-lg p-4 ${isOptimal ? 'bg-secondary-50 border-2 border-secondary-500' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            {isOptimal && (
              <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            <h4 className="text-sm font-semibold text-gray-900">
              {isOptimal ? 'Selected Strategy (Optimal)' : 'Selected Strategy'}
            </h4>
          </div>

          {mode === 'individual' ? (
            <>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Claiming Age</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(currentStrategy as StrategyEvaluation).claimingAge}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Monthly Benefit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency((currentStrategy as StrategyEvaluation).monthlyBenefit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Lifetime Benefits</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency((currentStrategy as StrategyEvaluation).lifetimeBenefit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Present Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency((currentStrategy as StrategyEvaluation).presentValue)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Claiming Ages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(currentStrategy as CoupleStrategyEvaluation).spouse1ClaimingAge} / {(currentStrategy as CoupleStrategyEvaluation).spouse2ClaimingAge}
                  </p>
                  <p className="text-xs text-gray-500">You / Spouse</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Combined Monthly Benefit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency((currentStrategy as CoupleStrategyEvaluation).combinedMonthlyBenefit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Lifetime Benefits</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency((currentStrategy as CoupleStrategyEvaluation).combinedLifetimeBenefit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Present Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency((currentStrategy as CoupleStrategyEvaluation).combinedPresentValue)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Optimal Strategy (for reference) */}
        {!isOptimal && (
          <div className="bg-secondary-50 border-2 border-secondary-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900">Optimal Strategy</h4>
            </div>

            {mode === 'individual' ? (
              <>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Claiming Age</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(optimalStrategy as StrategyEvaluation).claimingAge}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Monthly Benefit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency((optimalStrategy as StrategyEvaluation).monthlyBenefit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Lifetime Benefits</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency((optimalStrategy as StrategyEvaluation).lifetimeBenefit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Present Value</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency((optimalStrategy as StrategyEvaluation).presentValue)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Claiming Ages</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(optimalStrategy as CoupleStrategyEvaluation).spouse1ClaimingAge} / {(optimalStrategy as CoupleStrategyEvaluation).spouse2ClaimingAge}
                    </p>
                    <p className="text-xs text-gray-500">You / Spouse</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Combined Monthly Benefit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency((optimalStrategy as CoupleStrategyEvaluation).combinedMonthlyBenefit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Lifetime Benefits</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency((optimalStrategy as CoupleStrategyEvaluation).combinedLifetimeBenefit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Present Value</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency((optimalStrategy as CoupleStrategyEvaluation).combinedPresentValue)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Comparison Summary */}
      {!isOptimal && (
        <div className={`rounded-lg p-4 ${metrics.isBetter ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${metrics.isBetter ? 'bg-green-500' : 'bg-red-500'}`}>
              {metrics.isBetter ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold mb-1 ${metrics.isBetter ? 'text-green-900' : 'text-red-900'}`}>
                {metrics.isBetter ? 'Selected Strategy is Better' : 'Optimal Strategy is Better'}
              </h4>
              <p className={`text-xs ${metrics.isBetter ? 'text-green-700' : 'text-red-700'}`}>
                {metrics.isBetter 
                  ? 'The selected strategy provides higher total benefits than the optimal strategy.'
                  : 'The optimal strategy provides higher total benefits than the selected strategy.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lifetime Benefit Difference */}
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Lifetime Benefit Difference</p>
              <p className={`text-xl font-bold ${metrics.lifetimeDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(metrics.lifetimeDiff))}
              </p>
              <p className={`text-sm font-semibold ${metrics.lifetimeDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(metrics.lifetimePercent)}
              </p>
            </div>

            {/* Present Value Difference */}
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Present Value Difference</p>
              <p className={`text-xl font-bold ${metrics.pvDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(metrics.pvDiff))}
              </p>
              <p className={`text-sm font-semibold ${metrics.pvDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(metrics.pvPercent)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message when optimal is selected */}
      {isOptimal && (
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-secondary-900 mb-1">
                You're viewing the optimal strategy
              </h4>
              <p className="text-xs text-secondary-700">
                This strategy maximizes your total lifetime benefits. Select a different strategy from the dropdown above to compare.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyComparison;
