# Requirements Document

## Introduction

This specification defines the enhancement of the Social Security Calculator's optimization strategy from a simple life expectancy/breakeven approach to a comprehensive total dollar benefit maximization approach. The enhanced system will provide year-by-year benefit projections, present value calculations, and detailed survivor benefit scenarios for married couples.

## Glossary

- **System**: The Social Security Calculator application
- **PIA**: Primary Insurance Amount - the monthly benefit amount at Full Retirement Age
- **FRA**: Full Retirement Age - the age at which unreduced benefits are available
- **Spousal Benefit**: A benefit paid to a spouse based on their partner's earnings record
- **Survivor Benefit**: A benefit paid to a surviving spouse after their partner's death
- **Present Value**: The current value of future benefit payments, adjusted for time value of money
- **Discount Rate**: The rate used to calculate present value of future benefits
- **Benefit Stream**: The sequence of annual benefit payments over time
- **Optimization Strategy**: A specific combination of claiming ages that maximizes total benefits
- **User**: An individual using the calculator to determine optimal claiming strategy
- **Couple**: Two married individuals planning their Social Security claiming strategy together

## Requirements

### Requirement 1: Enhanced Calculation Engine

**User Story:** As a user, I want the calculator to optimize for maximum total dollar benefits rather than just breakeven age, so that I can maximize my lifetime Social Security income.

#### Acceptance Criteria

1. WHEN the User submits calculation inputs, THE System SHALL calculate total lifetime benefits in actual dollars for each possible claiming age combination
2. WHEN evaluating strategies, THE System SHALL sum all benefit types (retirement, spousal, survivor) over the projected lifetime
3. WHEN comparing strategies, THE System SHALL identify the strategy with the highest total dollar amount as optimal
4. THE System SHALL calculate benefits for all valid claiming ages from 62 to 70 for each individual
5. WHEN inflation adjustment is enabled, THE System SHALL apply the inflation rate to future benefit amounts before summing

### Requirement 2: Year-by-Year Benefit Projections

**User Story:** As a user, I want to see a detailed year-by-year breakdown of my expected benefits, so that I can understand how my benefit stream will change over time.

#### Acceptance Criteria

1. THE System SHALL generate annual benefit projections from the claiming year through the life expectancy year
2. FOR each year, THE System SHALL calculate and display the retirement benefit amount
3. FOR each year in couple mode, THE System SHALL calculate and display the spousal benefit amount
4. FOR each year in couple mode, THE System SHALL calculate and display the survivor benefit amount if applicable
5. FOR each year, THE System SHALL calculate and display the total annual benefit (sum of all benefit types)
6. THE System SHALL display projections in a tabular format with columns for each benefit type
7. WHEN inflation adjustment is enabled, THE System SHALL show inflation-adjusted amounts for each year
8. THE System SHALL include a row showing benefits "if you outlive your spouse" in couple mode
9. THE System SHALL include a row showing benefits "if your spouse outlives you" in couple mode

### Requirement 3: Present Value Calculations

**User Story:** As a user, I want to see present value calculations for different strategies, so that I can compare the time value of money across different claiming approaches.

#### Acceptance Criteria

1. THE System SHALL calculate the present value of each claiming strategy using a configurable discount rate
2. THE System SHALL display the present value of the selected strategy
3. THE System SHALL display the present value of the optimal strategy
4. THE System SHALL calculate and display the dollar difference between strategies
5. THE System SHALL calculate and display the percentage difference between strategies
6. WHEN comparing strategies, THE System SHALL use consistent discount rates across all calculations
7. THE System SHALL allow users to adjust the discount rate assumption
8. THE System SHALL default the discount rate to 3.0% annually

### Requirement 4: Spousal Benefit Coordination

**User Story:** As a married user, I want the calculator to properly coordinate spousal benefits with my own retirement benefits, so that I receive the maximum combined household benefit.

#### Acceptance Criteria

1. WHEN calculating couple benefits, THE System SHALL determine spousal benefit eligibility based on both spouses' PIAs
2. THE System SHALL calculate spousal benefits as 50% of the higher earner's PIA at their FRA
3. THE System SHALL apply age-based reductions to spousal benefits claimed before FRA
4. THE System SHALL ensure spousal benefits do not exceed the maximum allowed amount
5. THE System SHALL coordinate timing of spousal benefit claims with retirement benefit claims
6. WHEN a spouse is eligible for both retirement and spousal benefits, THE System SHALL pay the higher of the two amounts
7. THE System SHALL include spousal benefits in the year-by-year projections
8. THE System SHALL include spousal benefits in total lifetime benefit calculations

