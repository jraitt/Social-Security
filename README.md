# Social Security Benefits Calculator

A modern full-stack web application for calculating optimal Social Security claiming strategies, built with Next.js 14, TypeScript, and SQLite.

## Technology Stack

### Core Framework
- **Next.js 14+** (App Router) - Full-stack React framework
- **TypeScript** - Type-safe development
- **React 18** - UI library with Server and Client Components

### Database
- **SQLite** - File-based, zero-config database
- **Drizzle ORM** - Type-safe database queries and migrations

### UI/Styling
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, customizable React components
- **Recharts** - Financial charts and visualizations

### Development & Deployment
- **Docker** - Containerized deployment
- **ESLint & Prettier** - Code quality and formatting
- **Hot Reload** - Built into Next.js

## Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utility libraries
│   │   ├── services/          # Business logic services
│   │   ├── config/            # Configuration
│   │   └── utils.ts           # Utility functions
│   ├── db/                    # Database
│   │   ├── schema.ts          # Drizzle schema
│   │   ├── db.ts              # Database connection
│   │   └── migrations/        # Database migrations
│   └── types/                 # TypeScript types
├── data/                      # SQLite database (gitignored)
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
└── package.json               # Dependencies and scripts
```

## Prerequisites

- **Node.js 20+** (for local development)
- **Docker & Docker Compose** (for containerized deployment)

## Getting Started

### Local Development (Without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Create database directory:**
   ```bash
   mkdir -p data
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Application: http://localhost:3000
   - API: http://localhost:3000/api/health

### Docker Development Environment

1. **Start development container:**
   ```bash
   npm run docker:dev
   # or with build
   npm run docker:dev:build
   ```

2. **Access the application:**
   - Application: http://localhost:3000

### Docker Production Environment

1. **Build production image:**
   ```bash
   npm run docker:prod:build
   ```

2. **Start production container:**
   ```bash
   npm run docker:prod:up
   ```

3. **Access the application:**
   - Application: http://localhost:3000

## Available Scripts

### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes directly
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Docker
- `npm run docker:dev` - Start development container
- `npm run docker:dev:build` - Build and start development container
- `npm run docker:prod:build` - Build production image
- `npm run docker:prod:up` - Start production container

## Environment Variables

Create a `.env.local` file for local development:

```env
NODE_ENV=development
DATABASE_URL=file:./data/app.db

# Feature Flags
ENABLE_ENHANCED_OPTIMIZATION=true
ENABLE_PRESENT_VALUE=true
ENABLE_PROJECTIONS=true

# Calculation Defaults
DEFAULT_DISCOUNT_RATE=0.03
PV_CALCULATION_PRECISION=2
ALTERNATIVE_STRATEGY_THRESHOLD=0.02
```

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Calculations
- `POST /api/calculate/individual` - Individual calculation
- `POST /api/calculate/couple` - Couple calculation
- `POST /api/calculate/enhanced/individual` - Enhanced individual calculation
- `POST /api/calculate/enhanced/couple` - Enhanced couple calculation

See `API.md` for detailed API documentation.

## Docker Configuration

### Development Mode
- Hot reloading enabled
- Source code mounted as volumes
- SQLite database persisted in `./data`
- Runs on port 3000

### Production Mode
- Multi-stage build for minimal image size
- Standalone Next.js build
- SQLite database persisted in volume
- Runs as non-root user (nextjs:nodejs)
- Resource limits configured
- Runs on port 3000

## Database Management

The application uses SQLite with Drizzle ORM for data persistence.

### View Database
```bash
npm run db:studio
```

### Create New Migration
```bash
npm run db:generate
npm run db:migrate
```

### Backup Database
```bash
cp data/app.db data/app.db.backup
```

## Health Checks

Both containers include health checks:
- Backend: `GET /api/health`
- Frontend: HTTP check on root path

## Troubleshooting

### Containers won't start
- Check if ports 3002 and 5174 (dev) or 80 (prod) are available
- Verify environment files exist and are properly configured
- Check Docker logs: `npm run logs`

### Hot reloading not working
- Ensure volumes are properly mounted in docker-compose.yml
- Restart the containers: `npm run dev:down && npm run dev`

### Permission issues
- Production containers run as non-root user (UID 1001)
- Ensure proper file permissions if mounting additional volumes
