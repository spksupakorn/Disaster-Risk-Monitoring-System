# Disaster Risk Monitoring System

A comprehensive RESTful API system for monitoring and assessing disaster risks across regions, built with TypeScript and Clean Architecture principles.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── config/              # Configuration management
├── domain/              # Domain entities and enums
│   ├── entities/        # Core business entities
│   └── enums/           # Domain enumerations
├── application/         # Business logic layer
│   ├── dtos/            # Data Transfer Objects
│   └── services/        # Business services
├── infrastructure/      # Technical infrastructure
│   ├── database/        # Database configuration
│   ├── repositories/    # Data access layer
│   ├── cache/           # Redis cache service
│   ├── logging/         # Logging service
│   ├── errors/          # Error definitions
│   ├── middleware/      # Express middleware
│   ├── background/      # Background jobs
│   ├── swagger/         # API documentation
│   └── di/              # Dependency injection
└── presentation/        # API presentation layer
    ├── controllers/     # HTTP controllers
    └── routes/          # Route definitions
```

## 🚀 Features

- ✅ **TypeScript** with OOP and Clean Architecture
- ✅ **PostgreSQL** database with MikroORM
- ✅ **Redis** caching for external API data (15-minute TTL)
- ✅ **Pino** structured logging
- ✅ **Dependency Injection** with TSyringe
- ✅ **Repository & Unit of Work Pattern**
- ✅ **Service Layer** architecture
- ✅ **DTOs** for data transfer
- ✅ **Global Exception Handler** middleware
- ✅ **Zod** for input validation
- ✅ **Jest** for unit testing
- ✅ **Environment configuration**
- ✅ **Swagger** API documentation
- ✅ **Background Service** for scheduled risk assessments
- ✅ **Third-party API Integration** (OpenWeather, USGS)
- ✅ **Messaging Integration** (Twilio, SendGrid)
- ✅ **Docker** & **Docker Compose** for deployment

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Disaster-Risk-Monitoring-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database credentials
- Redis connection
- External API keys (OpenWeather, Twilio, SendGrid)
- Risk thresholds

### 4. Run with Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 5. Run locally (Development)

```bash
# Start PostgreSQL and Redis (via Docker)
docker-compose up -d postgres redis

# Run database migrations
npm run migration:up

# Start development server
npm run dev
```

## 📊 API Endpoints

### Regions

- `POST /api/regions` - Create a new region
- `GET /api/regions` - Get all regions
- `GET /api/regions/:id` - Get region by ID

### Alert Settings

- `POST /api/alert-settings` - Create alert setting
- `GET /api/alert-settings` - Get all alert settings
- `GET /api/alert-settings/region/:regionId` - Get settings for a region

### Disaster Risks

- `GET /api/disaster-risks` - Get disaster risk assessment for all regions

### Alerts

- `POST /api/alerts/send` - Send an alert
- `GET /api/alerts` - Get latest alerts
- `GET /api/alerts/region/:regionId` - Get alerts for a region

### Documentation

- `GET /api-docs` - Swagger UI documentation
- `GET /health` - Health check endpoint

## 📖 API Documentation

Access the interactive Swagger documentation at:
```
http://localhost:3000/api-docs
```

## 🔄 Workflow

### POST /api/regions
```
Controller → Service → Repository → Database
```
Receives Region data (name, lat, long, disasterTypes) and saves it.

### POST /api/alert-settings
```
Controller → Service → Repository → Database
```
Receives AlertSetting data (regionId, disasterType, thresholdScore) and saves it.

### GET /api/disaster-risks
```
Controller → RiskAssessmentService
  → Check Redis cache
  → Fetch from external APIs (if cache miss)
  → Calculate risk scores
  → Store in Redis (15 min TTL)
  → Compare with thresholds
  → Return risk reports
```

### POST /api/alerts/send
```
Controller → AlertService
  → Assess current risk
  → Send via MessagingService (Twilio/SendGrid)
  → Save to database
  → Log activity
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🏃 Development Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Create database migration
npm run migration:create

# Run migrations
npm run migration:up

# Rollback migration
npm run migration:down
```

## 🌍 External APIs

### OpenWeather API
Used for weather data (temperature, humidity, rainfall)
- Register at: https://openweathermap.org/api

### USGS Earthquake API
Used for seismic activity data
- Free API: https://earthquake.usgs.gov/fdsnws/event/1/

### Twilio (SMS)
Used for SMS alerts
- Register at: https://www.twilio.com/

### SendGrid (Email)
Used for email alerts
- Register at: https://sendgrid.com/

## 🎯 Risk Calculation

### Flood Risk
Based on rainfall data:
- 0mm = 0 risk score
- 50mm+ = 100 risk score (configurable)

### Earthquake Risk
Based on magnitude:
- < 3.0 = Low (20)
- 3.0-4.0 = Low-Medium (40)
- 4.0-5.0 = Medium (70)
- ≥ 5.0 = High (100)

### Wildfire Risk
Based on temperature and humidity:
- High temperature + Low humidity = Higher risk
- Threshold: 35°C temperature, 30% humidity (configurable)

### Risk Levels
- **Low**: Risk score < 40
- **Medium**: Risk score 40-69
- **High**: Risk score ≥ 70

## 📦 Docker Deployment

### Build and Run

```bash
# Build image
docker build -t disaster-monitoring-system .

# Run with docker-compose
docker-compose up -d

# Scale application
docker-compose up -d --scale app=3

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down -v
```

## 🔐 Security Best Practices

- All secrets stored in environment variables
- Non-root user in Docker container
- Input validation with Zod
- SQL injection protection via MikroORM
- Error handling without exposing internals
- CORS configuration

## 📝 Environment Variables

See `.env.example` for all available configuration options:

- **Server**: PORT, NODE_ENV
- **Database**: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- **Redis**: REDIS_HOST, REDIS_PORT, REDIS_CACHE_TTL
- **APIs**: OPENWEATHER_API_KEY, USGS_API_URL
- **Messaging**: TWILIO_*, SENDGRID_*
- **Thresholds**: FLOOD_HIGH_THRESHOLD, EARTHQUAKE_HIGH_THRESHOLD, etc.
- **Background**: RISK_FETCH_CRON

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using Clean Architecture and best practices.

---

For questions or support, please open an issue in the repository.
