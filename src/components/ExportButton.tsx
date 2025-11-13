/**
 * ExportButton Component
 * 
 * Provides export functionality for Social Security calculation results.
 * Exports data in CSV format including summary information, input parameters,
 * year-by-year projections, and survivor scenarios for couples.
 * 
 * Features:
 * - Export to CSV format
 * - Timestamped filename
 * - Includes all calculation details
 * - Error handling with user feedback
 * - Success/error messages
 */

import React, { useState } from 'react';
import {
  CalculationResult,
  IndividualResult,
  CoupleResult,
  YearlyProjection,
  CoupleYearlyProjection,
} from '../types/calculator.types';

interface ExportButtonProps {
  result: CalculationResult;
  mode: 'individual' | 'couple';
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

const ExportButton: React.FC<ExportButtonProps> = ({ result, mode, inputData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Format currency values for CSV
   */
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  /**
   * Generate timestamped filename
   */
  const generateFilename = (): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `social-security-calculation-${mode}-${timestamp}.csv`;
  };

  /**
   * Escape CSV values (handle commas, quotes, newlines)
   */
  const escapeCsvValue = (value: string | number): string => {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  /**
   * Generate CSV content for individual results
   */
  const generateIndividualCsv = (individualResult: IndividualResult): string => {
    const lines: string[] = [];
    const assumptions = result.metadata.assumptions;

    // Header
    lines.push('Social Security Calculation Results - Individual');
    lines.push(`Generated: ${new Date(result.metadata.calculatedAt).toLocaleString('en-US')}`);
    lines.push('');

    // Input Parameters
    lines.push('INPUT PARAMETERS');
    if (inputData?.birthDate) {
      lines.push(`Birth Date,${formatDate(inputData.birthDate)}`);
    }
    if (inputData?.pia) {
      lines.push(`Primary Insurance Amount (PIA),${formatCurrency(inputData.pia)}`);
    }

    lines.push(`Inflation Rate,${(assumptions.inflationRate * 100).toFixed(2)}%`);
    if (assumptions.discountRate !== undefined) {
      lines.push(`Discount Rate,${(assumptions.discountRate * 100).toFixed(2)}%`);
    }
    lines.push('');

    // Optimal Strategy Summary
    lines.push('OPTIMAL STRATEGY');
    lines.push(`Optimal Claiming Age,${individualResult.optimalAge}`);
    lines.push(`Full Retirement Age (FRA),${individualResult.fra}`);
    lines.push(`Monthly Benefit,${formatCurrency(individualResult.optimalMonthlyBenefit)}`);
    lines.push(`Total Lifetime Benefits,${formatCurrency(individualResult.optimalLifetimeBenefit)}`);
    
    // Enhanced features
    const hasEnhancedFeatures = 'optimalPresentValue' in individualResult;
    if (hasEnhancedFeatures) {
      lines.push(`Present Value,${formatCurrency((individualResult as any).optimalPresentValue)}`);
    }
    lines.push('');

    // Comparison with Age 62
    if (individualResult.comparisonWithAge62 && individualResult.optimalAge !== 62) {
      lines.push('COMPARISON WITH AGE 62');
      lines.push(`Age 62 Monthly Benefit,${formatCurrency(individualResult.comparisonWithAge62.age62MonthlyBenefit)}`);
      lines.push(`Age 62 Lifetime Benefit,${formatCurrency(individualResult.comparisonWithAge62.age62LifetimeBenefit)}`);
      lines.push(`Additional Lifetime Benefit,${formatCurrency(individualResult.comparisonWithAge62.additionalLifetimeBenefit)}`);
      lines.push(`Percentage Increase,${individualResult.comparisonWithAge62.percentageIncrease.toFixed(2)}%`);
      lines.push('');
    }

    // Year-by-Year Projections
    if (hasEnhancedFeatures && (individualResult as any).yearlyProjections) {
      lines.push('YEAR-BY-YEAR PROJECTIONS');
      lines.push('Year,Age,Monthly Benefit,Annual Benefit,Inflation Adjusted,Cumulative Total');
      
      const projections = (individualResult as any).yearlyProjections as YearlyProjection[];
      projections.forEach((proj) => {
        lines.push(
          `${proj.year},${proj.age},${formatCurrency(proj.retirementBenefit)},${formatCurrency(proj.annualBenefit)},${formatCurrency(proj.inflationAdjustedBenefit)},${formatCurrency(proj.cumulativeBenefit)}`
        );
      });
      lines.push('');
    }

    // Alternative Strategies
    if (individualResult.alternativeStrategies.length > 0) {
      lines.push('ALTERNATIVE STRATEGIES (within 2% of optimal)');
      lines.push('Claiming Age,Monthly Benefit,Lifetime Benefit,Present Value,Description');
      
      individualResult.alternativeStrategies.forEach((strategy) => {
        const pv = 'presentValue' in strategy ? formatCurrency((strategy as any).presentValue) : 'N/A';
        lines.push(
          `${strategy.claimingAge},${formatCurrency(strategy.monthlyBenefit)},${formatCurrency(strategy.lifetimeBenefit)},${pv},${escapeCsvValue(strategy.description)}`
        );
      });
      lines.push('');
    }

    return lines.join('\n');
  };

  /**
   * Generate CSV content for couple results
   */
  const generateCoupleCsv = (coupleResult: CoupleResult): string => {
    const lines: string[] = [];
    const assumptions = result.metadata.assumptions;
    const { optimalStrategy } = coupleResult;

    // Header
    lines.push('Social Security Calculation Results - Couple');
    lines.push(`Generated: ${new Date(result.metadata.calculatedAt).toLocaleString('en-US')}`);
    lines.push('');

    // Input Parameters
    lines.push('INPUT PARAMETERS');
    if (inputData?.spouse1) {
      lines.push('You');
      lines.push(`  Birth Date,${formatDate(inputData.spouse1.birthDate)}`);
      lines.push(`  Primary Insurance Amount (PIA),${formatCurrency(inputData.spouse1.pia)}`);
    }
    if (inputData?.spouse2) {
      lines.push('Your Spouse');
      lines.push(`  Birth Date,${formatDate(inputData.spouse2.birthDate)}`);
      lines.push(`  Primary Insurance Amount (PIA),${formatCurrency(inputData.spouse2.pia)}`);
    }
    lines.push(`Inflation Rate,${(assumptions.inflationRate * 100).toFixed(2)}%`);
    if (assumptions.discountRate !== undefined) {
      lines.push(`Discount Rate,${(assumptions.discountRate * 100).toFixed(2)}%`);
    }
    lines.push('');

    // Optimal Strategy Summary
    lines.push('OPTIMAL STRATEGY');
    lines.push(`Your Claiming Age,${optimalStrategy.spouse1ClaimingAge}`);
    lines.push(`Spouse Claiming Age,${optimalStrategy.spouse2ClaimingAge}`);
    lines.push(`Your FRA,${coupleResult.spouse1Fra}`);
    lines.push(`Spouse FRA,${coupleResult.spouse2Fra}`);
    lines.push(`Your Monthly Benefit,${formatCurrency(optimalStrategy.spouse1MonthlyBenefit)}`);
    lines.push(`Spouse Monthly Benefit,${formatCurrency(optimalStrategy.spouse2MonthlyBenefit)}`);
    if (optimalStrategy.spousalBenefitAmount > 0) {
      lines.push(`Spousal Benefit,${formatCurrency(optimalStrategy.spousalBenefitAmount)}`);
    }
    lines.push(`Combined Monthly Benefit,${formatCurrency(optimalStrategy.combinedMonthlyBenefit)}`);
    lines.push(`Combined Lifetime Benefit,${formatCurrency(optimalStrategy.combinedLifetimeBenefit)}`);
    
    // Enhanced features
    const hasEnhancedFeatures = 'optimalPresentValue' in coupleResult;
    if (hasEnhancedFeatures) {
      lines.push(`Present Value,${formatCurrency((coupleResult as any).optimalPresentValue)}`);
    }
    lines.push('');

    // Survivor Scenarios
    if (hasEnhancedFeatures && (coupleResult as any).survivorScenarios) {
      lines.push('SURVIVOR BENEFIT SCENARIOS');
      
      const scenarios = (coupleResult as any).survivorScenarios;
      if (scenarios.spouse1Outlives) {
        lines.push('If You Outlive Your Spouse');
        lines.push(`  Survivor Benefit (monthly),${formatCurrency(scenarios.spouse1Outlives.survivorBenefit)}`);
        lines.push(`  Years as Survivor,${scenarios.spouse1Outlives.yearsAsSurvivor}`);
        lines.push(`  Total Survivor Benefits,${formatCurrency(scenarios.spouse1Outlives.totalSurvivorBenefit)}`);
        if (scenarios.spouse1Outlives.presentValueSurvivorBenefit) {
          lines.push(`  Present Value,${formatCurrency(scenarios.spouse1Outlives.presentValueSurvivorBenefit)}`);
        }
      }
      
      if (scenarios.spouse2Outlives) {
        lines.push('If Your Spouse Outlives You');
        lines.push(`  Survivor Benefit (monthly),${formatCurrency(scenarios.spouse2Outlives.survivorBenefit)}`);
        lines.push(`  Years as Survivor,${scenarios.spouse2Outlives.yearsAsSurvivor}`);
        lines.push(`  Total Survivor Benefits,${formatCurrency(scenarios.spouse2Outlives.totalSurvivorBenefit)}`);
        if (scenarios.spouse2Outlives.presentValueSurvivorBenefit) {
          lines.push(`  Present Value,${formatCurrency(scenarios.spouse2Outlives.presentValueSurvivorBenefit)}`);
        }
      }
      lines.push('');
    } else if (optimalStrategy.survivorBenefitScenarios && optimalStrategy.survivorBenefitScenarios.length > 0) {
      // Legacy survivor scenarios
      lines.push('SURVIVOR BENEFIT SCENARIOS');
      optimalStrategy.survivorBenefitScenarios.forEach((scenario) => {
        lines.push(`If Spouse ${scenario.deceasedSpouse} Passes Away`);
        lines.push(`  Survivor Benefit (monthly),${formatCurrency(scenario.survivorBenefit)}`);
        lines.push(`  Years as Survivor,${scenario.yearsAsSurvivor}`);
        lines.push(`  Total Survivor Benefits,${formatCurrency(scenario.totalSurvivorBenefit)}`);
      });
      lines.push('');
    }

    // Year-by-Year Projections
    if (hasEnhancedFeatures && (coupleResult as any).yearlyProjections) {
      lines.push('YEAR-BY-YEAR PROJECTIONS');
      lines.push('Year,Your Age,Spouse Age,Your Benefit,Spouse Benefit,Spousal Benefit,Survivor Benefit,Total Monthly,Total Annual,Inflation Adjusted,Cumulative');
      
      const projections = (coupleResult as any).yearlyProjections as CoupleYearlyProjection[];
      projections.forEach((proj) => {
        lines.push(
          `${proj.year},${proj.spouse1Age},${proj.spouse2Age},${formatCurrency(proj.spouse1RetirementBenefit)},${formatCurrency(proj.spouse2RetirementBenefit)},${formatCurrency(proj.spousalBenefit)},${formatCurrency(proj.survivorBenefit)},${formatCurrency(proj.totalMonthlyBenefit)},${formatCurrency(proj.totalAnnualBenefit)},${formatCurrency(proj.inflationAdjustedTotal)},${formatCurrency(proj.cumulativeBenefit)}`
        );
      });
      lines.push('');
    }

    // Alternative Strategies
    if (coupleResult.alternativeStrategies.length > 0) {
      lines.push('ALTERNATIVE STRATEGIES (within 2% of optimal)');
      lines.push('Your Age,Spouse Age,Combined Monthly,Combined Lifetime,Present Value,Description');
      
      coupleResult.alternativeStrategies.forEach((strategy) => {
        const pv = 'combinedPresentValue' in strategy ? formatCurrency((strategy as any).combinedPresentValue) : 'N/A';
        lines.push(
          `${strategy.spouse1ClaimingAge},${strategy.spouse2ClaimingAge},${formatCurrency(strategy.combinedMonthlyBenefit)},${formatCurrency(strategy.combinedLifetimeBenefit)},${pv},${escapeCsvValue(strategy.description)}`
        );
      });
      lines.push('');
    }

    return lines.join('\n');
  };

  /**
   * Handle export button click
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);

      // Generate CSV content based on mode
      let csvContent: string;
      if (mode === 'individual' && result.individual) {
        csvContent = generateIndividualCsv(result.individual);
      } else if (mode === 'couple' && result.couple) {
        csvContent = generateCoupleCsv(result.couple);
      } else {
        throw new Error('Invalid result data for export');
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      setMessage({ type: 'success', text: 'Results exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to export results. Please try again.' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
        aria-label="Export calculation results to CSV"
      >
        {isExporting ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export to CSV</span>
          </>
        )}
      </button>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          role="alert"
        >
          {message.type === 'success' ? (
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
