/**
 * BenefitsChart Component
 * 
 * Visualizes lifetime Social Security benefits across different claiming ages (62-70)
 * using Recharts library. Highlights the optimal claiming age and provides interactive
 * tooltips with detailed benefit information.
 * 
 * Features:
 * - Line chart showing lifetime benefits by claiming age
 * - Visual highlight for optimal claiming age
 * - Interactive tooltips with monthly and lifetime benefits
 * - Responsive design that adapts to container width
 * - Mobile-optimized simplified display
 * - Consistent styling with design system
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { BenefitsChartProps, ChartDataPoint } from '../types/calculator.types';

/**
 * Custom tooltip component for displaying detailed benefit information
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-4 border-2 border-blue-600 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">
          Claiming Age: {label}
        </p>
        <p className="text-sm text-gray-700">
          Monthly Benefit: <span className="font-semibold">${data.monthlyBenefit.toLocaleString()}</span>
        </p>
        <p className="text-sm text-gray-700">
          Lifetime Benefit: <span className="font-semibold">${data.lifetimeBenefit.toLocaleString()}</span>
        </p>
        {data.inflationAdjustedLifetimeBenefit !== data.lifetimeBenefit && (
          <p className="text-sm text-gray-600 mt-1">
            Inflation-Adjusted: ${data.inflationAdjustedLifetimeBenefit.toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  
  return null;
};

/**
 * Format currency values for axis labels
 */
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

/**
 * BenefitsChart Component
 */
const BenefitsChart: React.FC<BenefitsChartProps> = ({ data, optimalAge, mode }) => {
  // Find the optimal data point for highlighting
  const optimalDataPoint = data.find(point => point.claimingAge === optimalAge);
  
  // Determine if we're on mobile (simplified display)
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
        Lifetime Benefits by Claiming Age
      </h2>
      
      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
        Compare total lifetime benefits for different claiming ages. 
        The optimal age of <span className="font-semibold text-emerald-600">{optimalAge}</span> is highlighted.
      </p>
      
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 400}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: isMobile ? 10 : 30,
            left: isMobile ? 0 : 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis
            dataKey="claimingAge"
            label={{
              value: 'Claiming Age',
              position: 'insideBottom',
              offset: -5,
              style: { fontSize: isMobile ? 12 : 14 }
            }}
            tick={{ fontSize: isMobile ? 11 : 12 }}
            stroke="#6b7280"
          />
          
          <YAxis
            tickFormatter={formatCurrency}
            label={{
              value: 'Lifetime Benefits',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: isMobile ? 12 : 14 }
            }}
            tick={{ fontSize: isMobile ? 11 : 12 }}
            stroke="#6b7280"
            width={isMobile ? 60 : 80}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {!isMobile && (
            <Legend
              wrapperStyle={{ fontSize: 14 }}
              iconType="line"
            />
          )}
          
          {/* Main benefit line */}
          <Line
            type="monotone"
            dataKey="lifetimeBenefit"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4, fill: '#2563eb' }}
            activeDot={{ r: 6 }}
            name="Lifetime Benefits"
          />
          
          {/* Highlight optimal claiming age with a special marker */}
          {optimalDataPoint && (
            <ReferenceDot
              x={optimalAge}
              y={optimalDataPoint.lifetimeBenefit}
              r={8}
              fill="#059669"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend for mobile */}
      {isMobile && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span className="text-gray-700">Lifetime Benefits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
            <span className="text-gray-700">Optimal Age</span>
          </div>
        </div>
      )}
      
      {/* Additional context for couple mode */}
      {mode === 'couple' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Note:</span> For married couples, this chart shows 
            combined household lifetime benefits for the optimal claiming strategy.
          </p>
        </div>
      )}
    </div>
  );
};

export default BenefitsChart;
