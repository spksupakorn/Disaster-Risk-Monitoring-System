# Quick Start Guide

## Prerequisites
- Node.js 18+
- Docker & Docker Compose (recommended)

## Option 1: Docker Compose (Recommended)

1. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - `OPENWEATHER_API_KEY` (get from https://openweathermap.org/api)
   - Optional: Twilio and SendGrid credentials for SMS/email alerts

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

4. **Access the application:**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

## Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL and Redis:**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   REDIS_HOST=localhost
   REDIS_PORT=6379
   OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Run migrations:**
   ```bash
   npm run migration:up
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Test the API

### 1. Create a Region

```bash
curl -X POST http://localhost:3000/api/regions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "California",
    "latitude": 36.7783,
    "longitude": -119.4179,
    "disasterTypes": ["wildfire", "earthquake"]
  }'
```

### 2. Create Alert Setting

```bash
curl -X POST http://localhost:3000/api/alert-settings \
  -H "Content-Type: application/json" \
  -d '{
    "regionId": 1,
    "disasterType": "wildfire",
    "thresholdScore": 70
  }'
```

### 3. Get Disaster Risks

```bash
curl http://localhost:3000/api/disaster-risks
```

### 4. Send Alert

```bash
curl -X POST http://localhost:3000/api/alerts/send \
  -H "Content-Type: application/json" \
  -d '{
    "regionId": 1,
    "disasterType": "wildfire",
    "channel": "email",
    "recipient": "admin@example.com"
  }'
```

### 5. Get Alerts

```bash
curl http://localhost:3000/api/alerts
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Troubleshooting

### Port already in use
If port 3000, 5432, or 6379 is already in use, update the ports in `docker-compose.yml` or `.env`.

### Database connection error
Ensure PostgreSQL is running:
```bash
docker-compose ps postgres
```

### Redis connection error
Ensure Redis is running:
```bash
docker-compose ps redis
```

### API Key errors
Make sure you've configured `OPENWEATHER_API_KEY` in your `.env` file.

## Next Steps

1. Explore the API documentation at http://localhost:3000/api-docs
2. Configure alert thresholds in `.env`
3. Set up Twilio/SendGrid for real SMS/email alerts
4. Configure the background service cron schedule
5. Deploy to production using Docker

## Production Deployment

```bash
# Build production image
docker build -t disaster-monitoring:latest .

# Run in production mode
docker-compose -f docker-compose.yml up -d
```

For more details, see the main [README.md](README.md).
