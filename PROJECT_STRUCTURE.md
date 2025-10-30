# Pulse Project Structure

Complete overview of the Pulse project directory structure.

## Root Level

```
pulse/
├── client/                    # React frontend application
├── server/                    # Express.js backend
├── drizzle/                   # Database schema and migrations
├── infrastructure/            # DevOps and deployment configs
├── docs/                      # Documentation files
├── .github/                   # GitHub configuration
├── package.json               # Project dependencies
├── pnpm-lock.yaml            # Dependency lock file
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
├── vitest.config.ts          # Test configuration
├── .dockerignore              # Docker build exclusions
├── README.md                  # Project overview
├── PROJECT_STRUCTURE.md       # This file
└── todo.md                    # Task tracking
```

## Client (Frontend)

```
client/
├── src/
│   ├── pages/                 # Page components
│   │   ├── Home.tsx          # Landing page
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Targets.tsx        # Target management
│   │   ├── TargetDetail.tsx   # Target details view
│   │   ├── Alerts.tsx         # Alert management
│   │   ├── Settings.tsx       # User settings
│   │   └── NotFound.tsx       # 404 page
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── DashboardLayout.tsx # Main layout
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   └── AIChatBox.tsx      # AI chat component
│   ├── contexts/              # React contexts
│   │   └── ThemeContext.tsx   # Theme management
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.ts         # Authentication hook
│   ├── lib/                   # Utilities and helpers
│   │   ├── trpc.ts           # tRPC client setup
│   │   └── utils.ts          # Utility functions
│   ├── _core/                 # Core functionality
│   │   └── hooks/            # Core hooks
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global styles
│   └── const.ts               # Constants
├── public/                    # Static assets
│   ├── favicon.ico           # Favicon
│   └── robots.txt            # SEO robots file
├── index.html                 # HTML template
├── package.json               # Frontend dependencies
└── tsconfig.json              # TypeScript config
```

## Server (Backend)

```
server/
├── _core/                     # Framework plumbing
│   ├── context.ts            # Request context
│   ├── cookies.ts            # Cookie management
│   ├── env.ts                # Environment variables
│   ├── index.ts              # Server setup
│   ├── llm.ts                # LLM integration
│   ├── notification.ts       # Notifications
│   ├── trpc.ts               # tRPC setup
│   ├── voiceTranscription.ts # Voice to text
│   ├── imageGeneration.ts    # Image generation
│   └── systemRouter.ts       # System procedures
├── db.ts                      # Database queries
├── monitoring.ts              # Monitoring engine
├── notifications.ts           # Alert notifications
├── routers.ts                 # tRPC procedures
└── index.ts                   # Server entry point
```

## Database (Drizzle)

```
drizzle/
├── schema.ts                  # Table definitions
│   ├── users table
│   ├── monitoring_targets table
│   ├── monitoring_checks table
│   ├── alert_rules table
│   ├── alerts table
│   ├── notification_settings table
│   ├── uptime_statistics table
│   └── audit_logs table
└── migrations/                # Database migrations
    └── [timestamp]_*.sql      # Migration files
```

## Infrastructure

```
infrastructure/
├── docker/                    # Docker configuration
│   ├── Dockerfile            # Multi-stage build
│   ├── docker-compose.yml    # Local development stack
│   ├── prometheus.yml        # Prometheus config
│   └── grafana/              # Grafana provisioning
│       └── provisioning/     # Dashboards and datasources
├── kubernetes/                # Kubernetes manifests
│   ├── deployment.yaml       # Deployment + Service + HPA
│   ├── configmap.yaml        # Configuration
│   ├── secrets.yaml          # Secrets template
│   └── rbac.yaml             # Role-based access
├── terraform/                 # Infrastructure as Code
│   ├── main.tf               # Main configuration
│   ├── variables.tf          # Input variables
│   ├── outputs.tf            # Outputs
│   └── aws/                  # AWS-specific configs
└── github-actions/            # CI/CD workflows
    └── ci-cd.yml             # GitHub Actions pipeline
```

