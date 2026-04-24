# OpsSage Slack Bot

A comprehensive Slack bot integration for the OpsSage Intelligent Incident Copilot, providing AI-powered incident analysis and management directly within Slack.

## Features

### Core Commands
- `/analyze <query>` - AI-powered incident analysis with root cause detection
- `/incident create <title> | <severity> | <service>` - Create new incidents
- `/incident list` - List open incidents
- `/incident resolve <id>` - Resolve incidents
- `/status` - Show system health status
- `/help` - Display help information

### Interactive Features
- **@OpsSage mentions** - Analyze any message by mentioning the bot
- **reactions** - Quick analysis with emoji reactions
- **Interactive buttons** - Execute actions directly from analysis results
- **Real-time updates** - WebSocket support for live updates

### Rich Responses
- Block Kit UI - Beautiful, structured responses
- Action buttons - One-click service restarts, runbook access
- Threaded conversations - Organized discussions
- **Contextual help** - Smart suggestions and tips

## Prerequisites

1. **Slack Workspace** - Admin access to create apps
2. **OpsSage Backend** - Running API Gateway and services
3. **Node.js 18+** - For development
4. **Redis** - For session management (optional)

## Setup

### 1. Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name: "OpsSage"
4. Select your workspace

### 2. Configure App Permissions

#### Bot Token Scopes
```
app_mentions:read
chat:write
chat:write.public
commands
channels:read
channels:history
groups:read
groups:history
im:read
im:history
mpim:read
mpim:history
reactions:read
reactions:write
users:read
```

#### Event Subscriptions
Subscribe to these bot events:
- `app_mention`
- `reaction_added`

#### Slash Commands
Create these commands:
- `/analyze` - Request URL: `http://your-domain:3004/api/v1/slack-bot/events`
- `/incident` - Request URL: `http://your-domain:3004/api/v1/slack-bot/events`
- `/status` - Request URL: `http://your-domain:3004/api/v1/slack-bot/events`
- `/help` - Request URL: `http://your-domain:3004/api/v1/slack-bot/events`

#### Interactive Components
Request URL: `http://your-domain:3004/api/v1/slack-bot/interactive`

### 3. Install and Configure

1. Clone the repository and navigate to the Slack bot directory
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Fill in your Slack credentials:
   ```bash
   # Get these from your Slack app settings
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   
   # OpsSage backend URL
   API_GATEWAY_URL=http://localhost:3000
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the bot:
   ```bash
   npm run start:dev
   ```

## 🎯 Usage Examples

### Basic Incident Analysis
```
/analyze Why is checkout service failing?
```

### Creating Incidents
```
/incident create Database connection timeouts | high | checkout-service
```

### Quick Analysis with Mentions
```
@OpsSage The payment service is showing 503 errors
```

### Quick Analysis with Reactions
React with 👀 to any message containing error information

### System Status
```
/status
```

## 📊 Response Format

The bot provides rich, structured responses using Slack Block Kit:

### Analysis Response
```
🤖 Incident Analysis Complete

Query: Why is checkout service failing?

🎯 Root Cause Analysis
Hypothesis: Database connection pool exhaustion in checkout-service
Confidence: 82%

📊 Evidence:
• Log Pattern: High frequency of connection timeout errors
  Source: datadog (90% confidence)
• Metric Anomaly: Database connection utilization at 95%
  Source: datadog (85% confidence)

🔍 Similar Incidents: 1 found
• Checkout service database connection issues
  Similarity: 91%
  Explanation: Similar incident 14 days ago...

💡 Recommendations:
• Restart checkout-service (high priority)
  Risk: low | Time: 5min

[🔄 Restart Service] [📖 View Runbook] [🔍 Full Analysis]

⏱️ Analysis completed in 23.5s | 📊 15,420 data points analyzed
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Bot user OAuth token | Required |
| `SLACK_SIGNING_SECRET` | Signing secret for verification | Required |
| `SLACK_APP_TOKEN` | App-level token for Socket Mode | Required |
| `API_GATEWAY_URL` | OpsSage API Gateway URL | `http://localhost:3000` |
| `PORT` | Bot server port | `3004` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

### Advanced Configuration

#### Custom Service Detection
The bot automatically detects services from queries. Default services:
- `checkout-service`
- `payment-service`
- `user-service`
- `api-gateway`

#### Analysis Time Range
Default analysis window: 24 hours
Can be customized per query in future versions.

#### Response Formatting
- Max similar incidents: 2
- Max recommendations: 3
- Max evidence items: 3

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t opssage-slack-bot .

# Run container
docker run -d \
  --name opssage-slack-bot \
  -p 3004:3004 \
  --env-file .env \
  opssage-slack-bot
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opssage-slack-bot
spec:
  replicas: 2
  selector:
    matchLabels:
      app: opssage-slack-bot
  template:
    metadata:
      labels:
        app: opssage-slack-bot
    spec:
      containers:
      - name: slack-bot
        image: opssage-slack-bot:latest
        ports:
        - containerPort: 3004
        env:
        - name: SLACK_BOT_TOKEN
          valueFrom:
            secretKeyRef:
              name: opssage-secrets
              key: slack-bot-token
        - name: SLACK_SIGNING_SECRET
          valueFrom:
            secretKeyRef:
              name: opssage-secrets
              key: slack-signing-secret
        - name: API_GATEWAY_URL
          value: "http://api-gateway:3000"
```

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:3004/api/v1/slack-bot/health
```

### Logs
```bash
# Development
npm run start:dev

# Production logs
docker logs opssage-slack-bot
```

### Metrics
The bot exposes health endpoints for monitoring:
- `/api/v1/slack-bot/health` - Service health status
- Structured logging with Winston
- Error tracking and alerting

## 🛡️ Security

### Token Security
- Store Slack tokens in environment variables
- Use Kubernetes secrets in production
- Rotate tokens regularly
- Monitor token usage

### Request Validation
- Slack signature verification
- Request timeout handling
- Rate limiting (built into Slack)
- Input sanitization

### Data Privacy
- No PII storage in bot
- Optional Redis for session data
- Audit logging for all actions
- GDPR compliance considerations

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:e2e
```

### Manual Testing
1. Test all slash commands
2. Verify mention responses
3. Test interactive buttons
4. Check error handling

## 🔄 Updates and Maintenance

### Version Updates
```bash
# Update dependencies
npm update

# Rebuild
npm run build

# Restart service
npm run start:prod
```

### Bot Maintenance
- Monitor Slack API rate limits
- Update command help text
- Add new analysis features
- Performance optimization

## 🐛 Troubleshooting

### Common Issues

#### Bot Not Responding
- Check Slack bot token validity
- Verify event subscriptions
- Check server logs
- Ensure correct request URLs

#### Commands Not Working
- Verify slash command configuration
- Check request URL matches
- Validate bot permissions
- Check CORS settings

#### Analysis Errors
- Verify API Gateway connectivity
- Check backend service health
- Validate API key configuration
- Check network connectivity

### Debug Mode
```bash
LOG_LEVEL=debug npm run start:dev
```

## 📚 API Reference

### Webhook Endpoints
- `POST /api/v1/slack-bot/events` - Slack events and commands
- `POST /api/v1/slack-bot/interactive` - Interactive components
- `GET /api/v1/slack-bot/health` - Health check

### WebSocket Events
- `analysis-result` - Real-time analysis updates
- `incident-update` - Incident status changes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request
5. Update documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support:
- Create an issue in the repository
- Check the troubleshooting guide
- Review Slack API documentation
- Contact the OpsSage team