### Requirement 5: Survivor Benefit Scenarios

**User Story:** As a married user, I want to see how survivor benefits would work if one spouse passes away, so that I can plan for financial security in all scenarios.

#### Acceptance Criteria

1. WHEN calculating couple benefits, THE System SHALL generate survivor benefit scenarios for both spouses
2. THE System SHALL calculate survivor benefits based on the deceased spouse's benefit amount at time of death
3. THE System SHALL project survivor benefits from the year of death through the surviving spouse's life expectancy
4. THE System SHALL calculate total survivor benefits received over the survivor's remaining lifetime
5. THE System SHALL display survivor benefit amounts in the year-by-year projection table
6. THE System SHALL show separate scenarios for "if you outlive your spouse" and "if your spouse outlives you"
7. THE System SHALL include survivor benefits in the total lifetime benefit calculation
8. WHEN a surviving spouse is eligible for both their own benefit and survivor benefit, THE System SHALL pay the higher amount

### Requirement 6: Strategy Comparison Interface

**User Story:** As a user, I want to easily compare different claiming strategies side-by-side, so that I can understand the trade-offs between different approaches.

#### Acceptance Criteria

1. THE System SHALL display the optimal strategy prominently with its total benefit amount
2. THE System SHALL allow users to select alternative strategies to compare
3. WHEN comparing strategies, THE System SHALL display the dollar difference in total benefits
4. WHEN comparing strategies, THE System SHALL display the percentage difference in total benefits
5. THE System SHALL display present value comparisons between strategies
6. THE System SHALL highlight which strategy provides higher total benefits
7. THE System SHALL show year-by-year projections for the selected strategy
8. THE System SHALL allow users to switch between different strategies to view their projections

### Requirement 7: Enhanced Results Display

**User Story:** As a user, I want to see comprehensive results that include all benefit types and scenarios, so that I have complete information to make my claiming decision.

#### Acceptance Criteria

1. THE System SHALL display total lifetime benefits for the optimal strategy
2. THE System SHALL display present value of the optimal strategy
3. THE System SHALL display a year-by-year benefit projection table
4. THE System SHALL display spousal benefit amounts separately from retirement benefits
5. THE System SHALL display survivor benefit scenarios with projected amounts
6. THE System SHALL display the claiming ages for each spouse in couple mode
7. THE System SHALL provide explanatory text describing why the strategy is optimal
8. THE System SHALL display all monetary amounts in US dollar format with appropriate precision

### Requirement 8: Discount Rate Configuration

**User Story:** As a user, I want to adjust the discount rate used for present value calculations, so that I can see how different assumptions affect the optimal strategy.

#### Acceptance Criteria

1. THE System SHALL provide a user interface control for adjusting the discount rate
2. THE System SHALL accept discount rates between 0% and 10% in 0.1% increments
3. THE System SHALL default the discount rate to 3.0%
4. WHEN the discount rate changes, THE System SHALL recalculate present values for all strategies
5. WHEN the discount rate changes, THE System SHALL re-identify the optimal strategy if it changes
6. THE System SHALL display the current discount rate value to the user
7. THE System SHALL include a tooltip explaining what discount rate means
8. THE System SHALL provide a "Reset to Default" option for the discount rate

### Requirement 9: Data Export Capability

**User Story:** As a user, I want to export my benefit projections and calculations, so that I can review them offline or share them with a financial advisor.

#### Acceptance Criteria

1. THE System SHALL provide an export button for downloading results
2. THE System SHALL export data in CSV format
3. THE System SHALL include all year-by-year projections in the export
4. THE System SHALL include summary information (optimal age, total benefits, present value) in the export
5. THE System SHALL include all input parameters in the export
6. THE System SHALL name the export file with a timestamp for easy identification
7. WHEN exporting couple results, THE System SHALL include both spouses' information
8. THE System SHALL include survivor benefit scenarios in the export

### Requirement 10: Backward Compatibility

**User Story:** As an existing user, I want the enhanced calculator to work with my previous inputs, so that I don't have to re-enter all my information.

#### Acceptance Criteria

1. THE System SHALL accept all input parameters from the previous calculator version
2. THE System SHALL maintain the same API endpoints for calculations
3. THE System SHALL return results in a format compatible with existing frontend components
4. WHEN new fields are added, THE System SHALL provide sensible defaults for backward compatibility
5. THE System SHALL continue to support both individual and couple calculation modes
6. THE System SHALL maintain existing validation rules for input parameters
7. THE System SHALL preserve existing error handling behavior
8. THE System SHALL maintain the same authentication and authorization requirements (if any)
