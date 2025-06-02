# Balance Cron Service

This service handles recurring transactions and other scheduled tasks for the Balance application.

## Setup

### Local Development

1. Install dependencies:
```bash
cd scripts/cron
pnpm install
```

2. Set up environment variables:
```bash
# Copy from the main project's .env file or create your own
# Ensure DATABASE_URL is set correctly
```

3. Run in development:
```bash
pnpm dev
```

4. Run in production:
```bash
pnpm start
```

### Docker Development

1. Build the container:
```bash
# From project root
docker build -f scripts/cron/Dockerfile -t balance-cron .
```

2. Run with Docker Compose:
```bash
docker-compose up cron
```

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string (same as main app)

### Optional
- `NODE_ENV`: Environment (development/production) - Default: production
- `LOG_LEVEL`: Logging level (debug/info/warn/error) - Default: info
- `CRON_PORT`: Port for health check server - Default: 3001
- `TZ`: Timezone for cron jobs - Default: Europe/Rome

### Redis (Optional - for caching)
- `REDIS_HOST`: Redis host - Default: 127.0.0.1
- `REDIS_PORT`: Redis port - Default: 6379
- `REDIS_USERNAME`: Redis username - Default: default
- `REDIS_DB`: Redis database number - Default: 0
- `REDIS_PASSWORD`: Redis password (if required)

## API Endpoints

The service exposes several monitoring and management endpoints:

### Health Checks
- `GET /health`: Quick health status
- `GET /health/detailed`: Comprehensive health check with all subsystems
- `GET /metrics`: Prometheus-compatible metrics

### Job Management
- `GET /jobs/status`: Current job status with recent history
- `GET /jobs/history/:jobName?`: Job execution history (optional job filter)
- `GET /jobs/stats/:jobName?`: Detailed job statistics
- `POST /jobs/trigger/recurring-transactions`: Manual job trigger (for testing)

## Cron Jobs

### Recurring Transactions
- **Schedule**: Daily at 9:00 AM (Europe/Rome timezone)
- **Purpose**: Process due recurring transaction rules
- **Development**: Every 5 minutes when `NODE_ENV=development`

### Health Monitoring
- **Schedule**: Every 5 minutes
- **Purpose**: Perform system health checks and alerting

## Production Deployment

### Docker Deployment (Recommended)

1. **Using Docker Compose (alongside main app):**
```bash
# From project root
docker-compose up -d
```

2. **Standalone Docker:**
```bash
# Build
docker build -f scripts/cron/Dockerfile -t balance-cron .

# Run
docker run -d \
  --name balance-cron \
  --restart unless-stopped \
  -p 3001:3001 \
  -e DATABASE_URL="your_database_url" \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  -v cron-logs:/app/scripts/cron/logs \
  balance-cron
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: balance-cron
spec:
  replicas: 1
  selector:
    matchLabels:
      app: balance-cron
  template:
    metadata:
      labels:
        app: balance-cron
    spec:
      containers:
      - name: cron
        image: balance-cron:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: balance-secrets
              key: database-url
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: balance-cron-service
spec:
  selector:
    app: balance-cron
  ports:
  - port: 3001
    targetPort: 3001
```

### Systemd Service (Bare Metal)

```ini
# /etc/systemd/system/balance-cron.service
[Unit]
Description=Balance Cron Service
After=network.target postgresql.service

[Service]
Type=simple
User=balance
WorkingDirectory=/opt/balance/scripts/cron
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://...
Environment=LOG_LEVEL=info

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable balance-cron
sudo systemctl start balance-cron
```

## Monitoring

### Health Checks
The service provides comprehensive health monitoring:
- Database connectivity and performance
- Job execution tracking and failure detection
- Memory usage monitoring
- Disk space checks

### Logging
Logs are written to:
- `logs/combined.log`: All logs
- `logs/error.log`: Error logs only
- Console: Development only

### Metrics
Prometheus-compatible metrics available at `/metrics`:
- Service uptime
- Job execution counts and durations
- Failure rates
- System health status

### Alerting
Configure monitoring systems to alert on:
- Health endpoint returning 503 status
- High job failure rates
- Long-running jobs (>30 minutes)
- Memory pressure
- Disk space issues

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Verify `DATABASE_URL` is correct
   - Check database server is accessible
   - Ensure database exists and migrations are applied

2. **Permission Errors:**
   - Check logs directory is writable
   - Verify database user has necessary permissions

3. **Container Issues:**
   - Check health endpoint: `curl http://localhost:3001/health`
   - Review container logs: `docker logs balance-cron`
   - Verify environment variables are set correctly

4. **Cron Jobs Not Running:**
   - Check job status endpoint: `curl http://localhost:3001/jobs/status`
   - Verify timezone configuration
   - Check for long-running jobs blocking execution

### Debug Mode
Enable debug logging:
```bash
# Environment variable
LOG_LEVEL=debug

# Or in development
NODE_ENV=development
```

## Architecture

```
src/
├── config/
│   ├── database.ts    # Database connection & configuration
│   └── logger.ts      # Winston logging configuration
├── services/
│   ├── recurring-processor.ts  # Recurring transaction business logic
│   ├── job-tracker.ts         # Job execution tracking
│   └── health-monitor.ts      # System health monitoring
└── index.ts          # Main entry point & Express server
```

## Development

### Testing
```bash
# Type checking
pnpm typecheck

# Build
pnpm build

# Lint
pnpm lint

# Manual job trigger (development)
curl -X POST http://localhost:3001/jobs/trigger/recurring-transactions
```

### Adding New Cron Jobs
1. Create processing logic in `src/services/`
2. Add cron schedule in `src/index.ts`
3. Integrate with job tracker for monitoring
4. Add health checks if needed
5. Update documentation 