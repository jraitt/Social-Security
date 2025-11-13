# Implementation Plan

- [x] 1. Set up project structure and Docker configuration





  - Create root directory structure with frontend and backend folders
  - Create Dockerfile for backend with multi-stage build (development and production stages)
  - Create Dockerfile for frontend with multi-stage build (build stage and Nginx serve stage)
  - Create docker-compose.yml for development environment with volume mounts and port mappings
  - Create docker-compose.prod.yml for production environment with optimized settings
  - Create .env.example, .env.development.example, and .env.production.example files
  - Create .dockerignore files for both frontend and backend
  - Create root package.json with scripts for Docker commands
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.5_

- [x] 2. Initialize backend application structure







  - Create backend package.json with TypeScript, Express, and necessary dependencies
  - Create tsconfig.json for backend with appropriate compiler options
  - Create src directory structure (routes, services, models, middleware, utils)
  - Create main server.ts file with Express app initialization
  - Implement environment variable validation on startup
  - Create health check endpoint at /api/health
  - Add CORS middleware with environment-based configuration
  - Add Helmet.js for security headers
  - Add rate limiting middleware
  - _Requirements: 7.3, 7.4_
-

- [x] 3. Implement SSA Rules Engine




  - Create SSARulesEngine class in backend/src/services/SSARulesEngine.ts
  - Implement calculateFRA method based on birth year (1943-1960+ rules)
  - Implement calculateEarlyReductionPercentage method (5/9 of 1% for first 36 months, 5/12 thereafter)
  - Implement calculateDelayedCredits method (2/3 of 1% per month after FRA)
  - Implement calculateSpousalBenefit method (50% of higher PIA with reductions)
  - Implement calculateSurvivorBenefit method (100% of deceased benefit)
  - Implement getMonthlyBenefit method combining all adjustment factors
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 4. Implement Projection Service




  - Create ProjectionService class in backend/src/services/ProjectionService.ts
  - Implement projectLifetimeBenefits method calculating total benefits from claiming age to life expectancy
  - Implement projectCumulativeBenefits method generating year-by-year cumulative totals
  - Implement applyInflation private method for inflation-adjusted calculations
  - Create methods to generate chart data points for all claiming ages (62-70)
  - _Requirements: 10.3, 10.5_


- [x] 5. Implement Calculation Service for individuals




  - Create CalculationService class in backend/src/services/CalculationService.ts
  - Implement validateInput method for input validation
  - Implement calculateIndividual method orchestrating individual calculations
  - Calculate benefits for each claiming age from 62 to 70
  - Determine optimal claiming age based on maximum lifetime benefits
  - Generate strategy comparison data for all claiming ages
  - Format response with optimal strategy, alternatives, and chart data
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4_
-

- [x] 6. Implement Calculation Service for married couples





  - Implement calculateCouple method in CalculationService
  - Calculate individual benefits for both spouses across all claiming age combinations
  - Calculate spousal benefits based on higher earner's PIA
  - Calculate survivor benefit scenarios for both spouse death scenarios
  - Evaluate coordinated claiming strategies (e.g., one claims early, one delays)
  - Determine optimal combined strategy maximizing total household lifetime benefits
  - Generate comparison data for alternative strategies within 2% of optimal
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.5_

- [x] 7. Create API routes and request validation




  - Create routes/calculation.routes.ts with Express router
  - Implement POST /api/calculate/individual endpoint with request validation middleware
  - Implement POST /api/calculate/couple endpoint with request validation middleware
  - Create validation middleware using express-validator for input sanitization
  - Implement error handling middleware for consistent error responses
  - Add request logging middleware
  - Wire routes into main Express app
  - _Requirements: 1.2, 2.1_

- [x] 8. Initialize frontend application structure



  - Create frontend package.json with React, TypeScript, Vite, Tailwind CSS, and Recharts
  - Create tsconfig.json for frontend
  - Create vite.config.ts with development server configuration (port 5174)
  - Initialize Tailwind CSS with tailwind.config.js and postcss.config.js
  - Create src directory structure (components, services, types, utils, styles)
  - Create main.tsx and App.tsx root components
  - Create index.html with responsive meta tags
  - Set up global styles with Tailwind directives
  - _Requirements: 5.1, 8.1, 8.2_


