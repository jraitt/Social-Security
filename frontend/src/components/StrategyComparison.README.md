# StrategyComparison Component

## Overview

The `StrategyComparison` component allows users to compare different Social Security claiming strategies side-by-side. It displays dollar and percentage differences between strategies, highlights which strategy provides better benefits, and supports both individual and couple modes with present value comparisons.

## Features

- **Strategy Selection Dropdown**: Users can select any strategy from all evaluated strategies (ages 62-70 for individuals, all combinations for couples)
- **Side-by-Side Comparison**: Displays selected strategy alongside optimal strategy for easy comparison
- **Dollar and Percentage Differences**: Shows both absolute and relative differences in lifetime benefits and present value
- **Visual Indicators**: Color-coded displays (green for better, red for worse) with icons to highlight which strategy is superior
- **Present Value Comparison**: Compares present values in addition to nominal lifetime benefits
- **Responsive Design**: Adapts to mobile, tablet, and desktop screen sizes
- **Strategy Switching**: Triggers updates to projection tables and other displays when a new strategy is selected

## Props

```typescript
interface StrategyComparisonProps {
  mode: 'individual' | 'couple';
  optimalStrategy: StrategyEvaluation | CoupleStrategyEvaluation;
  allStrategies: (StrategyEvaluation | CoupleStrategyEvaluation)[];
  selectedStrategy?: StrategyEvaluation | CoupleStrategyEvaluation;
  onStrategySelect: (strategy: StrategyEvaluation | CoupleStrategyEvaluation) => void;
}
```

### Prop Descriptions

- **mode**: Calculation mode - either 'individual' or 'couple'
- **optimalStrategy**: The optimal strategy identified by the calculation engine
- **allStrategies**: Array of all evaluated strategies (ages 62-70 for individual, all combinations for couple)
- **selectedStrategy**: Currently selected strategy for comparison (optional, defaults to optimal)
- **onStrategySelect**: Callback function triggered when user selects a different strategy

## Usage

### Individual Mode

```tsx
import StrategyComparison from './StrategyComparison';

<StrategyComparison
  mode="individual"
  optimalStrategy={individualResult.allStrategies.find(s => s.claimingAge === individualResult.optimalAge)}
  allStrategies={individualResult.allStrategies}
  selectedStrategy={selectedStrategy}
  onStrategySelect={handleStrategySelect}
/>
```

### Couple Mode

```tsx
import StrategyComparison from './StrategyComparison';

<StrategyComparison
  mode="couple"
  optimalStrategy={coupleResult.allStrategies.find(
    s => s.spouse1ClaimingAge === coupleResult.optimalStrategy.spouse1ClaimingAge &&
         s.spouse2ClaimingAge === coupleResult.optimalStrategy.spouse2ClaimingAge
  )}
  allStrategies={coupleResult.allStrategies}
  selectedStrategy={selectedStrategy}
  onStrategySelect={handleStrategySelect}
/>
```

## Integration with ResultsDisplay

The component is integrated into `ResultsDisplay` to enable strategy comparison and switching:

1. **State Management**: ResultsDisplay maintains `selectedStrategy` state
2. **Strategy Selection**: When user selects a strategy, `handleStrategySelect` updates the state
3. **Projection Updates**: ProjectionTable displays projections for the selected strategy
4. **Present Value Updates**: PresentValueDisplay shows present value for the selected strategy

```tsx
const [selectedStrategy, setSelectedStrategy] = useState<StrategyEvaluation | CoupleStrategyEvaluation | null>(null);

const handleStrategySelect = (strategy: StrategyEvaluation | CoupleStrategyEvaluation) => {
  setSelectedStrategy(strategy);
};

// Pass selected strategy to projection table
<ProjectionTable
  projections={
    selectedStrategy?.yearlyProjections || defaultProjections
  }
  mode={mode}
/>

// Pass selected strategy to present value display
<PresentValueDisplay
  selectedStrategyPV={
    selectedStrategy?.presentValue || optimalPresentValue
  }
  optimalStrategyPV={optimalPresentValue}
  discountRate={discountRate}
  onDiscountRateChange={onDiscountRateChange}
/>
```

