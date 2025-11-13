# Implementation Plan

- [x] 1. Create enhanced data models and types





  - Create TypeScript interfaces for enhanced calculation results
  - Add YearlyProjection and CoupleYearlyProjection types
  - Add SurvivorProjection and StrategyEvaluation types
  - Add PresentValue calculation types
  - Update existing types to support backward compatibility
  - _Requirements: 1.1, 2.1, 3.1, 10.3_

- [x] 2. Implement Present Value Service


- [x] 2.1 Create PresentValueService class with core methods







  - Implement calculatePresentValue() method with discount rate formula
  - Implement calculateNPV() for strategy evaluation
  - Implement comparePresentValues() for strategy comparison
  - Add discount rate validation (0-10%)
  - _Requirements: 3.1, 3.2, 3.6, 8.2_

- [x] 2.2 Write unit tests for Present Value Service







  - Test PV calculation with various discount rates
  - Test NPV comparison logic
  - Test edge cases (0%, 10% discount rates)
  - _Requirements: 3.1, 3.6_

- [x] 3. Enhance SSA Rules Engine






- [x] 3.1 Add spousal benefit calculation methods

  - Implement calculateSpousalBenefit() with 50% PIA rule
  - Apply age-based reductions for early claiming
  - Implement spousal benefit eligibility checks
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 3.2 Add survivor benefit calculation methods


  - Implement calculateSurvivorBenefit() with 100% benefit rule
  - Handle survivor benefit age adjustments
  - Implement benefit coordination (own vs survivor)
  - _Requirements: 5.2, 5.8_

- [x] 3.3 Add benefit coordination logic


  - Implement determineBenefitToPay() method
  - Handle retirement vs spousal benefit selection
  - Handle retirement vs survivor benefit selection
  - _Requirements: 4.6, 5.8_

- [x] 3.4 Write unit tests for enhanced SSA Rules Engine






  - Test spousal benefit calculations
  - Test survivor benefit calculations
  - Test benefit coordination rules
  - _Requirements: 4.1, 5.1_

- [x] 4. Enhance Projection Service





- [x] 4.1 Implement year-by-year projection generation for individuals


  - Create projectIndividualBenefits() method
  - Generate projections from claiming age to life expectancy
  - Apply COLA adjustments year-over-year
  - Apply inflation adjustments if enabled
  - Calculate cumulative benefits
  - _Requirements: 2.1, 2.2, 2.6_


- [x] 4.2 Implement year-by-year projection generation for couples





  - Create projectCoupleBenefits() method
  - Calculate retirement benefits for both spouses
  - Calculate spousal benefits when applicable
  - Coordinate benefit timing between spouses
  - _Requirements: 2.3, 2.4, 2.5, 4.7_


- [x] 4.3 Implement survivor scenario modeling





  - Create projectSurvivorScenario() method
  - Model "if you outlive spouse" scenario
  - Model "if spouse outlives you" scenario
  - Calculate survivor benefits from year of death
  - Project through surviving spouse's life expectancy
  - _Requirements: 2.8, 2.9, 5.3, 5.4, 5.6_


- [x] 4.4 Add projection summary methods





  - Implement sumTotalBenefits() to aggregate projections
  - Calculate total lifetime benefits
  - Calculate present value of benefit stream
  - _Requirements: 1.2, 3.1_

- [x] 4.5 Write unit tests for Projection Service






  - Test individual projection generation
  - Test couple projection generation
  - Test survivor scenario modeling
  - _Requirements: 2.1, 5.1_

- [x] 5. Implement Enhanced Calculation Service





- [x] 5.1 Create strategy evaluation logic


  - Implement evaluateStrategy() method
  - Generate year-by-year projections for strategy
  - Calculate total lifetime benefits
  - Calculate present value
  - Generate strategy description
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 5.2 Implement individual optimization algorithm

  - Create calculateIndividualOptimal() method
  - Evaluate all claiming ages (62-70)
  - Calculate total benefits for each age
  - Identify strategy with highest total benefits
  - Generate alternative strategies within 2%
  - _Requirements: 1.1, 1.3, 1.4_


- [x] 5.3 Implement couple optimization algorithm


  - Create calculateCoupleOptimal() method
  - Generate all claiming age combinations (62-70 for each)
  - Evaluate each combination with spousal and survivor benefits
  - Identify strategy with highest combined benefits
  - Generate alternative strategies within 2%
  - _Requirements: 1.1, 1.2, 4.1, 5.1_




