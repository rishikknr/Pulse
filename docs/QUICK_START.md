# Pulse Quick Start Guide

Get up and running with Pulse in minutes.

## 5-Minute Setup

### Prerequisites
- Node.js 22.x
- pnpm 9.x
- MySQL 8.0

### Installation

```bash
# 1. Clone and navigate
git clone https://github.com/yourusername/pulse.git
cd pulse

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# 4. Initialize database
pnpm db:push

# 5. Start development server
pnpm dev
```

Access at http://localhost:3000

## First Steps

### 1. Log In
- Click "Sign In"
- Authenticate with Manus OAuth
- You're now in the dashboard

### 2. Add Your First Target
1. Go to "Targets" in sidebar
2. Click "Add Target"
3. Fill in:
   - **Name**: "My Website"
   - **URL**: "example.com"
   - **Protocol**: "HTTPS"
4. Click "Create Target"

### 3. Create an Alert Rule
1. Click on your newly created target
2. Go to "Alert Rules" tab
3. Click "Create Rule"
4. Configure:
   - **Name**: "Website Down"
   - **Type**: "Consecutive Failures"
   - **Threshold**: "3"
   - **Channels**: Select "Email"
5. Click "Create Rule"

### 4. Configure Notifications
1. Go to "Settings"
2. Click "Notifications"
3. Enable Email notifications
4. For Slack/Discord, paste webhook URLs
5. Click "Save"

## Docker Quick Start

```bash
# Navigate to Docker directory
cd infrastructure/docker

# Create environment file
cat > .env << EOF
NODE_ENV=production
DB_ROOT_PASSWORD=rootpassword
DB_NAME=pulse
DB_USER=pulse
DB_PASSWORD=pulsepassword
GRAFANA_PASSWORD=admin
EOF

# Start all services
docker-compose up -d

# Access services
# - App: http://localhost:3000
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
```

## Kubernetes Quick Start

```bash
# 1. Create namespace
kubectl create namespace pulse

# 2. Create secrets
kubectl create secret generic pulse-secrets \
  --from-literal=database-url=mysql://user:pass@db:3306/pulse \
  --from-literal=jwt-secret=your-secret \
  --from-literal=vite-app-id=your-app-id \
  --from-literal=oauth-server-url=https://oauth.example.com \
  --from-literal=vite-oauth-portal-url=https://portal.example.com \
  --from-literal=owner-open-id=your-owner-id \
  --from-literal=forge-api-url=https://api.example.com \
  --from-literal=forge-api-key=your-api-key \
  -n pulse

# 3. Create ConfigMap
kubectl create configmap pulse-config \
  --from-literal=owner-name="Your Name" \
  --from-literal=app-title="Pulse" \
  --from-literal=app-logo="https://example.com/logo.png" \
  -n pulse

# 4. Deploy
kubectl apply -f infrastructure/kubernetes/deployment.yaml -n pulse

# 5. Access
kubectl port-forward svc/pulse-app 3000:80 -n pulse
# Visit http://localhost:3000
```

## Common Commands

### Development
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter
pnpm type-check   # Type checking
pnpm db:push      # Run migrations
```

### Docker
```bash
docker-compose up -d      # Start services
docker-compose down       # Stop services
docker-compose logs -f    # View logs
docker-compose ps         # Check status
```

### Kubernetes
```bash
kubectl get pods -n pulse              # List pods
kubectl logs -f deployment/pulse-app -n pulse  # View logs
kubectl scale deployment pulse-app --replicas=5 -n pulse  # Scale
kubectl port-forward svc/pulse-app 3000:80 -n pulse  # Port forward
```

## Monitoring Your First Target

### What Gets Monitored
- HTTP status code
- Response time
- Availability (uptime %)
- Error messages

### Check Intervals
- Minimum: 10 seconds
- Default: 60 seconds
- Recommended: 300 seconds (5 minutes) for production

### Alert Types
1. **Consecutive Failures**: Alert after N failed checks
2. **Uptime Percentage**: Alert if uptime drops below threshold
3. **Response Time**: Alert if response time exceeds threshold

## Notification Channels

### Email
- Automatically uses your registered email
- No additional setup required

### Slack
1. Create Incoming Webhook in Slack
2. Copy webhook URL
3. Paste in Pulse Settings → Notifications
4. Save

### Discord
1. Create Webhook in Discord server
2. Copy webhook URL
3. Paste in Pulse Settings → Notifications
4. Save

## Accessing Dashboards

### Grafana (Docker)
- URL: http://localhost:3001
- Username: admin
- Password: admin (from .env)

### Prometheus (Docker)
- URL: http://localhost:9090
- Query metrics directly
- View scrape targets

## Troubleshooting

### Can't Connect to Database
```bash
# Check MySQL is running
docker ps | grep mysql

# Test connection
mysql -h localhost -u pulse -p -e "SELECT 1"
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Docker Build Fails
```bash
# Clear cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

## Next Steps

1. **Add More Targets**: Monitor all your critical services
2. **Configure Alerts**: Set up rules for each target
3. **Review Analytics**: Check uptime trends
4. **Explore Settings**: Customize notification preferences
5. **Read Full Docs**: See docs/ folder for detailed guides

## Documentation

- **README.md**: Project overview and full setup guide
- **docs/ARCHITECTURE.md**: System design and architecture
- **docs/DEPLOYMENT.md**: Detailed deployment instructions
- **docs/API_REFERENCE.md**: Complete API documentation
- **docs/USER_GUIDE.md**: Feature guide and best practices

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation
3. Check logs for error messages
4. Contact support with details

---

**Version**: 1.0.0  
**Last Updated**: 2024
