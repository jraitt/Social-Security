# Social Security Benefits Calculator

A Docker-based web application for calculating optimal Social Security claiming strategies.

## Project Structure

```
.
├── backend/              # Node.js/Express API
├── frontend/             # React application
├── docker-compose.yml    # Development environment
├── docker-compose.prod.yml # Production environment
└── package.json          # Root scripts for Docker commands
```

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Getting Started

### Development Environment

1. Copy the example environment file:
   ```bash
   cp .env.development.example .env.development
   ```

2. Start the development environment:
   ```bash
   npm run dev
   ```

   Or build and start:
   ```bash
   npm run dev:build
   ```

3. Access the application:
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3002

### Production Environment

1. Copy the example environment file:
   ```bash
   cp .env.production.example .env.production
   ```

2. Update the `.env.production` file with your production settings.

3. Build the production images:
   ```bash
   npm run prod:build
   ```

4. Start the production environment:
   ```bash
   npm run prod:up
   ```

5. Access the application at http://localhost

## Available Scripts

### Development
- `npm run dev` - Start development environment
- `npm run dev:build` - Build and start development environment
- `npm run dev:down` - Stop development environment
- `npm run dev:clean` - Stop and remove volumes

### Production
- `npm run prod:build` - Build production images
- `npm run prod:up` - Start production environment
- `npm run prod:down` - Stop production environment
- `npm run prod:logs` - View production logs

### Logs
- `npm run logs` - View all container logs
- `npm run logs:backend` - View backend logs only
- `npm run logs:frontend` - View frontend logs only

## Environment Variables

See `.env.example`, `.env.development.example`, and `.env.production.example` for required environment variables.

## Docker Configuration

### Development Mode
- Hot reloading enabled for both frontend and backend
- Source code mounted as volumes
- Debug logging enabled

### Production Mode
- Multi-stage builds for optimized image sizes
- No volume mounts
- Health checks enabled
- Resource limits configured
- Runs as non-root user

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