- [x] 5.4 Implement strategy comparison logic


  - Create compareStrategies() method
  - Calculate dollar difference between strategies
  - Calculate percentage difference
  - Compare present values
  - _Requirements: 3.3, 3.4, 6.3, 6.4_

- [x] 5.5 Write unit tests for Enhanced Calculation Service



  - Test strategy evaluation
  - Test optimal strategy identification
  - Test alternative strategy generation
  - _Requirements: 1.1, 1.3_

- [x] 6. Create new API endpoints




- [x] 6.1 Add enhanced individual calculation endpoint


  - Create POST /api/calculate/enhanced/individual
  - Accept discount rate parameter
  - Return enhanced result with projections
  - Maintain backward compatibility
  - _Requirements: 10.2, 10.3_

- [x] 6.2 Add enhanced couple calculation endpoint


  - Create POST /api/calculate/enhanced/couple
  - Accept discount rate parameter
  - Return enhanced result with projections and survivor scenarios
  - Maintain backward compatibility
  - _Requirements: 10.2, 10.3_

- [x] 6.3 Update validation middleware


  - Add discount rate validation
  - Validate new optional parameters
  - Maintain existing validation rules
  - _Requirements: 8.2, 10.6_

- [x] 6.4 Write integration tests for new endpoints



  - Test individual calculation flow
  - Test couple calculation flow
  - Test error handling
  - _Requirements: 10.1, 10.2_

- [x] 7. Create Projection Table component





- [x] 7.1 Build projection table UI structure


  - Create ProjectionTable component
  - Add table headers for all benefit types
  - Implement responsive table layout
  - Add mobile-friendly scrolling/collapsing
  - _Requirements: 2.6, 2.7_

- [x] 7.2 Implement projection data rendering


  - Render year-by-year benefit rows
  - Format currency values
  - Display retirement, spousal, survivor benefits
  - Show annual totals
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 7.3 Add survivor scenario rows


  - Display "if you outlive spouse" row
  - Display "if spouse outlives you" row
  - Format survivor benefit amounts
  - _Requirements: 2.8, 2.9, 5.5, 5.6_

- [x] 7.4 Add table features


  - Implement column sorting
  - Add export to CSV button
  - Highlight total row
  - Add responsive design for mobile
  - _Requirements: 2.6, 9.1_

- [x] 8. Create Present Value Display component






- [x] 8.1 Build present value UI

  - Create PresentValueDisplay component
  - Display selected strategy PV
  - Display optimal strategy PV
  - Show dollar and percentage difference
  - _Requirements: 3.2, 3.3, 3.4, 3.5_


- [x] 8.2 Add discount rate control





  - Create discount rate slider (0-10%)
  - Display current discount rate value
  - Add tooltip explaining discount rate
  - Add "Reset to Default" button
  - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7, 8.8_


- [x] 8.3 Implement recalculation on discount rate change





  - Trigger recalculation when rate changes
  - Update present values
  - Re-identify optimal strategy if changed
  - _Requirements: 8.4, 8.5_

- [x] 9. Enhance Results Display component





- [x] 9.1 Update optimal strategy card


  - Display total lifetime benefits prominently
  - Add present value display
  - Show claiming ages for couple mode
  - Update explanation text
  - _Requirements: 7.1, 7.2, 7.6_


- [x] 9.2 Integrate projection table

  - Add ProjectionTable component to results
  - Pass projection data from calculation results
  - Handle both individual and couple modes
  - _Requirements: 7.3, 2.6_

- [x] 9.3 Integrate present value display


  - Add PresentValueDisplay component
  - Pass PV data from calculation results
  - Wire up discount rate change handler
  - _Requirements: 7.2, 3.2_


- [x] 9.4 Add survivor benefit display for couples


  - Display survivor scenarios prominently
  - Show projected survivor benefits
  - Format survivor benefit amounts
  - _Requirements: 7.4, 7.5, 5.5_


- [x] 9.5 Update alternative strategies section

  - Show total benefits for each alternative
  - Display present value for alternatives
  - Add comparison with optimal
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 10. Create Strategy Comparison component





- [x] 10.1 Build strategy comparison UI


  - Create StrategyComparison component
  - Add dropdown to select strategy
  - Display side-by-side comparison
  - _Requirements: 6.2, 6.3_


- [x] 10.2 Implement comparison display

  - Show dollar difference between strategies
  - Show percentage difference
  - Highlight which strategy is better
  - Display present value comparison
  - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 10.3 Add strategy switching


  - Allow users to select different strategies
  - Update projection table when strategy changes
  - Update all displays with new strategy data
  - _Requirements: 6.7, 6.8_

