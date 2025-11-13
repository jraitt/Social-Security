/**
 * ResultsDisplay Component
 * 
 * Displays the optimal Social Security claiming strategy with clear recommendations,
 * benefit amounts, and comparisons. Shows alternative strategies within 2% of optimal.
 * 
 * Features:
 * - Prominent display of optimal claiming age
 * - Monthly and lifetime benefit amounts
 * - Comparison with age 62 claiming strategy
 * - Explanatory text describing why strategy is optimal
 * - Alternative strategies if within 2% of optimal
 * - Responsive card-based layout
 * - Color-coded indicators (green for optimal)
 * - Support for both individual and couple modes
 */

import React, { useState, lazy, Suspense } from 'react';
import {
  CalculationResult,
  IndividualResult,
  CoupleResult,
  YearlyProjection,
  CoupleYearlyProjection,
  StrategyEvaluation,
  CoupleStrategyEvaluation,
} from '../types/calculator.types';

// Lazy load heavy components for better initial render performance
const ProjectionTable = lazy(() => import('./ProjectionTable'));
const PresentValueDisplay = lazy(() => import('./PresentValueDisplay'));
const StrategyComparison = lazy(() => import('./StrategyComparison'));
const ExportButton = lazy(() => import('./ExportButton'));

/**
 * Loading fallback component for lazy-loaded components
 */
const ComponentLoader: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