## Documentation

```
docs/
├── ARCHITECTURE.md            # System design
├── DEPLOYMENT.md              # Deployment guide
├── API_REFERENCE.md           # API documentation
├── USER_GUIDE.md              # User manual
├── QUICK_START.md             # Quick start guide
├── ARCHITECTURE.pdf           # PDF version
├── DEPLOYMENT.pdf             # PDF version
├── API_REFERENCE.pdf          # PDF version
├── USER_GUIDE.pdf             # PDF version
└── QUICK_START.pdf            # PDF version
```

## GitHub Configuration

```
.github/
└── workflows/
    └── ci-cd.yml              # CI/CD pipeline
        ├── Test job
        ├── Security scan
        ├── Build job
        ├── Deploy to staging
        └── Deploy to production
```

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata and dependencies |
| `pnpm-lock.yaml` | Dependency lock file |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Frontend bundler config |
| `vitest.config.ts` | Test runner config |
| `.dockerignore` | Docker build exclusions |
| `.gitignore` | Git exclusions |
| `.env.example` | Environment template |

## Key Files

### Frontend Entry Points
- `client/src/main.tsx` - React app entry
- `client/index.html` - HTML template
- `client/src/App.tsx` - Main component

### Backend Entry Points
- `server/index.ts` - Server startup
- `server/routers.ts` - API procedures
- `server/_core/index.ts` - Framework setup

### Database
- `drizzle/schema.ts` - Table definitions
- `server/db.ts` - Query helpers

### Configuration
- `package.json` - Dependencies and scripts
- `.env.local` - Environment variables (not in repo)
- `infrastructure/docker/.env` - Docker environment

## Build Artifacts

These directories are generated during build and not committed:

```
dist/                         # Built backend
.next/                        # Next.js build
node_modules/                 # Dependencies
.turbo/                       # Turbo cache
coverage/                     # Test coverage
```

## Development Workflow

1. **Frontend changes** → `client/src/pages/` or `client/src/components/`
2. **Backend changes** → `server/routers.ts` or `server/db.ts`
3. **Database changes** → `drizzle/schema.ts` → `pnpm db:push`
4. **Documentation** → `docs/` folder
5. **Infrastructure** → `infrastructure/` folder

## Important Directories

### Source Code
- `client/src/` - Frontend source
- `server/` - Backend source
- `drizzle/` - Database schema

### Configuration
- `infrastructure/` - DevOps configs
- `.github/` - CI/CD workflows
- Root level config files

### Documentation
- `docs/` - User and developer docs
- `README.md` - Project overview
- `PROJECT_STRUCTURE.md` - This file

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `Dashboard.tsx` |
| Pages | PascalCase | `TargetDetail.tsx` |
| Utilities | camelCase | `utils.ts` |
| Constants | UPPER_CASE | `const API_URL = ...` |
| Database | snake_case | `monitoring_targets` |
| Files | kebab-case | `ci-cd.yml` |

## Dependencies Overview

### Frontend
- React 19 - UI framework
- Next.js - Framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- shadcn/ui - Components
- tRPC - API client
- Wouter - Routing

### Backend
- Express.js - HTTP server
- tRPC - RPC framework
- Drizzle ORM - Database
- Node.js - Runtime

### DevOps
- Docker - Containerization
- Kubernetes - Orchestration
- Prometheus - Monitoring
- Grafana - Visualization

## Environment Variables

Required variables are defined in `.env.example`. Key categories:

- **Database**: `DATABASE_URL`
- **Authentication**: `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`
- **Application**: `VITE_APP_TITLE`, `VITE_APP_LOGO`
- **APIs**: `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`
- **Monitoring**: `MONITORING_INTERVAL`, `MONITORING_TIMEOUT`

---

**Version**: 1.0.0  
**Last Updated**: 2024