- [x] 9. Create TypeScript type definitions for frontend


  - Create types/calculator.types.ts with all interfaces
  - Define CalculationInput, PersonData, AssumptionData interfaces
  - Define CalculationResult, Strategy, ChartDataPoint interfaces
  - Define CoupleStrategy, SurvivorScenario interfaces
  - Define AppState interface for application state management
  - Export all types for use across components
  - _Requirements: 1.1, 2.2_

- [x] 10. Implement API service layer in frontend




  - Create services/api.ts with axios or fetch wrapper
  - Implement calculateIndividual function calling POST /api/calculate/individual
  - Implement calculateCouple function calling POST /api/calculate/couple
  - Implement error handling and response parsing
  - Add request timeout configuration
  - Add retry logic for failed requests
  - _Requirements: 1.2, 2.1_

- [x] 11. Build CalculatorForm component




  - Create components/CalculatorForm.tsx with TypeScript
  - Implement mode toggle (individual vs. married couple) with state management
  - Create input fields for birth date with date picker
  - Create input field for PIA with validation ($1-$5,000 range)
  - Create input field for life expectancy with validation (70-100 years)
  - Implement conditional rendering for spouse 2 inputs in couple mode
  - Add real-time validation with error messages
  - Style with Tailwind CSS for responsive layout
  - Implement touch-friendly inputs with minimum 44px tap targets
  - Add loading state during calculation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 5.4_

- [x] 12. Build AssumptionsPanel component





  - Create components/AssumptionsPanel.tsx
  - Implement slider for life expectancy adjustment (70-100 years)
  - Implement slider for inflation rate (0-10%)
  - Display default values from SSA actuarial tables
  - Add tooltips explaining each assumption
  - Implement onChange handlers to trigger recalculation
  - Style with Tailwind CSS for responsive layout
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 13. Build ResultsDisplay component




  - Create components/ResultsDisplay.tsx
  - Display optimal claiming age prominently with large, clear typography
  - Display monthly benefit amount for optimal strategy
  - Display total lifetime benefit projection
  - Show comparison with age 62 claiming strategy
  - Display explanatory text describing why strategy is optimal
  - Show alternative strategies if within 2% of optimal
  - Implement responsive card-based layout
  - Style with color-coded indicators (green for optimal)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 14. Build BenefitsChart component with Recharts



  - Create components/BenefitsChart.tsx using Recharts library
  - Implement line chart showing lifetime benefits by claiming age (62-70)
  - Add visual highlight for optimal claiming age (different color/marker)
  - Implement interactive tooltips showing monthly and lifetime benefits on hover
  - Create responsive chart that adapts to container width
  - Implement mobile-optimized version with simplified display
  - Add chart legend and axis labels
  - Style with consistent color scheme from design system
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.3_
-

- [x] 15. Implement App component with state management




  - Update App.tsx to manage application state (mode, inputs, results, loading, errors)
  - Implement mode switching handler (individual/couple)
  - Implement calculation submission handler calling API service
  - Implement error handling and display
  - Coordinate data flow between CalculatorForm, AssumptionsPanel, ResultsDisplay, and BenefitsChart
  - Add conditional rendering based on calculation state
  - Implement loading indicators during API calls
  - _Requirements: 1.1, 2.1, 3.5_

- [x] 16. Implement responsive layout and mobile optimizations




  - Create responsive grid layout using Tailwind CSS breakpoints
  - Implement single-column layout for mobile (320px-767px)
  - Implement two-column layout for tablet (768px-1023px)
  - Implement multi-column layout for desktop (1024px+)
  - Add collapsible sections for mobile to reduce scrolling
  - Optimize chart rendering for small screens
  - Test touch interactions on all interactive elements
  - Verify minimum tap target sizes (44x44px)
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 17. Implement accessibility features
  - Add semantic HTML elements (header, main, section, article)
  - Add ARIA labels to all interactive elements
  - Implement keyboard navigation support (tab order, enter/space activation)
  - Add visible focus indicators to all focusable elements
  - Verify color contrast ratios meet WCAG 2.1 AA standards
  - Add alt text for any icons or images
  - Test with screen reader (NVDA or JAWS)
  - _Requirements: 8.4_

- [ ] 18. Create production Nginx configuration
  - Create frontend/nginx.conf for production deployment
  - Configure Nginx to serve static files from /usr/share/nginx/html
  - Set up reverse proxy for /api requests to backend container
  - Add gzip compression for static assets
  - Configure caching headers for static assets
  - Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)
  - Configure error pages
  - _Requirements: 6.1, 6.5_

