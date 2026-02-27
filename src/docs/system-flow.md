# System Flow Documentation  
## Hyper-Local Targeting Engine – Digital Democracy Platform

---

## 1. Overview

The Hyper-Local Targeting Engine is a backend-driven system designed to enhance transparency, citizen awareness, and trust in public governance. The system uses geo-fencing around public development projects (such as government hospitals, colleges, and infrastructure works) to deliver contextual civic information to citizens based on their real-time location.  

The backend acts as the central intelligence layer, coordinating data storage, geo-spatial validation, notification triggering, and analytics generation in a secure, scalable, and extensible manner.

---

## 2. High-Level Architecture Flow

Client (Citizen / Admin UI)
|
v
API Gateway (Express Server)
|
v
Middleware Layer
(Authentication | Rate Limiting | Logging | Error Handling)
|
v
Domain Modules
(Project | GeoFence | Engagement | Notification | Analytics)
|
v
Database (MongoDB)
|
v
Analytics & Insights Layer

---

## 3. Actors in the System

### 3.1 Administrator
- Creates and manages public development projects
- Defines geo-fence radius and project metadata
- Views engagement analytics

### 3.2 Citizen
- Shares device location (with consent)
- Receives contextual notifications when entering geo-fenced zones
- Interacts passively without identity tracking

### 3.3 Backend System
- Validates requests
- Performs geo-spatial calculations
- Triggers notifications
- Records anonymized engagement data
- Generates analytics for governance insights

---

## 4. Detailed Request Flow

### 4.1 Project Creation Flow (Admin)

1. Admin submits project details via dashboard:
   - Project name
   - Department
   - Latitude & longitude
   - Geo-fence radius
   - Project status

2. Request reaches backend:
   - Passes through authentication middleware
   - Input is validated using project validators

3. Project Service:
   - Applies business rules
   - Stores project in MongoDB

4. Response:
   - Success confirmation sent to admin
   - Project becomes active for geo-fence validation

---

## 5. Geo-Fence Validation Flow (Core Logic)

### 5.1 Citizen Location Detection

1. Citizen device sends location data:
   - Latitude
   - Longitude

2. Request passes through:
   - Request logger
   - Rate limiter
   - Global error handler (if required)

3. Geo-Fence Service:
   - Fetches all active projects
   - Uses geo-spatial utility functions
   - Calculates distance using Haversine formula

4. Decision Logic:
   - If user is inside any geo-fence:
     - Project is marked as matched
   - If outside:
     - No notification triggered

---

## 6. Notification Trigger Flow (Simulated)

1. When a geo-fence match is detected:
   - Notification service selects a civic message
   - Message selection is based on project department/type

2. Notification Controller:
   - Formats response payload
   - Adds timestamp and contextual metadata

3. Response sent to client:
   - Notification displayed in citizen UI
   - No personal data stored

> Note: Notification delivery is currently simulated and designed to be extensible to SMS, WhatsApp, push notifications, or government platforms.

---

## 7. Engagement Tracking Flow

1. Every successful geo-fence trigger:
   - Creates an engagement record
   - Stores:
     - Project ID
     - User location (approximate)
     - Timestamp

2. Engagement data is:
   - Anonymous
   - Non-identifying
   - Used strictly for analytics

3. This data forms the foundation for governance insights and impact measurement.

---

## 8. Analytics & Governance Insights Flow

1. Analytics service aggregates engagement records:
   - Total engagements per project
   - Time-based interaction patterns

2. Aggregation logic:
   - Uses MongoDB aggregation pipelines
   - Optimized for read-heavy dashboards

3. Analytics Controller:
   - Exposes APIs for dashboard consumption
   - Returns structured, visualization-ready data

4. Output enables:
   - Measuring citizen awareness
   - Identifying high-impact projects
   - Improving transparency in governance

---

## 9. Background Jobs Flow

### 9.1 Cleanup Job
- Periodically removes outdated or completed projects
- Prevents stale data from affecting geo-fence logic

### 9.2 Analytics Snapshot Job
- Runs on a scheduled basis
- Generates daily engagement summaries
- Can be extended to export reports or trigger alerts

---

## 10. Middleware & Safety Flow

Every request passes through cross-cutting middleware layers:

- Request Logger:
  - Assigns correlation IDs
  - Tracks request duration

- Rate Limiter:
  - Prevents abuse and spamming
  - Ensures system stability

- Error Middleware:
  - Captures all unhandled exceptions
  - Returns consistent error responses

This ensures reliability, observability, and fault tolerance.

---

## 11. Extensibility & Future Enhancements

The system is intentionally designed to support future integrations:

- AI Module:
  - Personalized civic messaging
  - Scheme recommendations

- Maps Integration:
  - Government GIS datasets
  - Official infrastructure mapping

- Blockchain Audit Layer:
  - Immutable logs for civic transparency
  - Public trust verification

Each integration is modular and can be enabled without restructuring the core system.

---

## 12. Key Design Principles

- Modular, domain-driven architecture
- Privacy-first citizen interaction
- Geo-spatial intelligence at core
- Analytics-first governance mindset
- Cloud and scale readiness
- Extensibility without refactoring

---

## 13. Summary

The Hyper-Local Targeting Engine backend orchestrates location intelligence, civic communication, and governance analytics in a unified system. By combining geo-fencing, real-time validation, and data-driven insights, the platform strengthens transparency and citizen engagement at a hyper-local level, laying the foundation for scalable digital democracy solutions.

---