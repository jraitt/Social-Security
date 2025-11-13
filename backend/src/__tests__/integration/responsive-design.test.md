# Responsive Design Test Plan

## Requirements
- 2.6: Display projections in responsive format
- 7.3: Responsive results display

## Test Scenarios

### Mobile Devices (320px-767px)

#### Test 1: Projection Table Mobile Layout
- **Action**: View projection table on 320px width device
- **Expected**: Table should scroll horizontally OR collapse to card view
- **Verify**: All columns are accessible without breaking layout

#### Test 2: Strategy Comparison Mobile
- **Action**: View strategy comparison on mobile
- **Expected**: Dropdown and comparison display stack vertically
- **Verify**: Text is readable, buttons are tappable (min 44px)

#### Test 3: Present Value Display Mobile
- **Action**: View discount rate slider on mobile
- **Expected**: Slider is full width, values display clearly
- **Verify**: Slider is usable with touch input

#### Test 4: Export Button Mobile
- **Action**: Tap export button on mobile
- **Expected**: Button is accessible and triggers download
- **Verify**: Success message displays properly

### Tablet Devices (768px-1023px)

#### Test 5: Projection Table Tablet Layout
- **Action**: View projection table on 768px width device
- **Expected**: Table displays with readable columns
- **Verify**: No horizontal scroll needed for main columns

#### Test 6: Results Display Tablet
- **Action**: View complete results on tablet
- **Expected**: Components arrange in 2-column layout where appropriate
- **Verify**: All content is readable without zooming

#### Test 7: Strategy Cards Tablet
- **Action**: View alternative strategies on tablet
- **Expected**: Cards display in grid (2 columns)
- **Verify**: Cards are evenly spaced and readable

### Desktop (1024px+)

#### Test 8: Full Layout Desktop
- **Action**: View all components on desktop
- **Expected**: Optimal use of screen space
- **Verify**: No unnecessary scrolling, proper spacing

#### Test 9: Projection Table Desktop
- **Action**: View projection table on desktop
- **Expected**: All columns visible without scroll
- **Verify**: Table is easy to read and scan

#### Test 10: Side-by-Side Comparisons
- **Action**: View strategy comparison on desktop
- **Expected**: Comparison displays side-by-side
- **Verify**: Easy to compare values across strategies

## Manual Testing Checklist

### Browser DevTools Testing
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test each viewport size:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1920px)

### Component-Specific Tests

#### ProjectionTable Component
- [ ] Mobile: Horizontal scroll works smoothly
- [ ] Mobile: All columns accessible
- [ ] Tablet: Table fits without scroll
- [ ] Desktop: Full table visible
- [ ] All: Export button accessible

#### PresentValueDisplay Component
- [ ] Mobile: Slider full width
- [ ] Mobile: Values display clearly
- [ ] Tablet: Proper spacing
- [ ] Desktop: Optimal layout
- [ ] All: Tooltip readable

#### StrategyComparison Component
- [ ] Mobile: Dropdown full width
- [ ] Mobile: Comparison stacks vertically
- [ ] Tablet: Adequate spacing
- [ ] Desktop: Side-by-side layout
- [ ] All: Values clearly visible

#### ResultsDisplay Component
- [ ] Mobile: Sections stack vertically
- [ ] Mobile: Collapsible sections work
- [ ] Tablet: 2-column layout where appropriate
- [ ] Desktop: Optimal use of space
- [ ] All: Scrolling smooth

## Automated Testing Notes

Since the frontend uses Vite/React without a test framework configured,
responsive testing should be done manually using browser DevTools.

For future automation, consider:
- Playwright for E2E responsive testing
- Storybook for component visual testing
- Percy or Chromatic for visual regression testing

## Test Results Documentation

Record results in format:
- Test ID
- Viewport Size
- Pass/Fail
- Issues Found
- Screenshots (if applicable)
