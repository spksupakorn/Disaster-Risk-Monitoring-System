export class Config {
  public static readonly server = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  };

  public static readonly database = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'disaster_monitoring',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    sslEnabled: process.env.DB_SSL_ENABLED === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };

  public static readonly redis = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    cacheTTL: parseInt(process.env.REDIS_CACHE_TTL || '900', 10), // 15 minutes
  };

  public static readonly externalApis = {
    openWeather: {
      apiKey: process.env.OPENWEATHER_API_KEY || '',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
    },
    usgs: {
      apiUrl: process.env.USGS_API_URL || 'https://earthquake.usgs.gov/fdsnws/event/1/query',
    },
  };

  public static readonly messaging = {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
    sendGrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
    },
  };

  public static readonly riskThresholds = {
    flood: {
      high: parseFloat(process.env.FLOOD_HIGH_THRESHOLD || '50'),
    },
    earthquake: {
      high: parseFloat(process.env.EARTHQUAKE_HIGH_THRESHOLD || '5.0'),
    },
    wildfire: {
      temperature: parseFloat(process.env.WILDFIRE_TEMP_THRESHOLD || '35'),
      humidity: parseFloat(process.env.WILDFIRE_HUMIDITY_THRESHOLD || '30'),
    },
  };

  public static readonly backgroundService = {
    riskFetchCron: process.env.RISK_FETCH_CRON || '*/15 * * * *',
  };
}
