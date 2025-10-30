# Pulse Architecture Documentation

## System Overview

Pulse is a distributed uptime monitoring service built with modern web technologies. The system consists of three main components: frontend, backend, and infrastructure.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript + Tailwind CSS + shadcn/ui              │
│  - Dashboard                                                     │
│  - Target Management                                             │
│  - Alert Management                                              │
│  - Settings & Preferences                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    tRPC (Type-Safe RPC)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      API Layer                                   │
├─────────────────────────────────────────────────────────────────┤
│  Express.js 4 + tRPC 11 + Node.js 22                           │
│  - Authentication & Authorization                               │
│  - Target CRUD Operations                                       │
│  - Monitoring Engine                                             │
│  - Alert Management                                              │
│  - Notification System                                           │
│  - Analytics & Reporting                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Data Layer                                    │
├─────────────────────────────────────────────────────────────────┤
│  MySQL 8.0 + Drizzle ORM                                        │
│  - Users & Authentication                                        │
│  - Monitoring Targets                                            │
│  - Health Check Results                                          │
│  - Alert Rules & Alerts                                          │
│  - Notification Settings                                         │
│  - Uptime Statistics                                             │
│  - Audit Logs                                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (Client)

**Technology Stack**:
- React 19 with TypeScript for type-safe UI
- Next.js for server-side rendering
- Tailwind CSS 4 for styling
- shadcn/ui for component library
- tRPC for end-to-end type safety
- Wouter for lightweight routing

**Key Pages**:
1. **Home Page**: Landing page with feature overview
2. **Dashboard**: Real-time monitoring overview
3. **Targets**: CRUD operations for monitoring targets
4. **Target Detail**: Detailed view with checks and alerts
5. **Alerts**: Alert management and history
6. **Settings**: User preferences and notifications

**State Management**:
- React Query for server state
- tRPC hooks for data fetching
- Context API for authentication

### Backend (Server)

**Technology Stack**:
- Express.js 4 for HTTP server
- tRPC 11 for type-safe RPC
- Node.js 22 runtime
- Drizzle ORM for database operations

**Core Modules**:

1. **Authentication Module** (`server/_core/`)
   - OAuth2 integration with Manus
   - Session management with JWT
   - Role-based access control

2. **Monitoring Module** (`server/monitoring.ts`)
   - Periodic health check execution
   - HTTP request handling
   - Response time measurement
   - Status code validation
   - Alert triggering logic

3. **Notification Module** (`server/notifications.ts`)
   - Email notifications
   - Slack webhook integration
   - Discord webhook integration
   - Notification queuing

4. **Database Module** (`server/db.ts`)
   - Query helpers for all entities
   - Transaction management
   - Connection pooling

5. **Router Module** (`server/routers.ts`)
   - tRPC procedure definitions
   - Input validation with Zod
   - Authorization checks
   - Business logic implementation

### Database (Data)

**Schema Design**:

```sql
users
├── id (PK)
├── openId (UNIQUE)
├── name
├── email
├── role (admin | user)
└── timestamps

monitoring_targets
├── id (PK)
├── userId (FK)
├── name
├── url
├── protocol (http | https)
├── method (GET | POST | HEAD)
├── checkInterval
├── timeout
├── expectedStatusCode
├── isActive
└── timestamps

monitoring_checks
├── id (PK)
├── targetId (FK)
├── statusCode
├── responseTime
├── isSuccess
├── errorMessage
└── checkedAt

alert_rules
├── id (PK)
├── targetId (FK)
├── userId (FK)
├── name
├── ruleType
├── threshold
├── notificationChannels (JSON)
├── isActive
└── timestamps

alerts
├── id (PK)
├── ruleId (FK)
├── targetId (FK)
├── userId (FK)
├── status (triggered | acknowledged | resolved)
├── message
├── severity (low | medium | high | critical)
└── timestamps

notification_settings
├── id (PK)
├── userId (FK, UNIQUE)
├── emailEnabled
├── slackWebhookUrl
├── discordWebhookUrl
└── timestamps

uptime_statistics
├── id (PK)
├── targetId (FK)
├── period (daily | weekly | monthly)
├── date
├── totalChecks
├── successfulChecks
├── uptimePercentage
├── averageResponseTime
└── timestamps

audit_logs
├── id (PK)
├── userId (FK)
├── action
├── entityType
├── entityId
├── details
└── createdAt
```

## Data Flow

### Monitoring Flow

```
1. Scheduler triggers monitoring cycle
   ↓
2. Fetch all active targets from database
   ↓
3. For each target:
   a. Perform HTTP health check
   b. Measure response time
   c. Validate status code
   d. Save check result to database
   ↓
4. Evaluate alert rules
   ↓
5. If threshold exceeded:
   a. Create alert record
   b. Send notifications (email, Slack, Discord)
   ↓
6. Calculate uptime statistics
```

### User Request Flow

```
1. User action in React component
   ↓
2. Call tRPC hook (useQuery/useMutation)
   ↓
3. tRPC client serializes request
   ↓
4. Express server receives request
   ↓
5. Authentication middleware validates session
   ↓
6. Authorization check (protectedProcedure)
   ↓
7. Input validation with Zod
   ↓
8. Business logic execution
   ↓
9. Database operation via Drizzle ORM
   ↓
10. Response serialization with SuperJSON
    ↓
11. React component updates with new data
```

