'use client'

import { useState, useEffect } from 'react'
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
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ZapOff,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  Layers,
  Network,
  Cloud,
  Terminal,
  Code,
  GitBranch,
  Package,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  Filter,
  Calendar,
  MapPin,
  Globe2,
  Router,
  ServerCog,
  DatabaseBackup,
  MemoryStick
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

// Chart data
const performanceData = [120, 135, 125, 145, 160, 155, 145, 150, 140, 145, 152, 145]
const incidentData = [5, 8, 6, 9, 7, 12, 8, 10, 6, 8, 9, 8]
const requestData = [10000, 12000, 11000, 13000, 12500, 14000, 13500, 14500, 13000, 12543, 13800, 14500]
const serviceDistribution = [35, 25, 20, 20] // API Gateway, Checkout, Payment, User services

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
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">OpsSage</h1>
                    <p className="text-xs text-gray-400">Enterprise Operations Platform</p>
                  </div>
                </div>
                
                <nav className="hidden md:flex items-center space-x-6">
                  <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600/20 rounded-lg border border-blue-500/30">Dashboard</button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Infrastructure</button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Monitoring</button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Security</button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Analytics</button>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Operational</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <Search className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors relative">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <Settings className="h-4 w-4 text-gray-400" />
                </button>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Infrastructure Overview</h2>
              <p className="text-gray-400">Real-time monitoring and system performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Last 24h</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Server className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-xs text-green-400 font-medium">+12.5%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">247</div>
              <div className="text-sm text-gray-400">Active Servers</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Activity className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-xs text-green-400 font-medium">+8.2%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">99.97%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-xs text-red-400 font-medium">-3.1%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">1.2M</div>
              <div className="text-sm text-gray-400">Requests/min</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-xs text-red-400 font-medium">+2</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">8</div>
              <div className="text-sm text-gray-400">Active Alerts</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Infrastructure Map */}
            <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Infrastructure Map</h3>
                <button className="text-sm text-gray-400 hover:text-white">View Details →</button>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-8 mb-6">
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto mb-3 bg-blue-600/20 rounded-xl flex items-center justify-center">
                      <Cloud className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="text-sm font-medium text-white">Cloud Infrastructure</div>
                    <div className="text-xs text-gray-400">AWS, GCP, Azure</div>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto mb-3 bg-green-600/20 rounded-xl flex items-center justify-center">
                      <Network className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="text-sm font-medium text-white">Network</div>
                    <div className="text-xs text-gray-400">Global CDN</div>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto mb-3 bg-purple-600/20 rounded-xl flex items-center justify-center">
                      <Database className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="text-sm font-medium text-white">Databases</div>
                    <div className="text-xs text-gray-400">PostgreSQL, Redis</div>
                  </div>
                </div>
              </div>

              {/* Service Health */}
              <div>
                <h4 className="text-sm font-medium text-white mb-4">Service Health</h4>
                <div className="space-y-3">
                  {mockServices.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${
                          service.status === 'healthy' ? 'bg-green-500' : 
                          service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm text-white">{service.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-gray-400">CPU: {service.cpu}%</span>
                        <span className="text-gray-400">Mem: {service.memory}%</span>
                        <span className="text-gray-400">{service.uptime}% uptime</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
                <button className="text-sm text-gray-400 hover:text-white">View All →</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Deployment successful</div>
                    <div className="text-xs text-gray-400">api-gateway v2.3.1 deployed</div>
                    <div className="text-xs text-gray-500 mt-1">2 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-600/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">High memory usage</div>
                    <div className="text-xs text-gray-400">payment-service using 85% memory</div>
                    <div className="text-xs text-gray-500 mt-1">15 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <RefreshCw className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Auto-scaling triggered</div>
                    <div className="text-xs text-gray-400">Added 2 instances to checkout-service</div>
                    <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Brain className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">AI anomaly detected</div>
                    <div className="text-xs text-gray-400">Unusual traffic pattern in user-service</div>
                    <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
                <select className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1 border border-gray-700">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Response Time</span>
                  <span className="text-sm text-white font-medium">145ms</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-green-500 rounded-full" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Error Rate</span>
                  <span className="text-sm text-white font-medium">0.12%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-1/12 bg-yellow-500 rounded-full" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Throughput</span>
                  <span className="text-sm text-white font-medium">12.5K req/s</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-5/6 bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
                <button className="text-sm text-gray-400 hover:text-white">View All →</button>
              </div>
              
              <div className="space-y-3">
                {mockIncidents.slice(0, 3).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${
                        incident.severity === 'critical' ? 'bg-red-500' : 
                        incident.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="text-sm text-white">{incident.title}</div>
                        <div className="text-xs text-gray-400">{incident.service}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white">{incident.assignee}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