interface ResultsDisplayProps {
  result: CalculationResult;
  mode: 'individual' | 'couple';
  discountRate?: number;
  onDiscountRateChange?: (rate: number) => void;
  inputData?: {
    birthDate?: string;
    pia?: number;
    lifeExpectancy?: number;
    spouse1?: {
      birthDate: string;
      pia: number;
      lifeExpectancy: number;
    };
    spouse2?: {
      birthDate: string;
      pia: number;
      lifeExpectancy: number;
    };
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, 
  mode, 
  discountRate, 
  onDiscountRateChange,
  inputData 
}) => {
  // State for selected strategy (for comparison and projection display)
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyEvaluation | CoupleStrategyEvaluation | null>(null);

  /**
   * Handle strategy selection from comparison component
   */
  const handleStrategySelect = (strategy: StrategyEvaluation | CoupleStrategyEvaluation) => {
    setSelectedStrategy(strategy);
  };

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
   * Render individual results
   */
  const renderIndividualResults = (individualResult: IndividualResult) => {
    const {
      optimalAge,
      optimalMonthlyBenefit,
      optimalLifetimeBenefit,
      fra,
      alternativeStrategies,
      comparisonWithAge62,
    } = individualResult;

    // Check if enhanced features are available
    const hasEnhancedFeatures = 'optimalPresentValue' in individualResult;
    const optimalPresentValue = hasEnhancedFeatures 
      ? (individualResult as any).optimalPresentValue 
      : null;

    // Find the optimal strategy details
    const optimalStrategy = individualResult.strategies?.find(
      (s) => s.claimingAge === optimalAge
    ) || (individualResult as any).allStrategies?.find(
      (s: any) => s.claimingAge === optimalAge
    );

    return (
      <>
        {/* Optimal Strategy Card */}
        <div className="card border-2 border-secondary-500 bg-secondary-50">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-secondary-700 uppercase tracking-wide">
                  Optimal Strategy
                </h3>
                <p className="text-xs text-secondary-600 mt-0.5 hidden sm:block">
                  Maximizes your total lifetime benefits
                </p>
              </div>
            </div>
          </div>

          {/* Optimal Claiming Age */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Claim benefits at age</p>
            <p className="text-4xl sm:text-5xl font-bold text-secondary-600 mb-1 sm:mb-2">
              {optimalAge}
            </p>
            {optimalAge === fra && (
              <p className="text-sm text-secondary-700 font-medium">
                Your Full Retirement Age (FRA)
              </p>
            )}
            {optimalAge < fra && (
              <p className="text-sm text-secondary-700 font-medium">
                {fra - optimalAge} {fra - optimalAge === 1 ? 'year' : 'years'} before your FRA
              </p>
            )}
            {optimalAge > fra && (
              <p className="text-sm text-secondary-700 font-medium">
                {optimalAge - fra} {optimalAge - fra === 1 ? 'year' : 'years'} after your FRA
              </p>
            )}
          </div>

          {/* Benefit Amounts - Enhanced with Present Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Monthly Benefit</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatCurrency(optimalMonthlyBenefit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per month</p>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Lifetime Benefits</p>
              <p className="text-xl sm:text-2xl font-bold text-secondary-600">
                {formatCurrency(optimalLifetimeBenefit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">total projected</p>
            </div>
            {hasEnhancedFeatures && optimalPresentValue && (
              <div className="bg-white rounded-lg p-3 sm:p-4 sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Present Value</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(optimalPresentValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">in today's dollars</p>
              </div>
            )}
          </div>

          {/* Explanation */}
          {optimalStrategy && (
            <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Why this strategy is optimal:
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {optimalStrategy.description}
              </p>
            </div>
          )}

          {/* Comparison with Age 62 */}
          {comparisonWithAge62 && optimalAge !== 62 && (
            <div className="bg-white rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Compared to claiming at age 62:
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Age 62 monthly benefit:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(comparisonWithAge62.age62MonthlyBenefit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Age 62 lifetime benefit:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(comparisonWithAge62.age62LifetimeBenefit)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-secondary-700">
                      Additional lifetime benefit:
                    </span>
                    <span className="text-lg font-bold text-secondary-600">
                      {formatCurrency(comparisonWithAge62.additionalLifetimeBenefit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Percentage increase:</span>
                    <span className="text-sm font-semibold text-secondary-600">
                      {formatPercentage(comparisonWithAge62.percentageIncrease)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Strategy Comparison */}
        {hasEnhancedFeatures && (individualResult as any).allStrategies && (individualResult as any).allStrategies.length > 0 && (
          <Suspense fallback={<ComponentLoader />}>
            <StrategyComparison
              mode="individual"
              optimalStrategy={(individualResult as any).allStrategies.find(
                (s: any) => s.claimingAge === optimalAge
              ) || (individualResult as any).allStrategies[0]}
              allStrategies={(individualResult as any).allStrategies}
              selectedStrategy={selectedStrategy as StrategyEvaluation}
              onStrategySelect={handleStrategySelect}
            />
          </Suspense>
        )}

        {/* Year-by-Year Projection Table */}
        {hasEnhancedFeatures && (individualResult as any).yearlyProjections && (
          <div className="card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Year-by-Year Benefit Projections
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Detailed breakdown of your expected benefits from claiming age through life expectancy
              {selectedStrategy && ` for age ${(selectedStrategy as StrategyEvaluation).claimingAge}`}:
            </p>
            <Suspense fallback={<ComponentLoader />}>
              <ProjectionTable
                projections={
                  selectedStrategy && (selectedStrategy as StrategyEvaluation).yearlyProjections
                    ? (selectedStrategy as StrategyEvaluation).yearlyProjections
                    : (individualResult as any).yearlyProjections as YearlyProjection[]
                }
                mode="individual"
              />
            </Suspense>
          </div>
        )}

        {/* Present Value Display */}
        {hasEnhancedFeatures && optimalPresentValue && discountRate !== undefined && onDiscountRateChange && (
          <div className="card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Present Value Analysis
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Compare the time value of money across different claiming strategies:
            </p>
            <Suspense fallback={<ComponentLoader />}>
              <PresentValueDisplay
                selectedStrategyPV={
                  selectedStrategy && (selectedStrategy as StrategyEvaluation).presentValue
                    ? (selectedStrategy as StrategyEvaluation).presentValue
                    : optimalPresentValue
                }
                optimalStrategyPV={optimalPresentValue}
                discountRate={discountRate}
                onDiscountRateChange={onDiscountRateChange}
              />
            </Suspense>
          </div>
        )}

        {/* Alternative Strategies */}
        {alternativeStrategies.length > 0 && (
          <div className="card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Alternative Strategies
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              These strategies provide similar lifetime benefits (within 2% of optimal):
            </p>
            <div className="space-y-2 sm:space-y-3">
              {alternativeStrategies.map((strategy) => {
                // Calculate difference from optimal
                const lifetimeDiff = strategy.lifetimeBenefit - optimalLifetimeBenefit;
                const lifetimePercent = (lifetimeDiff / optimalLifetimeBenefit) * 100;
                const hasPV = 'presentValue' in strategy;
                const pvDiff = hasPV && optimalPresentValue 
                  ? (strategy as any).presentValue - optimalPresentValue 
                  : 0;
                
                return (
                  <div
                    key={strategy.claimingAge}
                    className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          Age {strategy.claimingAge}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatCurrency(strategy.monthlyBenefit)}/month
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">
                          {formatCurrency(strategy.lifetimeBenefit)}
                        </p>
                        <p className="text-xs text-gray-500">lifetime total</p>
                      </div>
                    </div>
                    
                    {/* Present Value if available */}
                    {hasPV && (strategy as any).presentValue && (
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                        <span className="text-xs text-gray-600">Present value:</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {formatCurrency((strategy as any).presentValue)}
                        </span>
                      </div>
                    )}
                    
                    {/* Comparison with Optimal */}
                    <div className="bg-white rounded p-2 mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Compared to optimal:</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Lifetime difference:</span>
                        <span className={`text-xs font-semibold ${lifetimeDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(lifetimeDiff))} ({formatPercentage(lifetimePercent)})
                        </span>
                      </div>
                      {hasPV && pvDiff !== 0 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600">PV difference:</span>
                          <span className={`text-xs font-semibold ${pvDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(pvDiff))}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {strategy.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  /**
   * Render couple results
   */
  const renderCoupleResults = (coupleResult: CoupleResult) => {
    const { optimalStrategy, alternativeStrategies, spouse1Fra, spouse2Fra } = coupleResult;

    // Check if enhanced features are available
    const hasEnhancedFeatures = 'optimalPresentValue' in coupleResult;
    const optimalPresentValue = hasEnhancedFeatures 
      ? (coupleResult as any).optimalPresentValue 
      : null;

    return (
      <>
        {/* Optimal Strategy Card */}
        <div className="card border-2 border-secondary-500 bg-secondary-50">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-secondary-700 uppercase tracking-wide">
                  Optimal Couple Strategy
                </h3>
                <p className="text-xs text-secondary-600 mt-0.5 hidden sm:block">
                  Maximizes combined household lifetime benefits
                </p>
              </div>
            </div>
          </div>

          {/* Claiming Ages - Prominently Displayed */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Optimal Claiming Ages</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs text-gray-600 mb-1">You</p>
                <p className="text-3xl sm:text-4xl font-bold text-secondary-600 mb-1">
                  {optimalStrategy.spouse1ClaimingAge}
                </p>
                <p className="text-xs text-gray-500">
                  {optimalStrategy.spouse1ClaimingAge === spouse1Fra
                    ? 'At FRA'
                    : optimalStrategy.spouse1ClaimingAge < spouse1Fra
                    ? `${spouse1Fra - optimalStrategy.spouse1ClaimingAge}y before FRA`
                    : `${optimalStrategy.spouse1ClaimingAge - spouse1Fra}y after FRA`}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs text-gray-600 mb-1">Your Spouse</p>
                <p className="text-3xl sm:text-4xl font-bold text-secondary-600 mb-1">
                  {optimalStrategy.spouse2ClaimingAge}
                </p>
                <p className="text-xs text-gray-500">
                  {optimalStrategy.spouse2ClaimingAge === spouse2Fra
                    ? 'At FRA'
                    : optimalStrategy.spouse2ClaimingAge < spouse2Fra
                    ? `${spouse2Fra - optimalStrategy.spouse2ClaimingAge}y before FRA`
                    : `${optimalStrategy.spouse2ClaimingAge - spouse2Fra}y after FRA`}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Benefits */}
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Monthly Benefits</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">You:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(optimalStrategy.spouse1MonthlyBenefit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your Spouse:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(optimalStrategy.spouse2MonthlyBenefit)}
                </span>
              </div>
              {optimalStrategy.spousalBenefitAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spousal benefit:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(optimalStrategy.spousalBenefitAmount)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Combined monthly:</span>
                  <span className="text-lg font-bold text-secondary-600">
                    {formatCurrency(optimalStrategy.combinedMonthlyBenefit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lifetime Benefit and Present Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-white rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Lifetime Benefits</p>
              <p className="text-xl sm:text-2xl font-bold text-secondary-600">
                {formatCurrency(optimalStrategy.combinedLifetimeBenefit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">combined household total</p>
            </div>
            {hasEnhancedFeatures && optimalPresentValue && (
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Present Value</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(optimalPresentValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">in today's dollars</p>
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Why this strategy is optimal:
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {optimalStrategy.description}
            </p>
          </div>

        </div>

        {/* Enhanced Survivor Benefit Scenarios - Prominently Displayed */}
        {hasEnhancedFeatures && (coupleResult as any).survivorScenarios && (
          <div className="card border-2 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-blue-900">
                  Survivor Benefit Scenarios
                </h3>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Projected benefits if one spouse predeceases the other
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* You Outlive Your Spouse */}
              {(coupleResult as any).survivorScenarios.spouse1Outlives && (
                <div className="bg-white rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    If You Outlive Your Spouse
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Survivor benefit:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency((coupleResult as any).survivorScenarios.spouse1Outlives.survivorBenefit)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Years receiving:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(coupleResult as any).survivorScenarios.spouse1Outlives.yearsAsSurvivor} years
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700">Total survivor benefits:</span>
                        <span className="text-base font-bold text-blue-600">
                          {formatCurrency((coupleResult as any).survivorScenarios.spouse1Outlives.totalSurvivorBenefit)}
                        </span>
                      </div>
                    </div>
                    {(coupleResult as any).survivorScenarios.spouse1Outlives.presentValueSurvivorBenefit && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Present value:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency((coupleResult as any).survivorScenarios.spouse1Outlives.presentValueSurvivorBenefit)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Your Spouse Outlives You */}
              {(coupleResult as any).survivorScenarios.spouse2Outlives && (
                <div className="bg-white rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    If Your Spouse Outlives You
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Survivor benefit:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency((coupleResult as any).survivorScenarios.spouse2Outlives.survivorBenefit)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Years receiving:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(coupleResult as any).survivorScenarios.spouse2Outlives.yearsAsSurvivor} years
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700">Total survivor benefits:</span>
                        <span className="text-base font-bold text-blue-600">
                          {formatCurrency((coupleResult as any).survivorScenarios.spouse2Outlives.totalSurvivorBenefit)}
                        </span>
                      </div>
                    </div>
                    {(coupleResult as any).survivorScenarios.spouse2Outlives.presentValueSurvivorBenefit && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Present value:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency((coupleResult as any).survivorScenarios.spouse2Outlives.presentValueSurvivorBenefit)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legacy Survivor Benefits Display - Fallback for non-enhanced results */}
        {!hasEnhancedFeatures && optimalStrategy.survivorBenefitScenarios.length > 0 && (
          <div className="card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Survivor Benefit Scenarios
            </h3>
            <div className="space-y-3">
              {optimalStrategy.survivorBenefitScenarios.map((scenario, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    If Spouse {scenario.deceasedSpouse} passes away:
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Survivor benefit:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(scenario.survivorBenefit)}/month
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Years as survivor:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {scenario.yearsAsSurvivor} years
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total survivor benefit:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(scenario.totalSurvivorBenefit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategy Comparison */}
        {hasEnhancedFeatures && (coupleResult as any).allStrategies && (coupleResult as any).allStrategies.length > 0 && (
          <Suspense fallback={<ComponentLoader />}>
            <StrategyComparison
              mode="couple"
              optimalStrategy={(coupleResult as any).allStrategies.find(
                (s: any) => 
                  s.spouse1ClaimingAge === optimalStrategy.spouse1ClaimingAge &&
                  s.spouse2ClaimingAge === optimalStrategy.spouse2ClaimingAge
              ) || (coupleResult as any).allStrategies[0]}
              allStrategies={(coupleResult as any).allStrategies}
              selectedStrategy={selectedStrategy as CoupleStrategyEvaluation}
              onStrategySelect={handleStrategySelect}
            />
          </Suspense>
        )}

        {/* Year-by-Year Projection Table */}
        {hasEnhancedFeatures && (coupleResult as any).yearlyProjections && (
          <div className="card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Year-by-Year Benefit Projections
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Detailed breakdown of combined household benefits from claiming ages through life expectancy
              {selectedStrategy && ` for ages ${(selectedStrategy as CoupleStrategyEvaluation).spouse1ClaimingAge}/${(selectedStrategy as CoupleStrategyEvaluation).spouse2ClaimingAge}`}:
            </p>
            <Suspense fallback={<ComponentLoader />}>
              <ProjectionTable
                projections={
                  selectedStrategy && (selectedStrategy as CoupleStrategyEvaluation).yearlyProjections
                    ? (selectedStrategy as CoupleStrategyEvaluation).yearlyProjections
                    : (coupleResult as any).yearlyProjections as CoupleYearlyProjection[]
                }
                mode="couple"
                showSurvivorScenarios={true}
              />
            </Suspense>
          </div>
        )}

        {/* Present Value Display */}
        {hasEnhancedFeatures && optimalPresentValue && discountRate !== undefined && onDiscountRateChange && (
          <div className="card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Present Value Analysis
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Compare the time value of money for your combined household benefits:
            </p>
            <Suspense fallback={<ComponentLoader />}>
              <PresentValueDisplay
                selectedStrategyPV={
                  selectedStrategy && (selectedStrategy as CoupleStrategyEvaluation).combinedPresentValue
                    ? (selectedStrategy as CoupleStrategyEvaluation).combinedPresentValue
                    : optimalPresentValue
                }
                optimalStrategyPV={optimalPresentValue}
                discountRate={discountRate}
                onDiscountRateChange={onDiscountRateChange}
              />
            </Suspense>
          </div>
        )}

        {/* Alternative Strategies */}
        {alternativeStrategies.length > 0 && (
          <div className="card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Alternative Strategies
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              These strategies provide similar combined lifetime benefits (within 2% of optimal):
            </p>
            <div className="space-y-2 sm:space-y-3">
              {alternativeStrategies.map((strategy, index) => {
                // Calculate difference from optimal
                const lifetimeDiff = strategy.combinedLifetimeBenefit - optimalStrategy.combinedLifetimeBenefit;
                const lifetimePercent = (lifetimeDiff / optimalStrategy.combinedLifetimeBenefit) * 100;
                const hasPV = 'combinedPresentValue' in strategy;
                const pvDiff = hasPV && optimalPresentValue 
                  ? (strategy as any).combinedPresentValue - optimalPresentValue 
                  : 0;
                
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 sm:mb-3 gap-2">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          You: Age {strategy.spouse1ClaimingAge} | Spouse: Age{' '}
                          {strategy.spouse2ClaimingAge}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatCurrency(strategy.combinedMonthlyBenefit)}/month combined
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">
                          {formatCurrency(strategy.combinedLifetimeBenefit)}
                        </p>
                        <p className="text-xs text-gray-500">lifetime total</p>
                      </div>
                    </div>
                    
                    {/* Present Value if available */}
                    {hasPV && (strategy as any).combinedPresentValue && (
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                        <span className="text-xs text-gray-600">Present value:</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {formatCurrency((strategy as any).combinedPresentValue)}
                        </span>
                      </div>
                    )}
                    
                    {/* Comparison with Optimal */}
                    <div className="bg-white rounded p-2 mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Compared to optimal:</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Lifetime difference:</span>
                        <span className={`text-xs font-semibold ${lifetimeDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(lifetimeDiff))} ({formatPercentage(lifetimePercent)})
                        </span>
                      </div>
                      {hasPV && pvDiff !== 0 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600">PV difference:</span>
                          <span className={`text-xs font-semibold ${pvDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(pvDiff))}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {strategy.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              Calculation Results
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Export your results to review offline or share with a financial advisor
            </p>
          </div>
        </div>
        <Suspense fallback={<ComponentLoader />}>
          <ExportButton result={result} mode={mode} inputData={inputData} />
        </Suspense>
      </div>

      {mode === 'individual' && result.individual && renderIndividualResults(result.individual)}
      {mode === 'couple' && result.couple && renderCoupleResults(result.couple)}
    </div>
  );
};

export default ResultsDisplay;
