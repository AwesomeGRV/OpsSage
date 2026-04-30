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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OpsSage</h1>
                <p className="text-xs text-gray-400">AI-Powered Operations</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">System Status</h3>
              <div className="flex items-center space-x-2 text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-500 pulse-dot online" />
                <span className="text-sm">All Systems Operational</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Key Metrics</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">MTTR</span>
                    <span className="text-lg font-bold text-white">{mockMetrics.mttr.current}m</span>
                  </div>
                  <div className="text-xs text-green-400 mt-1">↓ {mockMetrics.mttr.improvement}%</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Incidents</span>
                    <span className="text-lg font-bold text-white">{mockMetrics.incidents.today}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{mockMetrics.incidents.week} this week</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Uptime</span>
                    <span className="text-lg font-bold text-white">{mockMetrics.uptime.overall}%</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
                </div>
              </div>
            </div>

            {/* Service Health */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Service Health</h3>
              <div className="space-y-3">
                {mockServices.map((service) => (
                  <div key={service.name} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{service.name}</span>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(service.status)} pulse-dot ${service.status}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-400">CPU: <span className={service.cpu > 80 ? 'text-red-400' : service.cpu > 60 ? 'text-yellow-400' : 'text-green-400'}>{service.cpu}%</span></div>
                      <div className="text-gray-400">Mem: <span className={service.memory > 80 ? 'text-red-400' : service.memory > 60 ? 'text-yellow-400' : 'text-green-400'}>{service.memory}%</span></div>
                      <div className="text-gray-400">Err: <span className={service.errors > 5 ? 'text-red-400' : service.errors > 1 ? 'text-yellow-400' : 'text-green-400'}>{service.errors}%</span></div>
                      <div className="text-gray-400">Req: <span className="text-gray-300">{formatNumber(service.requests)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10">
            <Button className="w-full gradient-bg text-white hover-lift">
              <Zap className="mr-2 h-4 w-4" />
              Analyze Incident
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                  <p className="text-gray-400">Real-time system monitoring and incident management</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Activity className="mr-2 h-4 w-4" />
                    System Status
                  </Button>
                  <Button className="gradient-bg text-white hover-lift">
                    <Brain className="mr-2 h-4 w-4" />
                    AI Analysis
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Incidents */}
              <Card className="glass-morphism-dark border-0 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Target className="h-5 w-5 text-blue-400" />
                        <span>Recent Incidents</span>
                      </CardTitle>
                      <CardDescription className="text-gray-400">Latest incidents detected by AI analysis</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover-lift cursor-pointer"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`h-3 w-3 rounded-full ${getStatusColor(incident.status)} pulse-dot ${incident.status}`} />
                          <div>
                            <div className="font-semibold text-white">{incident.title}</div>
                            <div className="text-sm text-gray-400">
                              {incident.service} • {incident.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1 border-white/20 text-white">
                            <Brain className="h-3 w-3" />
                            <span>{incident.confidence}%</span>
                          </Badge>
                          <div className="text-sm text-gray-400">
                            {incident.assignee}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis Insights */}
              <Card className="glass-morphism-dark border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span>AI Analysis Insights</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">Recent AI-powered incident analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">Root Cause Detection</h4>
                      <div className="text-2xl font-bold text-blue-400 mb-1">91%</div>
                      <p className="text-sm text-gray-400">Accuracy rate</p>
                    </div>
                    
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">Similar Incidents Found</h4>
                      <div className="text-2xl font-bold text-green-400 mb-1">24</div>
                      <p className="text-sm text-gray-400">In last 7 days</p>
                    </div>
                    
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-3">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">Automated Resolutions</h4>
                      <div className="text-2xl font-bold text-purple-400 mb-1">67%</div>
                      <p className="text-sm text-gray-400">Auto-fix success rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="glass-morphism-dark border-0 shadow-2xl mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Activity className="h-5 w-5 text-green-400" />
                  <span>Performance Metrics</span>
                </CardTitle>
                <CardDescription className="text-gray-400">System performance and response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-3xl font-bold text-white mb-2">{formatDuration(mockMetrics.performance.avgResponseTime)}</div>
                    <p className="text-sm text-gray-400">Average Response Time</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-3xl font-bold text-white mb-2">{formatNumber(mockMetrics.performance.throughput)}</div>
                    <p className="text-sm text-gray-400">Requests per Second</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-3xl font-bold text-white mb-2">{mockMetrics.performance.errorRate}%</div>
                    <p className="text-sm text-gray-400">Error Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