- [ ] 19. Implement error boundaries and error handling UI
  - Create ErrorBoundary component wrapping App
  - Implement fallback UI for caught errors
  - Create ErrorMessage component for API errors
  - Add user-friendly error messages for common scenarios
  - Implement retry mechanism for failed API calls
  - Add console logging in development mode
  - _Requirements: 1.2, 2.1_

- [ ] 20. Add visual polish and animations
  - Implement smooth transitions for mode switching
  - Add fade-in animations for results display
  - Add hover effects for interactive elements
  - Implement loading spinners with smooth animations
  - Add micro-interactions for button clicks and form submissions
  - Ensure all animations complete within 100-300ms
  - Test animations on mobile devices for performance
  - _Requirements: 8.2, 8.5_

- [ ] 21. Create Docker health checks and startup validation
  - Add health check configuration to backend Dockerfile
  - Implement health check logic in /api/health endpoint
  - Add health check configuration to frontend Dockerfile (Nginx)
  - Configure restart policies in docker-compose files
  - Add startup dependency ordering in docker-compose
  - Test container restart behavior on failure
  - _Requirements: 6.5, 7.3, 7.4_

- [ ] 22. Create documentation and setup instructions
  - Create README.md with project overview and architecture diagram
  - Document Docker setup instructions (development and production)
  - Document environment variable configuration
  - Create API documentation for backend endpoints
  - Document component props and usage
  - Add inline code comments for complex calculations
  - Create troubleshooting guide for common issues
  - _Requirements: 6.2, 6.5, 7.1, 7.2_

- [ ] 23. Write backend unit tests
  - Write unit tests for SSARulesEngine methods with known SSA values
  - Write unit tests for ProjectionService calculations
  - Write unit tests for input validation logic
  - Write unit tests for error handling scenarios
  - Achieve minimum 80% code coverage for services
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 24. Write frontend unit tests
  - Write unit tests for calculation utility functions
  - Write component tests for CalculatorForm validation
  - Write component tests for ResultsDisplay rendering
  - Write tests for API service error handling
  - Mock API calls in component tests
  - _Requirements: 1.2, 2.1_

- [ ] 25. Write integration tests
  - Write end-to-end test for individual calculation flow
  - Write end-to-end test for couple calculation flow
  - Write test for mode switching functionality
  - Write test for assumptions adjustment and recalculation
  - Write API integration tests for all endpoints
  - Test error scenarios and edge cases
  - _Requirements: 1.1, 2.1, 4.1_

- [ ] 26. Perform accessibility testing
  - Run axe-core accessibility tests on all pages
  - Test keyboard navigation through entire application
  - Test with screen reader (NVDA or JAWS)
  - Verify color contrast ratios with automated tools
  - Test focus management and indicators
  - Fix any identified accessibility issues
  - _Requirements: 8.4_

- [ ] 27. Perform responsive testing
  - Test layout at 320px width (small mobile)
  - Test layout at 768px width (tablet)
  - Test layout at 1024px width (desktop)
  - Test layout at 1920px width (large desktop)
  - Test chart rendering at all breakpoints
  - Test touch interactions on mobile devices
  - Verify tap target sizes meet 44px minimum
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 28. Perform Docker testing
  - Test development environment startup with docker-compose up
  - Verify hot reloading works in development mode
  - Test production build process with docker-compose -f docker-compose.prod.yml build
  - Test production environment startup
  - Verify environment variable loading in both modes
  - Test health check endpoints
  - Verify container restart behavior
  - Check production image sizes are optimized
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 29. Perform calculation accuracy validation
  - Validate FRA calculations against SSA published tables
  - Validate early reduction percentages against SSA examples
  - Validate delayed retirement credits against SSA examples
  - Validate spousal benefit calculations with test cases
  - Validate survivor benefit calculations with test cases
  - Test boundary conditions (age 62, 70, FRA)
  - Test married couple scenarios with various age combinations
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 30. Performance testing and optimization
  - Measure initial page load time on simulated 4G connection
  - Measure time to interactive
  - Measure API response times for calculations
  - Measure chart rendering performance
  - Run Lighthouse audit and achieve >90 score
  - Optimize bundle size if needed
  - Implement code splitting if bundle is large
  - _Requirements: 3.5, 5.5_
