## Example API Requests

Below are example requests you can use to test the Disaster Risk Monitoring System API.

### Using cURL

#### 1. Create a Region - New York

```bash
curl -X POST http://localhost:3000/api/regions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New York City",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "disasterTypes": ["flood"]
  }'
```

#### 2. Create a Region - California

```bash
curl -X POST http://localhost:3000/api/regions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Los Angeles",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "disasterTypes": ["wildfire", "earthquake"]
  }'
```

#### 3. Get All Regions

```bash
curl http://localhost:3000/api/regions
```

#### 4. Create Alert Settings - Flood

```bash
curl -X POST http://localhost:3000/api/alert-settings \
  -H "Content-Type: application/json" \
  -d '{
    "regionId": 1,
    "disasterType": "flood",
    "thresholdScore": 60
  }'
```

#### 5. Create Alert Settings - Wildfire

```bash
curl -X POST http://localhost:3000/api/alert-settings \
  -H "Content-Type: application/json" \
  -d '{
    "regionId": 2,
    "disasterType": "wildfire",
    "thresholdScore": 70
  }'
```

#### 6. Get Disaster Risk Assessment

```bash
curl http://localhost:3000/api/disaster-risks
```

#### 7. Send SMS Alert

```bash
curl -X POST http://localhost:3000/api/alerts/send \
  -H "Content-Type: application/json" \
  -d '{
    "regionId": 1,
    "disasterType": "flood",
    "channel": "sms",
    "recipient": "+1234567890"
  }'
```

#### 8. Send Email Alert

```bash
curl -X POST http://localhost:3000/api/alerts/send \
  -H "Content-Type: application/json" \
  -d '{
    "regionId": 2,
    "disasterType": "wildfire",
    "channel": "email",
    "recipient": "admin@example.com"
  }'
```

#### 9. Get Latest Alerts

```bash
curl http://localhost:3000/api/alerts
```

#### 10. Get Alerts by Region

```bash
curl http://localhost:3000/api/alerts/region/1?limit=5
```

---

### Using Postman or Insomnia

Import the following collection or create requests manually:

**Base URL**: `http://localhost:3000`

**Endpoints**:
1. `POST /api/regions` - Create region
2. `GET /api/regions` - List regions
3. `GET /api/regions/:id` - Get region details
4. `POST /api/alert-settings` - Create alert setting
5. `GET /api/alert-settings` - List alert settings
6. `GET /api/alert-settings/region/:regionId` - Get settings by region
7. `GET /api/disaster-risks` - Get risk assessment
8. `POST /api/alerts/send` - Send alert
9. `GET /api/alerts` - Get latest alerts
10. `GET /api/alerts/region/:regionId` - Get alerts by region

---

### Using JavaScript/Fetch

```javascript
// Create a Region
const createRegion = async () => {
  const response = await fetch('http://localhost:3000/api/regions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      disasterTypes: ['earthquake']
    })
  });
  const data = await response.json();
  console.log(data);
};

// Get Disaster Risks
const getDisasterRisks = async () => {
  const response = await fetch('http://localhost:3000/api/disaster-risks');
  const data = await response.json();
  console.log(data);
};

// Send Alert
const sendAlert = async () => {
  const response = await fetch('http://localhost:3000/api/alerts/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      regionId: 1,
      disasterType: 'earthquake',
      channel: 'email',
      recipient: 'emergency@example.com'
    })
  });
  const data = await response.json();
  console.log(data);
};
```

---

### Sample Response Formats

#### Region Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "New York City",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "disasterTypes": ["flood"],
    "createdAt": "2025-10-27T10:00:00.000Z",
    "updatedAt": "2025-10-27T10:00:00.000Z"
  }
}
```

#### Disaster Risk Report Response
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "regionId": 1,
        "regionName": "New York City",
        "disasterType": "flood",
        "riskScore": 75.5,
        "riskLevel": "high",
        "alertTriggered": true,
        "details": {
          "rainfall": 65,
          "humidity": 85,
          "description": "Heavy rain"
        }
      }
    ],
    "timestamp": "2025-10-27T10:15:00.000Z"
  }
}
```

#### Alert Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "regionId": 1,
    "disasterType": "flood",
    "riskLevel": "high",
    "riskScore": 75.5,
    "message": "DISASTER ALERT\\n\\nRegion: New York City\\n...",
    "channel": "email",
    "recipient": "admin@example.com",
    "sentAt": "2025-10-27T10:20:00.000Z"
  }
}
```

---

For interactive API documentation, visit: **http://localhost:3000/api-docs**
