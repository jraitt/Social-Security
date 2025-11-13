# PresentValueDisplay Component

## Overview

The `PresentValueDisplay` component displays present value calculations and comparisons between claiming strategies. It includes an interactive discount rate control that allows users to adjust the rate and see how it affects the present value calculations in real-time.

## Features

### 1. Present Value Display
- Shows the present value of the selected strategy
- Shows the present value of the optimal strategy
- Displays dollar and percentage differences
- Visual indicators for optimal vs. sub-optimal strategies

### 2. Discount Rate Control
- Interactive slider (0-10% range, 0.1% increments)
- Current rate display
- Reset to default button (3.0%)
- Informative tooltip explaining discount rate concept
- Disabled state during recalculation

### 3. Real-time Recalculation
- Triggers recalculation when discount rate changes
- Shows loading indicator during recalculation
- Updates present values and optimal strategy identification

## Props

```typescript
interface PresentValueDisplayProps {
  selectedStrategyPV: number;        // Present value of selected strategy
  optimalStrategyPV: number;         // Present value of optimal strategy
  discountRate: number;              // Current discount rate (0-10)
  onDiscountRateChange: (rate: number) => void;  // Callback when rate changes
  isRecalculating?: boolean;         // Optional loading state
}
```

## Usage

```tsx
import PresentValueDisplay from './components/PresentValueDisplay';

function ResultsPage() {
  const [discountRate, setDiscountRate] = useState(3.0);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleDiscountRateChange = async (newRate: number) => {
    setDiscountRate(newRate);
    setIsRecalculating(true);
    
    // Trigger recalculation with new discount rate
    await recalculateWithNewRate(newRate);
    
    setIsRecalculating(false);
  };

  return (
    <PresentValueDisplay
      selectedStrategyPV={result.selectedStrategy.presentValue}
      optimalStrategyPV={result.optimalStrategy.presentValue}
      discountRate={discountRate}
      onDiscountRateChange={handleDiscountRateChange}
      isRecalculating={isRecalculating}
    />
  );
}
```

## Component Structure

```
PresentValueDisplay
├── Discount Rate Control Section
│   ├── Label with info tooltip
│   ├── Current rate display
│   ├── Reset button
│   ├── Range slider (0-10%)
│   └── Recalculating indicator
│
├── Present Value Comparison
│   ├── Selected Strategy PV Card
│   │   ├── Amount display
│   │   └── Optimal checkmark (if applicable)
│   │
│   ├── Optimal Strategy PV Card (if different)
│   │   ├── Amount display
│   │   └── Optimal checkmark
│   │
│   └── Difference Display (if not optimal)
│       ├── Dollar difference
│       └── Percentage difference
│
└── Explanation Note
```

## Styling

The component uses Tailwind CSS classes and follows the application's design system:

- **Primary Color**: Used for interactive elements (slider, info button)
- **Secondary Color**: Used for optimal strategy indicators (green)
- **Red Color**: Used for negative differences
- **Gray Scale**: Used for neutral elements and text

### Responsive Design

- Mobile-first approach
- Adjusts font sizes and spacing for different screen sizes
- Tooltip positioning optimized for mobile and desktop
- Touch-friendly controls on mobile devices

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators on interactive elements
- Descriptive aria-valuetext for slider
- Proper button roles and labels

## Discount Rate Tooltip

The tooltip provides educational content about discount rates:

- **What it is**: Explains the time value of money concept
- **How it works**: Describes the relationship between discount rate and claiming strategy
- **When to adjust**: Helps users understand when higher/lower rates make sense

The tooltip appears on:
- Mouse hover (desktop)
- Focus (keyboard navigation)
- Touch (mobile devices)

## State Management

The component is controlled - it receives the discount rate as a prop and calls `onDiscountRateChange` when the user adjusts the slider. The parent component is responsible for:

1. Storing the discount rate state
2. Triggering recalculation with the new rate
3. Updating the present value calculations
4. Re-identifying the optimal strategy if it changes

## Performance Considerations

- Debouncing slider changes is recommended in the parent component
- The component itself is lightweight and re-renders efficiently
- Tooltip state is local to avoid unnecessary parent re-renders

## Integration with Enhanced Calculation Service

This component is designed to work with the enhanced calculation results that include:

- `presentValue` field on each strategy evaluation
- `optimalPresentValue` in the result
- Support for recalculation with different discount rates

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **3.2**: Display present value of selected strategy
- **3.3**: Display present value of optimal strategy
- **3.4**: Calculate and display dollar difference
- **3.5**: Calculate and display percentage difference
- **8.1**: Provide discount rate control
- **8.2**: Accept rates between 0-10%
- **8.3**: Default to 3.0%
- **8.4**: Trigger recalculation on rate change
- **8.5**: Re-identify optimal strategy if changed
- **8.6**: Display current rate value
- **8.7**: Include tooltip explaining discount rate
- **8.8**: Provide reset to default button

## Testing

Key test scenarios:

1. **Display Tests**
   - Renders present values correctly
   - Shows difference when strategies differ
   - Shows optimal indicator when strategies match

2. **Interaction Tests**
   - Slider changes trigger callback
   - Reset button sets rate to 3.0%
   - Tooltip appears on hover/focus

3. **Edge Cases**
   - Zero discount rate
   - Maximum discount rate (10%)
   - Identical present values
   - Very large differences

4. **Accessibility Tests**
   - Keyboard navigation works
   - Screen reader announcements
   - Focus management

## Future Enhancements

Potential improvements for future iterations:

- Preset discount rate options (conservative, moderate, aggressive)
- Historical discount rate data/suggestions
- Comparison with inflation rate
- Multiple scenario comparison
- Export present value analysis
