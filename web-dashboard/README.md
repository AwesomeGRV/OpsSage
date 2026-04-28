# OpsSage Web Dashboard

A comprehensive, modern web dashboard for the OpsSage AI-powered incident management system. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Core Dashboard
- **Real-time Incident Monitoring** - Live incident status and updates
- **Service Health Overview** - Comprehensive service metrics and health status
- **AI-Powered Analysis** - Intelligent incident analysis with confidence scoring
- **Interactive Visualizations** - Charts and graphs for system metrics

### Key Components
- **Incident Management** - Create, track, and resolve incidents
- **Service Health Monitoring** - Real-time service status and performance metrics
- **AI Analysis Engine** - Natural language incident analysis
- **Similar Incident Detection** - Vector similarity search for historical incidents
- **Automated Recommendations** - AI-generated remediation suggestions

### Technical Features
- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **TypeScript Support** - Full type safety and IntelliSense
- **Component-Based Architecture** - Reusable UI components
- **Real-time Updates** - WebSocket support for live data
- **Dark Mode Support** - Built-in theme switching

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd opsSage/web-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
web-dashboard/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── IncidentDetail.tsx     # Incident detail modal
│   ├── IncidentAnalysis.tsx    # AI analysis component
│   └── ServiceHealthChart.tsx  # Service health visualization
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── next.config.js        # Next.js configuration
```

## Components

### IncidentDetail
A comprehensive modal component for displaying detailed incident information including:
- Root cause analysis
- Evidence correlation
- AI recommendations
- Similar incidents
- Historical timeline

### IncidentAnalysis
AI-powered incident analysis component featuring:
- Natural language query input
- Real-time analysis processing
- Confidence scoring
- Evidence visualization
- Automated recommendations

### ServiceHealthChart
Real-time service health monitoring with:
- CPU and memory usage
- Error rates and response times
- Uptime metrics
- Status indicators
- Performance trends

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### API Integration

The dashboard integrates with the OpsSage backend APIs:

- **Incident Management** - `/api/incidents`
- **Service Health** - `/api/services/health`
- **AI Analysis** - `/api/analysis`
- **WebSocket** - Real-time updates

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint          # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Styling

The dashboard uses Tailwind CSS with a custom design system:
- **Color Palette** - Professional blue/gray theme
- **Typography** - Clean, readable font hierarchy
- **Spacing** - Consistent spacing system
- **Components** - Reusable UI patterns

### Component Development

When creating new components:

1. Use TypeScript for type safety
2. Follow the existing component structure
3. Use Tailwind CSS for styling
4. Include proper accessibility attributes
5. Add responsive design considerations

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration

- **Development** - Local development with hot reload
- **Staging** - Pre-production testing environment
- **Production** - Optimized production build

## Performance

### Optimization Features
- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js image optimization
- **Caching** - Intelligent caching strategies
- **Bundle Analysis** - Optimized bundle sizes

### Monitoring
- **Performance Metrics** - Response times and throughput
- **Error Tracking** - Comprehensive error monitoring
- **User Analytics** - Usage patterns and insights

## Security

### Security Features
- **Input Validation** - Client and server-side validation
- **XSS Protection** - Built-in XSS prevention
- **CSRF Protection** - Cross-site request forgery protection
- **Authentication** - Secure user authentication

### Best Practices
- **Environment Variables** - Secure configuration management
- **API Security** - Rate limiting and authentication
- **Data Privacy** - User data protection measures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team