## Display Sections

### 1. Strategy Selection Dropdown

- Lists all evaluated strategies with claiming ages and monthly benefits
- Individual: "Age 62 - $2,500/mo", "Age 63 - $2,680/mo", etc.
- Couple: "Ages 62/67 - $4,200/mo", "Ages 65/70 - $5,100/mo", etc.

### 2. Side-by-Side Comparison Cards

**Selected Strategy Card:**
- Displays claiming age(s)
- Monthly benefit amount
- Total lifetime benefits
- Present value
- Green border with checkmark if optimal

**Optimal Strategy Card (when different):**
- Same information as selected strategy
- Always has green border with checkmark
- Only shown when selected strategy is not optimal

### 3. Comparison Summary

**When selected strategy is NOT optimal:**
- Color-coded banner (green if better, red if worse)
- Icon indicating direction (up arrow for better, down arrow for worse)
- Two comparison metrics:
  - **Lifetime Benefit Difference**: Dollar amount and percentage
  - **Present Value Difference**: Dollar amount and percentage

**When optimal strategy is selected:**
- Informational banner with checkmark
- Message confirming user is viewing optimal strategy
- Prompt to select different strategy for comparison

## Comparison Metrics

### Lifetime Benefit Difference

```
Difference = Selected Strategy Lifetime Benefit - Optimal Strategy Lifetime Benefit
Percentage = (Difference / Optimal Strategy Lifetime Benefit) × 100
```

### Present Value Difference

```
Difference = Selected Strategy Present Value - Optimal Strategy Present Value
Percentage = (Difference / Optimal Strategy Present Value) × 100
```

### Better/Worse Determination

A strategy is considered "better" if its lifetime benefit is greater than or equal to the optimal strategy's lifetime benefit. This can occur when:
- User manually selects a strategy that happens to be optimal
- Multiple strategies have identical or very similar lifetime benefits
- Rounding differences result in slight variations

## Responsive Design

### Mobile (< 768px)
- Single column layout for comparison cards
- Stacked comparison metrics
- Full-width dropdown
- Compact spacing

### Tablet (768px - 1023px)
- Two-column grid for comparison cards
- Side-by-side comparison metrics
- Optimized spacing

### Desktop (≥ 1024px)
- Two-column grid for comparison cards
- Side-by-side comparison metrics
- Maximum width constraints for readability

## Styling

The component uses Tailwind CSS classes with the following color scheme:

- **Optimal/Better**: Green (`bg-green-50`, `border-green-200`, `text-green-600`)
- **Worse**: Red (`bg-red-50`, `border-red-200`, `text-red-600`)
- **Optimal Strategy**: Secondary color (`bg-secondary-50`, `border-secondary-500`)
- **Neutral**: Gray (`bg-gray-50`, `border-gray-200`)

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **6.2**: Allow users to select alternative strategies to compare
- **6.3**: Display dollar difference in total benefits when comparing strategies
- **6.4**: Display percentage difference in total benefits when comparing strategies
- **6.5**: Display present value comparisons between strategies
- **6.6**: Highlight which strategy provides higher total benefits
- **6.7**: Show year-by-year projections for the selected strategy
- **6.8**: Allow users to switch between different strategies to view their projections

## Accessibility

- Semantic HTML structure with proper heading hierarchy
- Color is not the only indicator (icons and text labels provided)
- Keyboard navigable dropdown
- Screen reader friendly labels
- Sufficient color contrast ratios

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support
- Tailwind CSS v3.x

## Future Enhancements

Potential improvements for future versions:

1. **Export Comparison**: Allow users to export comparison data to CSV
2. **Multiple Comparisons**: Compare more than two strategies simultaneously
3. **Breakeven Analysis**: Show breakeven age between selected and optimal strategies
4. **Chart Visualization**: Add visual chart comparing benefit streams over time
5. **Sensitivity Analysis**: Show how comparison changes with different assumptions
