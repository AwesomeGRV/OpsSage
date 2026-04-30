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
  Search,
  Wifi,
  HardDrive,
  Monitor,
  Settings,
  Bell,
  User,
  ChevronRight,
  PieChart,
  LineChart,
  ZapOff,
  AlertCircle,
  TrendingUp as TrendingUpIcon
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      </div>
      
      <div className="relative z-10">
        {/* Top Navigation Bar */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">OpsSage</h1>
                    <p className="text-xs text-gray-400">Intelligent Operations Platform</p>
                  </div>
                </div>
                
                <nav className="hidden md:flex items-center space-x-6">
                  <button className="text-white font-medium hover:text-blue-400 transition-colors">Dashboard</button>
                  <button className="text-gray-400 hover:text-white transition-colors">Incidents</button>
                  <button className="text-gray-400 hover:text-white transition-colors">Services</button>
                  <button className="text-gray-400 hover:text-white transition-colors">Analytics</button>
                  <button className="text-gray-400 hover:text-white transition-colors">Settings</button>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <div className="h-2 w-2 rounded-full bg-green-500 pulse-dot online" />
                  <span className="text-sm text-green-400">Operational</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Bell className="h-5 w-5 text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Settings className="h-5 w-5 text-gray-400" />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="p-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/30 p-6 hover-lift">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-blue-500/20 blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    12%
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{formatNumber(mockMetrics.performance.throughput)}</div>
                <div className="text-sm text-gray-400">Requests/sec</div>
                <div className="mt-3 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl border border-green-500/30 p-6 hover-lift">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-green-500/20 blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    0.3%
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{mockMetrics.uptime.overall}%</div>
                <div className="text-sm text-gray-400">Uptime</div>
                <div className="mt-3 h-1 bg-green-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-[99.7%] bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl border border-purple-500/30 p-6 hover-lift">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-purple-500/20 blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Clock className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    28%
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{mockMetrics.mttr.current}m</div>
                <div className="text-sm text-gray-400">MTTR</div>
                <div className="mt-3 h-1 bg-purple-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-xl border border-orange-500/30 p-6 hover-lift">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-orange-500/20 blur-xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <AlertTriangle className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="flex items-center text-red-400 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    15%
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{mockMetrics.incidents.today}</div>
                <div className="text-sm text-gray-400">Active Incidents</div>
                <div className="mt-3 h-1 bg-orange-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Service Status Grid */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Health Overview */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Service Health</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {mockServices.map((service) => (
                    <div key={service.name} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`h-3 w-3 rounded-full ${getStatusColor(service.status)} pulse-dot ${service.status}`} />
                          <span className="font-medium text-white">{service.name}</span>
                        </div>
                        <span className="text-sm text-gray-400">{service.uptime}%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">CPU</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  service.cpu > 80 ? 'bg-red-500' : 
                                  service.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${service.cpu}%` }}
                              />
                            </div>
                            <span className="text-gray-300">{service.cpu}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Memory</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  service.memory > 80 ? 'bg-red-500' : 
                                  service.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${service.memory}%` }}
                              />
                            </div>
                            <span className="text-gray-300">{service.memory}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Requests</span>
                          <span className="text-gray-300">{formatNumber(service.requests)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Incidents */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Incidents</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {mockIncidents.map((incident) => (
                    <div key={incident.id} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`h-3 w-3 rounded-full ${getStatusColor(incident.status)} pulse-dot ${incident.status} mt-1`} />
                          <div>
                            <div className="font-medium text-white mb-1">{incident.title}</div>
                            <div className="text-sm text-gray-400 mb-2">{incident.service} • {incident.id}</div>
                            <div className="flex items-center space-x-3">
                              <Badge className={`border ${getSeverityColor(incident.severity)}`}>
                                {incident.severity}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-gray-400">
                                <Brain className="h-3 w-3" />
                                <span>{incident.confidence}% confidence</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{incident.assignee}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(incident.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">AI Insights</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/30">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-400 mb-1">91%</div>
                    <div className="text-sm text-gray-400">Detection Accuracy</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/30">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-1">24</div>
                    <div className="text-sm text-gray-400">Similar Incidents</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30">
                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-3">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-purple-400 mb-1">67%</div>
                    <div className="text-sm text-gray-400">Auto-Fix Rate</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Run AI Analysis</span>
                  </button>
                  
                  <button className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Create Incident</span>
                  </button>
                  
                  <button className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>View Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
