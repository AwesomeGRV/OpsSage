# OpsSage - Intelligent Incident Copilot

## Overview

OpsSage is an AI-powered incident management assistant that reduces MTTR by automatically analyzing logs, metrics, and traces to provide real-time root cause analysis and actionable recommendations during incidents.

## Core Features

- **ChatOps Interface**: Slack & Microsoft Teams integration
- **Multi-Source Data Aggregation**: Datadog, Kubernetes, PagerDuty, CI/CD
- **AI-Powered Analysis**: Root cause detection with confidence scores
- **Incident Memory**: Vector database for similar incident detection
- **Runbook Recommendations**: Automated fix suggestions
- **Timeline Builder**: Auto-generated incident timelines
- **Enterprise Security**: RBAC, audit logs, data masking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Slack/Teams   │    │   Web Dashboard │    │   Mobile App    │
│     Bot         │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      API Gateway          │
                    │   (Authentication,        │
                    │    Rate Limiting,         │
                    │     Routing)              │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   Incident        │  │   Data Collection │  │   AI Intelligence │
│   Analysis        │  │   Service         │  │   Engine          │
│   Service         │  │                   │  │                   │
└─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   Knowledge Base          │
                    │   (Vector DB + PostgreSQL)│
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   Datadog         │  │   Kubernetes     │  │   PagerDuty       │
│   API             │  │   API            │  │   API             │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

## Tech Stack

**Backend**: Node.js with NestJS framework
**AI Layer**: OpenAI/Azure OpenAI with RAG architecture
**Vector DB**: Pinecone/Weaviate for embeddings
**Database**: PostgreSQL for metadata, Redis for caching
**Infrastructure**: Kubernetes with Helm charts
**Messaging**: Slack API & Microsoft Teams Bot Framework
**Monitoring**: Prometheus + Grafana
**Security**: OAuth 2.0, RBAC, audit logging

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/opssage.git
cd opssage

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

## Documentation

- [High-Level Architecture](./docs/architecture/high-level.md)
- [Low-Level Design](./docs/architecture/low-level.md)
- [API Documentation](./docs/api/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Integration Examples](./docs/integrations/README.md)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