- [x] 11. Implement Export functionality



- [x] 11.1 Create Export component


  - Add export button to results display
  - Create CSV generation logic
  - Format data for export
  - _Requirements: 9.1, 9.2_


- [x] 11.2 Implement CSV export
  - Include summary information in export
  - Include all input parameters
  - Include year-by-year projections
  - Include survivor scenarios for couples
  - Generate timestamped filename
  - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_


- [x] 11.3 Add download functionality

  - Trigger browser download
  - Handle export errors gracefully
  - Show success/error messages
  - _Requirements: 9.1_

- [x] 12. Update frontend API service





- [x] 12.1 Add enhanced calculation API calls


  - Create calculateIndividualEnhanced() method
  - Create calculateCoupleEnhanced() method
  - Pass discount rate parameter
  - Handle enhanced result types
  - _Requirements: 10.1, 10.2_

- [x] 12.2 Update type definitions


  - Import enhanced result types
  - Update API response types
  - Maintain backward compatibility
  - _Requirements: 10.3, 10.4_

- [x] 13. Add feature flags and configuration





- [x] 13.1 Implement feature flags


  - Add ENABLE_ENHANCED_OPTIMIZATION flag
  - Add ENABLE_PRESENT_VALUE flag
  - Add ENABLE_PROJECTIONS flag
  - Configure flag defaults
  - _Requirements: 10.1_

- [x] 13.2 Add configuration for defaults


  - Set default discount rate (3.0%)
  - Configure PV calculation precision
  - Set alternative strategy threshold (2%)
  - _Requirements: 3.7, 8.3_

- [x] 14. Update documentation






- [x] 14.1 Update API documentation

  - Document new endpoints
  - Document enhanced request/response formats
  - Add examples for enhanced calculations
  - _Requirements: 10.2_


- [x] 14.2 Update user documentation

  - Explain present value concept
  - Explain discount rate
  - Document survivor scenarios
  - Add FAQ for new features
  - _Requirements: 8.7_


- [x] 14.3 Create migration guide


  - Document API changes
  - Provide migration examples
  - Document backward compatibility
  - _Requirements: 10.1, 10.2_

- [x] 15. Performance optimization





- [x] 15.1 Implement caching


  - Cache FRA calculations
  - Cache benefit adjustment factors
  - Cache COLA calculations
  - _Requirements: 1.1_


- [x] 15.2 Optimize couple calculations

  - Implement parallel strategy evaluation
  - Use memoization for repeated calculations
  - Optimize projection generation
  - _Requirements: 1.1_


- [x] 15.3 Add lazy loading

  - Lazy load projection table data
  - Lazy load alternative strategies
  - Optimize initial render time
  - _Requirements: 7.3_

- [x] 16. Integration and end-to-end testing






- [x] 16.1 Test complete individual flow





  - Submit individual calculation
  - Verify projections displayed
  - Verify present value calculated
  - Test discount rate adjustment
  - Test export functionality
  - _Requirements: 1.1, 2.1, 3.1, 8.1, 9.1_

- [x] 16.2 Test complete couple flow


  - Submit couple calculation
  - Verify spousal benefits calculated
  - Verify survivor scenarios displayed
  - Test strategy comparison
  - Test export functionality
  - _Requirements: 4.1, 5.1, 6.1, 9.1_


- [x] 16.3 Test backward compatibility

  - Test old API endpoints still work
  - Test old result format still supported
  - Verify no breaking changes
  - _Requirements: 10.1, 10.2, 10.3_


- [x] 16.4 Test responsive design

  - Test on mobile devices (320px-767px)
  - Test on tablets (768px-1023px)
  - Test on desktop (1024px+)
  - Verify projection table responsive
  - _Requirements: 2.6, 7.3_

- [ ] 17. Deployment preparation
- [ ] 17.1 Create deployment scripts
  - Backend deployment script
  - Frontend deployment script
  - Database migration script (if needed)
  - _Requirements: 10.1_

- [ ] 17.2 Configure feature flags for rollout
  - Set flags for staging environment
  - Plan gradual rollout strategy
  - Prepare rollback plan
  - _Requirements: 10.1_

- [ ] 17.3 Set up monitoring
  - Add performance monitoring
  - Add error tracking
  - Set up alerts for issues
  - _Requirements: 1.1_
