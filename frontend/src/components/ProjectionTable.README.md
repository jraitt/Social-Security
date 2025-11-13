# ProjectionTable Component

## Overview

The `ProjectionTable` component displays year-by-year Social Security benefit projections in a responsive, sortable table format. It supports both individual and couple calculation modes, with special handling for survivor benefit scenarios.

## Features

### ✅ Implemented Features

1. **Responsive Table Layout**
   - Horizontal scrolling on mobile devices
   - Full table display on desktop
   - Mobile scroll indicator
   - Accessible table markup with ARIA labels

2. **Column Sorting**
   - Click any column header to sort
   - Toggle between ascending/descending order
   - Visual sort indicators (arrows)
   - Supports sorting by: Year, Age, Retirement, Spousal, Survivor, Total

3. **CSV Export**
   - Export button in header
   - Generates timestamped CSV files
   - Includes all projection data
   - Includes survivor scenarios for couple mode

4. **Benefit Type Display**
   - **Individual Mode**: Year, Age, Annual Benefit, Cumulative
   - **Couple Mode**: Year, Ages, Retirement, Spousal, Survivor, Total, Cumulative
   - Currency formatting with proper locale
   - Zero values displayed as "—" for clarity

5. **Highlighted Total Row**
   - Distinct background color (secondary-50)
   - Bold font for total values
   - Summarizes lifetime benefits

6. **Survivor Scenario Rows**
   - Color-coded scenarios (blue/purple)
   - "If Spouse 2 passes away" scenario
   - "If Spouse 1 passes away" scenario
   - Shows monthly benefit, years as survivor, and total

## Usage

### Individual Mode

```tsx
import ProjectionTable from './components/ProjectionTable';
import { YearlyProjection } from './types/calculator.types';

const projections: YearlyProjection[] = [
  {
    year: 2030,
    age: 70,
    retirementBenefit: 3972,
    annualBenefit: 47664,
    inflationAdjustedBenefit: 47664,
    cumulativeBenefit: 47664,
  },
  // ... more projections
];

<ProjectionTable
  projections={projections}
  mode="individual"
/>
```

### Couple Mode

```tsx
import ProjectionTable from './components/ProjectionTable';
import { CoupleYearlyProjection } from './types/calculator.types';

const projections: CoupleYearlyProjection[] = [
  {
    year: 2030,
    spouse1Age: 67,
    spouse2Age: 65,
    spouse1RetirementBenefit: 2500,
    spouse2RetirementBenefit: 1800,
    spousalBenefit: 0,
    survivorBenefit: 0,
    totalMonthlyBenefit: 4300,
    totalAnnualBenefit: 51600,
    inflationAdjustedTotal: 51600,
    cumulativeBenefit: 51600,
  },
  // ... more projections
];

<ProjectionTable
  projections={projections}
  mode="couple"
/>
```

### Couple Mode with Survivor Scenarios

```tsx
const survivorScenarios = {
  spouse1Outlives: {
    deceasedSpouse: 2,
    yearOfDeath: 2040,
    survivorAge: 75,
    survivorBenefit: 2575,
    yearsAsSurvivor: 10,
    yearlyProjections: [],
    totalSurvivorBenefit: 309000,
    presentValueSurvivorBenefit: 250000,
  },
  spouse2Outlives: {
    deceasedSpouse: 1,
    yearOfDeath: 2038,
    survivorAge: 73,
    survivorBenefit: 1854,
    yearsAsSurvivor: 12,
    yearlyProjections: [],
    totalSurvivorBenefit: 266976,
    presentValueSurvivorBenefit: 215000,
  },
};

<ProjectionTable
  projections={projections}
  mode="couple"
  showSurvivorScenarios={true}
  survivorScenarios={survivorScenarios}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `projections` | `YearlyProjection[]` \| `CoupleYearlyProjection[]` | Yes | Array of yearly benefit projections |
| `mode` | `'individual'` \| `'couple'` | Yes | Calculation mode |
| `showSurvivorScenarios` | `boolean` | No | Whether to display survivor scenarios (couple mode only) |
| `survivorScenarios` | `{ spouse1Outlives?, spouse2Outlives? }` | No | Survivor scenario data (required if showSurvivorScenarios is true) |

## Responsive Design

### Mobile (< 768px)
- Horizontal scrolling enabled
- Scroll indicator text shown
- Compact padding
- Full table functionality maintained

### Tablet (768px - 1023px)
- Improved spacing
- Better readability
- Optimized column widths

### Desktop (≥ 1024px)
- Full table display
- No scrolling needed
- Maximum readability

## Accessibility

- Semantic HTML table structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators on interactive elements
- High contrast colors for readability

## Requirements Satisfied

This component satisfies the following requirements from the design document:

- **Requirement 2.6**: Display projections in a tabular format with columns for each benefit type
- **Requirement 2.7**: Responsive table layout
- **Requirement 2.2**: Display retirement benefit amounts
- **Requirement 2.3**: Display spousal benefit amounts (couple mode)
- **Requirement 2.4**: Display survivor benefit amounts (couple mode)
- **Requirement 2.5**: Display total annual benefits
- **Requirement 2.8**: Display "if you outlive spouse" scenario
- **Requirement 2.9**: Display "if spouse outlives you" scenario
- **Requirement 5.5**: Format survivor benefit amounts
- **Requirement 5.6**: Show survivor scenarios
- **Requirement 9.1**: Export functionality

## Testing

See `__example__ProjectionTable.tsx` for example usage and manual testing scenarios.

## Future Enhancements

Potential improvements for future iterations:
- Pagination for very long projection lists
- Filtering by year range
- Toggle between nominal and inflation-adjusted values
- Print-friendly view
- Expandable rows for detailed breakdowns
