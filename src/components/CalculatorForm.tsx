/**
 * CalculatorForm Component
 * 
 * Main form for collecting user inputs for Social Security benefit calculations.
 * Supports both individual and married couple modes with real-time validation.
 */

import React, { useState, useEffect } from 'react';
import {
  CalculationInput,
  AssumptionData,
} from '../types/calculator.types';

interface CalculatorFormProps {
  mode: 'individual' | 'couple';
  onCalculate: (data: CalculationInput) => void;
  isLoading: boolean;
  onModeChange: (mode: 'individual' | 'couple') => void;
}

interface FormErrors {
  birthDate?: string;
  pia?: string;
  spouse1BirthDate?: string;
  spouse1Pia?: string;
  spouse2BirthDate?: string;
  spouse2Pia?: string;
  inflationRate?: string;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  mode,
  onCalculate,
  isLoading,
  onModeChange,
}) => {
  // Individual form state
  const [birthDate, setBirthDate] = useState('');
  const [pia, setPia] = useState('');

  // Couple form state - Pre-filled with default values
  const [spouse1BirthDate, setSpouse1BirthDate] = useState('1963-12-02');
  const [spouse1Pia, setSpouse1Pia] = useState('4000');
  const [spouse2BirthDate, setSpouse2BirthDate] = useState('1967-06-21');
  const [spouse2Pia, setSpouse2Pia] = useState('1700');

  // Shared state
  const [inflationRate, setInflationRate] = useState('0');
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when mode changes
  useEffect(() => {
    setErrors({});
  }, [mode]);

  /**
   * Validate birth date
   */
  const validateBirthDate = (value: string): string | undefined => {
    if (!value) {
      return 'Birth date is required';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Invalid date format';
    }

    const currentYear = new Date().getFullYear();
    const birthYear = date.getFullYear();
    const age = currentYear - birthYear;

    if (age < 50 || age > 70) {
      return 'Age must be between 50 and 70 years';
    }

    return undefined;
  };

  /**
   * Validate PIA
   */
  const validatePia = (value: string): string | undefined => {
    if (!value) {
      return 'PIA is required';
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'PIA must be a valid number';
    }

    if (numValue < 1 || numValue > 5000) {
      return 'PIA must be between $1 and $5,000';
    }

    return undefined;
  };



  /**
   * Validate inflation rate
   */
  const validateInflationRate = (value: string): string | undefined => {
    if (!value) {
      return 'Inflation rate is required';
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Inflation rate must be a valid number';
    }

    if (numValue < 0 || numValue > 10) {
      return 'Inflation rate must be between 0% and 10%';
    }

    return undefined;
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'individual') {
      newErrors.birthDate = validateBirthDate(birthDate);
      newErrors.pia = validatePia(pia);
    } else {
      newErrors.spouse1BirthDate = validateBirthDate(spouse1BirthDate);
      newErrors.spouse1Pia = validatePia(spouse1Pia);
      newErrors.spouse2BirthDate = validateBirthDate(spouse2BirthDate);
      newErrors.spouse2Pia = validatePia(spouse2Pia);
    }

    newErrors.inflationRate = validateInflationRate(inflationRate);

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const assumptions: AssumptionData = {
      inflationRate: parseFloat(inflationRate) / 100,
      useInflationAdjusted: parseFloat(inflationRate) > 0,
    };

    if (mode === 'individual') {
      const calculationInput: CalculationInput = {
        mode: 'individual',
        individual: {
          birthDate,
          pia: parseFloat(pia),
          lifeExpectancy: 100, // Use maximum lifespan
          inflationRate: parseFloat(inflationRate) / 100,
        },
        assumptions,
      };
      onCalculate(calculationInput);
    } else {
      const calculationInput: CalculationInput = {
        mode: 'couple',
        couple: {
          spouse1: {
            birthDate: spouse1BirthDate,
            pia: parseFloat(spouse1Pia),
            lifeExpectancy: 100, // Use maximum lifespan
          },
          spouse2: {
            birthDate: spouse2BirthDate,
            pia: parseFloat(spouse2Pia),
            lifeExpectancy: 100, // Use maximum lifespan
          },
          inflationRate: parseFloat(inflationRate) / 100,
        },
        assumptions,
      };
      onCalculate(calculationInput);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Calculate Your Benefits</h2>

      {/* Mode Toggle */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Calculation Mode
        </label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onModeChange('individual')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 min-h-[44px] ${
              mode === 'individual'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
            disabled={isLoading}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => onModeChange('couple')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 min-h-[44px] ${
              mode === 'couple'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }`}
            disabled={isLoading}
          >
            Married Couple
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Individual Mode Inputs */}
        {mode === 'individual' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Your Information</h3>

            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                Birth Date
              </label>
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                onBlur={() => {
                  const error = validateBirthDate(birthDate);
                  setErrors(prev => ({ ...prev, birthDate: error }));
                }}
                className={`input-field ${errors.birthDate ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.birthDate && (
                <p className="error-message">{errors.birthDate}</p>
              )}
            </div>

            {/* PIA */}
            <div>
              <label htmlFor="pia" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Insurance Amount (PIA)
                <span className="text-gray-500 text-xs ml-2">Monthly benefit at full retirement age</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="pia"
                  value={pia}
                  onChange={(e) => setPia(e.target.value)}
                  onBlur={() => {
                    const error = validatePia(pia);
                    setErrors(prev => ({ ...prev, pia: error }));
                  }}
                  placeholder="2000"
                  min="1"
                  max="5000"
                  step="1"
                  className={`input-field pl-8 ${errors.pia ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.pia && (
                <p className="error-message">{errors.pia}</p>
              )}
            </div>
          </div>
        )}

        {/* Couple Mode Inputs */}
        {mode === 'couple' && (
          <div className="space-y-4 sm:space-y-6">
            {/* You */}
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Your Information</h3>

              <div>
                <label htmlFor="spouse1BirthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  id="spouse1BirthDate"
                  value={spouse1BirthDate}
                  onChange={(e) => setSpouse1BirthDate(e.target.value)}
                  onBlur={() => {
                    const error = validateBirthDate(spouse1BirthDate);
                    setErrors(prev => ({ ...prev, spouse1BirthDate: error }));
                  }}
                  className={`input-field ${errors.spouse1BirthDate ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.spouse1BirthDate && (
                  <p className="error-message">{errors.spouse1BirthDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="spouse1Pia" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Insurance Amount (PIA)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="spouse1Pia"
                    value={spouse1Pia}
                    onChange={(e) => setSpouse1Pia(e.target.value)}
                    onBlur={() => {
                      const error = validatePia(spouse1Pia);
                      setErrors(prev => ({ ...prev, spouse1Pia: error }));
                    }}
                    placeholder="2000"
                    min="1"
                    max="5000"
                    step="1"
                    className={`input-field pl-8 ${errors.spouse1Pia ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.spouse1Pia && (
                  <p className="error-message">{errors.spouse1Pia}</p>
                )}
              </div>
            </div>

            {/* Spouse */}
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Your Spouse's Information</h3>

              <div>
                <label htmlFor="spouse2BirthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  id="spouse2BirthDate"
                  value={spouse2BirthDate}
                  onChange={(e) => setSpouse2BirthDate(e.target.value)}
                  onBlur={() => {
                    const error = validateBirthDate(spouse2BirthDate);
                    setErrors(prev => ({ ...prev, spouse2BirthDate: error }));
                  }}
                  className={`input-field ${errors.spouse2BirthDate ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.spouse2BirthDate && (
                  <p className="error-message">{errors.spouse2BirthDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="spouse2Pia" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Insurance Amount (PIA)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="spouse2Pia"
                    value={spouse2Pia}
                    onChange={(e) => setSpouse2Pia(e.target.value)}
                    onBlur={() => {
                      const error = validatePia(spouse2Pia);
                      setErrors(prev => ({ ...prev, spouse2Pia: error }));
                    }}
                    placeholder="2000"
                    min="1"
                    max="5000"
                    step="1"
                    className={`input-field pl-8 ${errors.spouse2Pia ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.spouse2Pia && (
                  <p className="error-message">{errors.spouse2Pia}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inflation Rate (shared) */}
        <div>
          <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Annual Inflation Rate (%)
          </label>
          <input
            type="number"
            id="inflationRate"
            value={inflationRate}
            onChange={(e) => setInflationRate(e.target.value)}
            onBlur={() => {
              const error = validateInflationRate(inflationRate);
              setErrors(prev => ({ ...prev, inflationRate: error }));
            }}
            placeholder="0"
            min="0"
            max="10"
            step="0.1"
            className={`input-field ${errors.inflationRate ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.inflationRate && (
            <p className="error-message">{errors.inflationRate}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </span>
            ) : (
              'Calculate Optimal Strategy'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalculatorForm;
