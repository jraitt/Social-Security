/**
 * ProjectionTable Component
 * 
 * Displays year-by-year benefit projections in a responsive table format.
 * Shows retirement, spousal, and survivor benefits with annual totals.
 * 
 * Features:
 * - Responsive table layout with horizontal scrolling on mobile
 * - Column sorting functionality
 * - CSV export capability
 * - Highlighted total row
 * - Survivor scenario rows for couple mode
 * - Mobile-friendly collapsible design
 */

import React, { useState } from 'react';
import {
  YearlyProjection,
  CoupleYearlyProjection,
  SurvivorProjection,
} from '../types/calculator.types';

interface ProjectionTableProps {
  projections: YearlyProjection[] | CoupleYearlyProjection[];
  mode: 'individual' | 'couple';
  showSurvivorScenarios?: boolean;
  survivorScenarios?: {
    spouse1Outlives?: SurvivorProjection;
    spouse2Outlives?: SurvivorProjection;
  };
}

type SortColumn = 'year' | 'age' | 'retirement' | 'spousal' | 'survivor' | 'total';
type SortDirection = 'asc' | 'desc';

const ProjectionTable: React.FC<ProjectionTableProps> = ({
  projections,
  mode,
  showSurvivorScenarios = false,
  survivorScenarios,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
   * Handle column sort
   */
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
   * Sort projections based on current sort settings
   */
  const getSortedProjections = () => {
    const sorted = [...projections];
    
    sorted.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (mode === 'individual') {
        const aProj = a as YearlyProjection;
        const bProj = b as YearlyProjection;
        
        switch (sortColumn) {
          case 'year':
            aValue = aProj.year;
            bValue = bProj.year;
            break;
          case 'age':
            aValue = aProj.age;
            bValue = bProj.age;
            break;
          case 'retirement':
            aValue = aProj.annualBenefit;
            bValue = bProj.annualBenefit;
            break;
          case 'total':
            aValue = aProj.annualBenefit;
            bValue = bProj.annualBenefit;
            break;
          default:
            aValue = aProj.year;
            bValue = bProj.year;
        }
      } else {
        const aProj = a as CoupleYearlyProjection;
        const bProj = b as CoupleYearlyProjection;
        
        switch (sortColumn) {
          case 'year':
            aValue = aProj.year;
            bValue = bProj.year;
            break;
          case 'age':
            aValue = aProj.spouse1Age;
            bValue = bProj.spouse1Age;
            break;
          case 'retirement':
            aValue = (aProj.spouse1RetirementBenefit + aProj.spouse2RetirementBenefit) * 12;
            bValue = (bProj.spouse1RetirementBenefit + bProj.spouse2RetirementBenefit) * 12;
            break;
          case 'spousal':
            aValue = aProj.spousalBenefit * 12;
            bValue = bProj.spousalBenefit * 12;
            break;
          case 'survivor':
            aValue = aProj.survivorBenefit * 12;
            bValue = bProj.survivorBenefit * 12;
            break;
          case 'total':
            aValue = aProj.totalAnnualBenefit;
            bValue = bProj.totalAnnualBenefit;
            break;
          default:
            aValue = aProj.year;
            bValue = bProj.year;
        }
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  };

  /**
   * Calculate total benefits
   */
  const calculateTotals = () => {
    if (mode === 'individual') {
      const individualProjections = projections as YearlyProjection[];
      const totalBenefit = individualProjections.reduce(
        (sum, proj) => sum + proj.annualBenefit,
        0
      );
      return { totalBenefit };
    } else {
      const coupleProjections = projections as CoupleYearlyProjection[];
      const totalRetirement = coupleProjections.reduce(
        (sum, proj) => sum + (proj.spouse1RetirementBenefit + proj.spouse2RetirementBenefit) * 12,
        0
      );
      const totalSpousal = coupleProjections.reduce(
        (sum, proj) => sum + proj.spousalBenefit * 12,
        0
      );
      const totalSurvivor = coupleProjections.reduce(
        (sum, proj) => sum + proj.survivorBenefit * 12,
        0
      );
      const totalBenefit = coupleProjections.reduce(
        (sum, proj) => sum + proj.totalAnnualBenefit,
        0
      );
      return { totalRetirement, totalSpousal, totalSurvivor, totalBenefit };
    }
  };

  /**
   * Export table data to CSV
   */
  const handleExportCSV = () => {
    let csvContent = '';
    
    if (mode === 'individual') {
      // Individual CSV headers
      csvContent = 'Year,Age,Annual Retirement Benefit,Cumulative Benefit\n';
      
      // Individual data rows
      const individualProjections = projections as YearlyProjection[];
      individualProjections.forEach((proj) => {
        csvContent += `${proj.year},${proj.age},${proj.annualBenefit},${proj.cumulativeBenefit}\n`;
      });
    } else {
      // Couple CSV headers
      csvContent = 'Year,Your Age,Spouse Age,Retirement Benefits,Spousal Benefit,Survivor Benefit,Total Annual Benefit,Cumulative Benefit\n';
      
      // Couple data rows
      const coupleProjections = projections as CoupleYearlyProjection[];
      coupleProjections.forEach((proj) => {
        const retirementTotal = (proj.spouse1RetirementBenefit + proj.spouse2RetirementBenefit) * 12;
        const spousalTotal = proj.spousalBenefit * 12;
        const survivorTotal = proj.survivorBenefit * 12;
        csvContent += `${proj.year},${proj.spouse1Age},${proj.spouse2Age},${retirementTotal},${spousalTotal},${survivorTotal},${proj.totalAnnualBenefit},${proj.cumulativeBenefit}\n`;
      });
      
      // Add survivor scenarios if available
      if (showSurvivorScenarios && survivorScenarios) {
        csvContent += '\nSurvivor Scenarios\n';
        if (survivorScenarios.spouse1Outlives) {
          csvContent += `If your spouse passes away,${survivorScenarios.spouse1Outlives.survivorBenefit * 12}\n`;
        }
        if (survivorScenarios.spouse2Outlives) {
          csvContent += `If you pass away,${survivorScenarios.spouse2Outlives.survivorBenefit * 12}\n`;
        }
      }
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `benefit-projections-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Render sort icon
   */
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const sortedProjections = getSortedProjections();
  const totals = calculateTotals();

  return (
    <div className="card">
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            Year-by-Year Benefit Projections
          </h3>
          <p className="text-xs text-gray-500 mt-1 sm:hidden">
            Scroll horizontally to view all columns
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Export projections to CSV file"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to CSV
        </button>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Benefit projections table">
              {/* Table Head */}
              <thead className="bg-gray-50">
                {mode === 'individual' ? (
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('year')}
                    >
                      <div className="flex items-center gap-1">
                        Year
                        {renderSortIcon('year')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('age')}
                    >
                      <div className="flex items-center gap-1">
                        Age
                        {renderSortIcon('age')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('retirement')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Annual Benefit
                        {renderSortIcon('retirement')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cumulative
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('year')}
                    >
                      <div className="flex items-center gap-1">
                        Year
                        {renderSortIcon('year')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('age')}
                    >
                      <div className="flex items-center gap-1">
                        Ages
                        {renderSortIcon('age')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Your Benefit
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Your Spousal
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Spouse Benefit
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Spouse Spousal
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('survivor')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Survivor
                        {renderSortIcon('survivor')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total
                        {renderSortIcon('total')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cumulative
                    </th>
                  </tr>
                )}
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {mode === 'individual' ? (
                  <>
                    {sortedProjections.map((proj) => {
                      const individualProj = proj as YearlyProjection;
                      return (
                        <tr key={individualProj.year} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {individualProj.year}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {individualProj.age}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(individualProj.annualBenefit)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(individualProj.cumulativeBenefit)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total Row */}
                    <tr className="bg-secondary-50 font-semibold">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                        Total Lifetime Benefits
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary-700 text-right font-bold">
                        {formatCurrency(totals.totalBenefit)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        —
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {sortedProjections.map((proj) => {
                      const coupleProj = proj as CoupleYearlyProjection;
                      const spouse1Retirement = coupleProj.spouse1RetirementBenefit * 12;
                      const spouse2Retirement = coupleProj.spouse2RetirementBenefit * 12;
                      const spousalTotal = coupleProj.spousalBenefit * 12;
                      const survivorTotal = coupleProj.survivorBenefit * 12;
                      
                      // Note: spousalBenefit is the total for both spouses
                      // Typically goes to the lower-earning spouse (spouse2 in most cases)
                      // For accurate breakdown, backend would need to track separately
                      
                      return (
                        <tr key={coupleProj.year} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {coupleProj.year}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {coupleProj.spouse1Age} / {coupleProj.spouse2Age}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(spouse1Retirement)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            —
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(spouse2Retirement)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {spousalTotal > 0 ? formatCurrency(spousalTotal) : '—'}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {survivorTotal > 0 ? formatCurrency(survivorTotal) : '—'}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(coupleProj.totalAnnualBenefit)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(coupleProj.cumulativeBenefit)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total Row */}
                    <tr className="bg-secondary-50 font-semibold">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                        Total Lifetime Benefits
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary-700 text-right">
                        —
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary-700 text-right">
                        —
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary-700 text-right">
                        —
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary-700 text-right">
                        {totals.totalSpousal && totals.totalSpousal > 0 ? formatCurrency(totals.totalSpousal) : '—'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary-700 text-right">
                        {totals.totalSurvivor && totals.totalSurvivor > 0 ? formatCurrency(totals.totalSurvivor) : '—'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary-700 text-right font-bold">
                        {formatCurrency(totals.totalBenefit)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        —
                      </td>
                    </tr>
                    
                    {/* Survivor Scenario Rows */}
                    {showSurvivorScenarios && survivorScenarios && (
                      <>
                        {/* Spacer Row */}
                        <tr className="bg-gray-100">
                          <td colSpan={9} className="px-3 py-2">
                            <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                              Survivor Benefit Scenarios
                            </p>
                          </td>
                        </tr>
                        
                        {/* If Your Spouse passes away (You outlive) */}
                        {survivorScenarios.spouse1Outlives && (
                          <tr className="bg-blue-50 border-l-4 border-blue-400">
                            <td className="px-3 py-4 text-sm text-gray-900" colSpan={2}>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">If your spouse passes away</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 text-right" colSpan={5}>
                              Survivor receives {formatCurrency(survivorScenarios.spouse1Outlives.survivorBenefit)}/month
                            </td>
                            <td className="px-3 py-4 text-sm text-blue-700 text-right font-semibold">
                              {formatCurrency(survivorScenarios.spouse1Outlives.totalSurvivorBenefit)}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500 text-right">
                              {survivorScenarios.spouse1Outlives.yearsAsSurvivor} years
                            </td>
                          </tr>
                        )}
                        
                        {/* If You pass away (Your Spouse outlives) */}
                        {survivorScenarios.spouse2Outlives && (
                          <tr className="bg-purple-50 border-l-4 border-purple-400">
                            <td className="px-3 py-4 text-sm text-gray-900" colSpan={2}>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">If you pass away</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 text-right" colSpan={5}>
                              Survivor receives {formatCurrency(survivorScenarios.spouse2Outlives.survivorBenefit)}/month
                            </td>
                            <td className="px-3 py-4 text-sm text-purple-700 text-right font-semibold">
                              {formatCurrency(survivorScenarios.spouse2Outlives.totalSurvivorBenefit)}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500 text-right">
                              {survivorScenarios.spouse2Outlives.yearsAsSurvivor} years
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionTable;
