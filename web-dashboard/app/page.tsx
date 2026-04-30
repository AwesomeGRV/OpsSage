'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  Globe, 
  Server, 
  TrendingDown, 
  TrendingUp,
  Users,
  Zap,
  Sparkles,
  BarChart3,
  Shield,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Bot,
  Command,
  Search
} from 'lucide-react'

// Mock data for demonstration
const mockIncidents = [
  {
    id: 'INC-001',
    title: 'Database connection pool exhaustion',
    severity: 'high',
    status: 'investigating',
    service: 'checkout-service',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    assignee: 'John Doe',
    confidence: 87,
    trend: 'increasing'
  },
  {
    id: 'INC-002', 
    title: 'API gateway latency spike',
    severity: 'medium',
    status: 'resolved',
    service: 'api-gateway',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    assignee: 'Jane Smith',
    confidence: 92,
    trend: 'decreasing'
  },
  {
    id: 'INC-003',
    title: 'Memory leak in payment service',
    severity: 'critical',
    status: 'active',
    service: 'payment-service',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    assignee: 'Mike Johnson',
    confidence: 94,
    trend: 'stable'
  }
]

const mockServices = [
  {
    name: 'api-gateway',
    status: 'healthy',
    cpu: 45,
    memory: 67,
    requests: 12543,
    errors: 0.2,
    uptime: 99.9,
    responseTime: 145
  },
  {
    name: 'checkout-service',
    status: 'warning',
    cpu: 78,
    memory: 89,
    requests: 8234,
    errors: 2.1,
    uptime: 98.5,
    responseTime: 234
  },
  {
    name: 'payment-service',
    status: 'critical',
    cpu: 92,
    memory: 95,
    requests: 5678,
    errors: 8.7,
    uptime: 95.2,
    responseTime: 456
  },
  {
    name: 'user-service',
    status: 'healthy',
    cpu: 32,
    memory: 54,
    requests: 15432,
    errors: 0.1,
    uptime: 99.8,
    responseTime: 98
  }
]

const mockMetrics = {
  mttr: {
    current: 12.5,
    previous: 45.2,
    improvement: 72.3,
    trend: 'down'
  },
  incidents: {
    today: 8,
    week: 47,
    month: 189,
    trend: 'up'
  },
  uptime: {
    overall: 99.7,
    services: {
      'api-gateway': 99.9,
      'checkout-service': 98.5,
      'payment-service': 95.2,
      'user-service': 99.8
    }
  },
  performance: {
    avgResponseTime: 145,
    throughput: 12543,
    errorRate: 1.2,
    trend: 'stable'
  }
}

export default function Dashboard() {
  const [selectedIncident, setSelectedIncident] = useState(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      case 'investigating': return 'bg-blue-500'
      case 'active': return 'bg-red-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case 'increasing': return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'decreasing': return <ArrowDownRight className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">OpsSage</h1>
                    <p className="text-xs text-gray-600">AI-Powered Incident Management</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 pulse-dot online" />
                  <span>All Systems Operational</span>
                </div>
                <Button className="gradient-bg text-white hover-lift">
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Incident
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="metric-card card-hover group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">MTTR</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{mockMetrics.mttr.current}</span>
                    <span className="text-sm text-gray-500">min</span>
                    {getTrendIcon(mockMetrics.mttr.trend)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {mockMetrics.mttr.improvement}% improvement
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="metric-card card-hover group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Incidents</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{mockMetrics.incidents.today}</span>
                    {getTrendIcon(mockMetrics.incidents.trend)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {mockMetrics.incidents.week} this week
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="metric-card card-hover group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{mockMetrics.uptime.overall}</span>
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="metric-card card-hover group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{formatDuration(mockMetrics.performance.avgResponseTime)}</span>
                    {getTrendIcon(mockMetrics.performance.trend)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(mockMetrics.performance.throughput)} req/s
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Incidents */}
            <div className="lg:col-span-2">
              <Card className="glass-morphism border-0 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span>Recent Incidents</span>
                      </CardTitle>
                      <CardDescription>Latest incidents detected by AI analysis</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover-lift cursor-pointer"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`h-3 w-3 rounded-full ${getStatusColor(incident.status)} pulse-dot ${incident.status}`} />
                          <div>
                            <div className="font-semibold text-gray-900">{incident.title}</div>
                            <div className="text-sm text-gray-600">
                              {incident.service} • {incident.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Brain className="h-3 w-3" />
                            <span>{incident.confidence}%</span>
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {incident.assignee}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Health */}
            <div>
              <Card className="glass-morphism border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-green-600" />
                    <span>Service Health</span>
                  </CardTitle>
                  <CardDescription>Real-time service status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockServices.map((service) => (
                      <div key={service.name} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 w-2 rounded-full ${getStatusColor(service.status)} pulse-dot ${service.status}`} />
                            <span className="font-medium text-gray-900">{service.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{service.uptime}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <Cpu className="h-3 w-3 text-gray-500" />
                            <span className={service.cpu > 80 ? 'text-red-600' : service.cpu > 60 ? 'text-yellow-600' : 'text-green-600'}>
                              CPU: {service.cpu}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Database className="h-3 w-3 text-gray-500" />
                            <span className={service.memory > 80 ? 'text-red-600' : service.memory > 60 ? 'text-yellow-600' : 'text-green-600'}>
                              Mem: {service.memory}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-gray-500" />
                            <span className={service.errors > 5 ? 'text-red-600' : service.errors > 1 ? 'text-yellow-600' : 'text-green-600'}>
                              Err: {service.errors}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">
                              {formatNumber(service.requests)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Analysis Section */}
          <Card className="glass-morphism border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>AI Analysis Insights</span>
              </CardTitle>
              <CardDescription>Recent AI-powered incident analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Root Cause Detection</h4>
                  <div className="text-2xl font-bold text-blue-600 mb-1">91%</div>
                  <p className="text-sm text-gray-600">Accuracy rate</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Similar Incidents Found</h4>
                  <div className="text-2xl font-bold text-green-600 mb-1">24</div>
                  <p className="text-sm text-gray-600">In last 7 days</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                  <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-3">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Automated Resolutions</h4>
                  <div className="text-2xl font-bold text-purple-600 mb-1">67%</div>
                  <p className="text-sm text-gray-600">Auto-fix success rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
