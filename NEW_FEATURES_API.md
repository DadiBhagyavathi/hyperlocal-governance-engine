# New Features API Documentation

## 1️⃣ Verified Development Proof Engine

### Upload Development Proof
**POST** `/api/development-proof/upload`

Request:
```json
{
  "projectId": "123",
  "beforeImage": "https://example.com/before.jpg",
  "afterImage": "https://example.com/after.jpg",
  "description": "Old Road → New Smart Road"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "projectId": "123",
    "beforeImage": "https://example.com/before.jpg",
    "afterImage": "https://example.com/after.jpg",
    "description": "Old Road → New Smart Road",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Project Proof
**GET** `/api/development-proof/:projectId`

Response:
```json
{
  "success": true,
  "data": {
    "projectId": "123",
    "beforeImage": "https://example.com/before.jpg",
    "afterImage": "https://example.com/after.jpg",
    "description": "Old Road → New Smart Road"
  }
}
```

### Get All Proofs
**GET** `/api/development-proof/`

---

## 2️⃣ Governance Awareness Analytics

### Get Awareness Metrics
**GET** `/api/awareness/awareness`

Response:
```json
{
  "success": true,
  "data": {
    "citizensReached": 12500,
    "engagementRate": 64,
    "feedbackCollected": 2300,
    "topProject": "Smart Road Development",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Get Project Performance
**GET** `/api/awareness/project-performance`

Response:
```json
{
  "success": true,
  "data": [
    {
      "projectId": "1",
      "name": "Smart Road Development",
      "engagement": 85,
      "feedback": 450
    },
    {
      "projectId": "2",
      "name": "Bridge Construction",
      "engagement": 72,
      "feedback": 380
    }
  ]
}
```

---

## 3️⃣ AI Civic Issue Detection

### Report Complaint
**POST** `/api/issue-detection/complaint`

Request:
```json
{
  "ward": "Ward 17",
  "category": "Water Supply",
  "description": "No water supply since morning",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

Response:
```json
{
  "success": true,
  "data": {
    "ward": "Ward 17",
    "category": "Water Supply",
    "description": "No water supply since morning",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get Issue Clusters
**GET** `/api/issue-detection/clusters`

Response:
```json
{
  "success": true,
  "data": [
    {
      "alert": "High Complaint Cluster Detected",
      "location": "Ward 17",
      "issue": "Water Supply",
      "complaintsCount": 42,
      "severity": "CRITICAL"
    },
    {
      "alert": "High Complaint Cluster Detected",
      "location": "Ward 8",
      "issue": "Road Damage",
      "complaintsCount": 28,
      "severity": "HIGH"
    }
  ]
}
```

---

## Testing the APIs

Start server:
```bash
npm start
```

Test endpoints:
```bash
# Development Proof
curl http://localhost:3000/api/development-proof/123

# Awareness Analytics
curl http://localhost:3000/api/awareness/awareness
curl http://localhost:3000/api/awareness/project-performance

# Issue Detection
curl http://localhost:3000/api/issue-detection/clusters
```