## Deployment Architecture

### Docker Deployment

```
┌──────────────────────────────────────┐
│      Docker Compose Network          │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────┐                   │
│  │ Pulse App    │                   │
│  │ (Node.js)    │                   │
│  │ Port: 3000   │                   │
│  └──────┬───────┘                   │
│         │                           │
│  ┌──────▼───────┐                   │
│  │ MySQL        │                   │
│  │ Port: 3306   │                   │
│  └──────────────┘                   │
│                                      │
│  ┌──────────────┐                   │
│  │ Prometheus   │                   │
│  │ Port: 9090   │                   │
│  └──────────────┘                   │
│                                      │
│  ┌──────────────┐                   │
│  │ Grafana      │                   │
│  │ Port: 3001   │                   │
│  └──────────────┘                   │
│                                      │
└──────────────────────────────────────┘
```

### Kubernetes Deployment

```
┌─────────────────────────────────────────────────┐
│         Kubernetes Cluster                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │  pulse namespace                      │    │
│  ├───────────────────────────────────────┤    │
│  │                                       │    │
│  │  Deployment: pulse-app                │    │
│  │  ├─ Pod 1 (Replica 1)                │    │
│  │  ├─ Pod 2 (Replica 2)                │    │
│  │  └─ Pod 3 (Replica 3)                │    │
│  │                                       │    │
│  │  Service: pulse-app (ClusterIP)      │    │
│  │  Port: 80 → 3000                     │    │
│  │                                       │    │
│  │  HPA: Auto-scaling (3-10 replicas)   │    │
│  │  Triggers: CPU 70%, Memory 80%       │    │
│  │                                       │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  External Services:                            │
│  ├─ MySQL (managed database)                   │
│  ├─ Prometheus (monitoring)                    │
│  └─ Grafana (visualization)                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Security Architecture

### Authentication Flow

```
1. User clicks "Sign In"
   ↓
2. Redirected to Manus OAuth portal
   ↓
3. User authenticates with credentials
   ↓
4. OAuth server redirects to /api/oauth/callback
   ↓
5. Backend exchanges code for token
   ↓
6. User record created/updated in database
   ↓
7. Session cookie set with JWT
   ↓
8. Redirected to dashboard
```

### Authorization Model

```
Public Routes:
├─ / (home page)
└─ /404 (error page)

Protected Routes (require authentication):
├─ /dashboard
├─ /targets
├─ /targets/:id
├─ /alerts
└─ /settings

Admin-Only Operations:
├─ User management
├─ System configuration
└─ Audit log access
```

## Monitoring & Observability

### Metrics Collection

Prometheus scrapes metrics from:
- Application metrics endpoint (`/metrics`)
- MySQL database metrics
- System resource metrics

### Key Metrics

1. **Application Metrics**
   - Request count and latency
   - Error rates
   - tRPC procedure execution time
   - Database query duration

2. **Monitoring Metrics**
   - Health check success/failure rates
   - Average response times
   - Alert trigger frequency
   - Target availability

3. **Infrastructure Metrics**
   - CPU usage
   - Memory usage
   - Disk usage
   - Network I/O

### Alerting Rules

Prometheus alert rules trigger when:
- Application error rate > 5%
- Response time > 1000ms
- Database connection pool exhausted
- Pod restart frequency > threshold

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Application**
   - No server-side sessions (JWT-based)
   - All state in database
   - Can run multiple instances

2. **Load Balancing**
   - Kubernetes Service distributes traffic
   - Round-robin load balancing
   - Health checks ensure pod readiness

3. **Database Scaling**
   - Read replicas for analytics queries
   - Connection pooling
   - Query optimization

### Vertical Scaling

- Increase pod resource limits
- Upgrade database instance type
- Optimize code and queries

## Performance Optimization

### Frontend Optimization
- Code splitting with dynamic imports
- Image optimization
- CSS minification
- JavaScript bundling with Vite

### Backend Optimization
- Database connection pooling
- Query result caching
- Batch operations
- Async/await for non-blocking I/O

### Infrastructure Optimization
- CDN for static assets
- Database indexing
- Query optimization
- Caching strategies

## Disaster Recovery

### Backup Strategy
- Daily database backups
- Off-site backup storage
- Point-in-time recovery capability

### High Availability
- Multi-replica deployment
- Database replication
- Automated failover
- Health checks and pod restart

### Disaster Recovery Plan
1. Identify failure
2. Failover to backup systems
3. Restore from latest backup
4. Verify data integrity
5. Resume normal operations

## Future Enhancements

1. **Advanced Analytics**
   - Machine learning for anomaly detection
   - Predictive alerting
   - Trend analysis

2. **Enhanced Monitoring**
   - Custom metrics collection
   - Synthetic monitoring
   - Real user monitoring (RUM)

3. **Integrations**
   - PagerDuty integration
   - Opsgenie integration
   - Custom webhook support

4. **Performance**
   - GraphQL API
   - WebSocket support for real-time updates
   - Edge computing for distributed monitoring

---

**Version**: 1.0.0  
**Last Updated**: 2024
