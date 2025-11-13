# ExportButton Component

## Overview

The `ExportButton` component provides comprehensive export functionality for Social Security calculation results. It generates CSV files containing all calculation details, including summary information, input parameters, year-by-year projections, and survivor scenarios for couples.

## Features

- **CSV Export**: Exports data in CSV format for easy import into spreadsheet applications
- **Timestamped Filenames**: Automatically generates filenames with timestamps for easy organization
- **Comprehensive Data**: Includes all calculation details:
  - Input parameters (birth dates, PIA, life expectancy, assumptions)
  - Optimal strategy summary
  - Year-by-year benefit projections
  - Survivor benefit scenarios (for couples)
  - Alternative strategies
  - Comparison with age 62 claiming
- **Error Handling**: Gracefully handles export errors with user-friendly messages
- **Success Feedback**: Shows success message after successful export
- **Loading State**: Displays loading indicator during export process

## Usage

```tsx
import ExportButton from './components/ExportButton';

<ExportButton 
  result={calculationResult}
  mode="individual" // or "couple"
  inputData={{
    birthDate: "1960-01-01",
    pia: 3000,
    lifeExpectancy: 85
  }}
/>
```

## Props

### `result` (required)
- Type: `CalculationResult`
- Description: The calculation result object containing all calculation data

### `mode` (required)
- Type: `'individual' | 'couple'`
- Description: The calculation mode (individual or couple)

### `inputData` (optional)
- Type: Object with the following structure:
  ```typescript
  {
    // For individual mode:
    birthDate?: string;
    pia?: number;
    lifeExpectancy?: number;
    
    // For couple mode:
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
  }
  ```
- Description: Original input data used for the calculation

## CSV Export Format

### Individual Mode

The exported CSV includes the following sections:

1. **Header**: Title and generation timestamp
2. **Input Parameters**: Birth date, PIA, life expectancy, inflation rate, discount rate
3. **Optimal Strategy**: Claiming age, FRA, monthly benefit, lifetime benefit, present value
4. **Comparison with Age 62**: Benefits at age 62 and differences
5. **Year-by-Year Projections**: Detailed annual projections with columns:
   - Year
   - Age
   - Monthly Benefit
   - Annual Benefit
   - Inflation Adjusted
   - Cumulative Total
6. **Alternative Strategies**: Near-optimal strategies within 2% of optimal

### Couple Mode

The exported CSV includes the following sections:

1. **Header**: Title and generation timestamp
2. **Input Parameters**: Both spouses' data, inflation rate, discount rate
3. **Optimal Strategy**: Claiming ages, FRAs, individual and combined benefits, present value
4. **Survivor Benefit Scenarios**: Projections for both survivor scenarios
5. **Year-by-Year Projections**: Detailed annual projections with columns:
   - Year
   - Spouse 1 Age
   - Spouse 2 Age
   - Spouse 1 Benefit
   - Spouse 2 Benefit
   - Spousal Benefit
   - Survivor Benefit
   - Total Monthly
   - Total Annual
   - Inflation Adjusted
   - Cumulative
6. **Alternative Strategies**: Near-optimal couple strategies within 2% of optimal

## File Naming Convention

Files are named using the following pattern:
```
social-security-calculation-{mode}-{timestamp}.csv
```

Example:
```
social-security-calculation-individual-2025-11-11T14-30-45.csv
```

## Error Handling

The component handles the following error scenarios:

1. **Invalid Result Data**: Shows error if result data is missing or invalid
2. **Export Failure**: Catches and displays any errors during CSV generation or download
3. **Browser Compatibility**: Uses standard browser APIs for maximum compatibility

## Accessibility

- Button includes proper ARIA labels
- Loading state is clearly indicated
- Success/error messages use appropriate color coding and icons
- Keyboard accessible

## Browser Compatibility

The component uses standard browser APIs:
- `Blob` API for file creation
- `URL.createObjectURL()` for download links
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Implementation Details

### CSV Value Escaping

The component properly escapes CSV values to handle:
- Commas in text
- Quotes in text
- Newlines in text

### Currency Formatting

All monetary values are formatted as:
- Dollar sign prefix
- Two decimal places
- Example: `$3,972.00`

### Date Formatting

Dates are formatted using locale-specific formatting:
- Example: `11/11/2025` (US locale)

## Testing

To test the export functionality:

1. Complete a calculation (individual or couple)
2. Click the "Export to CSV" button
3. Verify the file downloads with correct filename
4. Open the CSV in a spreadsheet application
5. Verify all data is present and correctly formatted

## Future Enhancements

Potential improvements for future versions:

1. **Multiple Format Support**: Add PDF, Excel, or JSON export options
2. **Custom Column Selection**: Allow users to choose which columns to export
3. **Email Integration**: Option to email results directly
4. **Cloud Storage**: Save to Google Drive, Dropbox, etc.
5. **Print Preview**: Show preview before export

## Related Components

- `ResultsDisplay`: Parent component that includes the ExportButton
- `ProjectionTable`: Displays the year-by-year projections that are exported
- `StrategyComparison`: Shows alternative strategies that are included in export

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **Requirement 9.1**: Provides export button for downloading results
- **Requirement 9.2**: Exports data in CSV format
- **Requirement 9.3**: Includes all year-by-year projections in export
- **Requirement 9.4**: Includes summary information in export
- **Requirement 9.5**: Includes all input parameters in export
- **Requirement 9.6**: Names export file with timestamp
- **Requirement 9.7**: Includes both spouses' information for couple results
- **Requirement 9.8**: Includes survivor benefit scenarios in export
