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
    <div className="min-h-screen bg-slate-950">
      {/* Modern Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.blue.500/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.purple.500/0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* Modern Sidebar Layout */}
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">OpsSage</h1>
                  <p className="text-xs text-slate-400">Enterprise Platform</p>
                </div>
              </div>
            </div>

            <nav className="px-4 pb-6">
              <div className="space-y-1">
                <button className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600/20 rounded-lg border border-blue-500/30">
                  Dashboard
                </button>
                <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                  Infrastructure
                </button>
                <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                  Monitoring
                </button>
                <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                  Security
                </button>
                <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                  Analytics
                </button>
              </div>
            </nav>

            <div className="px-4 pb-6 mt-auto">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-slate-300">System Status</span>
                </div>
                <div className="text-lg font-semibold text-white">Operational</div>
                <div className="text-xs text-slate-400">All services running</div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {/* Top Header */}
            <header className="bg-slate-900/30 backdrop-blur-xl border-b border-slate-800/50">
              <div className="px-8 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                    <p className="text-sm text-slate-400">Real-time system monitoring and insights</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Last 24h</span>
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Server className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-xs text-green-400 font-medium">+12.5%</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">247</div>
                  <div className="text-sm text-slate-400">Active Servers</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <span className="text-xs text-green-400 font-medium">+8.2%</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">99.97%</div>
                  <div className="text-sm text-slate-400">Uptime</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-xs text-red-400 font-medium">-3.1%</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">1.2M</div>
                  <div className="text-sm text-slate-400">Requests/min</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="text-xs text-red-400 font-medium">+2</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">8</div>
                  <div className="text-sm text-slate-400">Active Alerts</div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors">1D</button>
                      <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600/20 rounded border border-blue-500/30">1W</button>
                      <button className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors">1M</button>
                    </div>
                  </div>
                  
                  <div className="h-64 bg-slate-800/30 rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <div className="text-slate-400 text-sm">Performance Chart</div>
                      <div className="text-slate-500 text-xs">Real-time metrics visualization</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Avg Response</div>
                      <div className="text-lg font-semibold text-white">145ms</div>
                      <div className="text-xs text-green-400">↓ 15%</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Error Rate</div>
                      <div className="text-lg font-semibold text-white">0.12%</div>
                      <div className="text-xs text-red-400">↑ 0.3%</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Throughput</div>
                      <div className="text-lg font-semibold text-white">12.5K/s</div>
                      <div className="text-xs text-green-400">↑ 8%</div>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Status */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Infrastructure</h3>
                    <button className="text-sm text-slate-400 hover:text-white">View All →</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Cloud className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Cloud Services</div>
                          <div className="text-xs text-slate-400">AWS, GCP, Azure</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-400">Healthy</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Database className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Databases</div>
                          <div className="text-xs text-slate-400">PostgreSQL, Redis</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-400">Healthy</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Network className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Network</div>
                          <div className="text-xs text-slate-400">Global CDN</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-xs text-yellow-400">Warning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Service Health */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Service Health</h3>
                    <button className="text-sm text-slate-400 hover:text-white">View All →</button>
                  </div>
                  
                  <div className="space-y-3">
                    {mockServices.map((service) => (
                      <div key={service.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`h-2 w-2 rounded-full ${
                            service.status === 'healthy' ? 'bg-green-500' : 
                            service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm font-medium text-white">{service.name}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span>CPU: {service.cpu}%</span>
                          <span>Mem: {service.memory}%</span>
                          <span>{service.uptime}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <button className="text-sm text-slate-400 hover:text-white">View All →</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">Deployment successful</div>
                        <div className="text-xs text-slate-400">API Gateway v2.3.1 deployed</div>
                        <div className="text-xs text-slate-500 mt-1">2 minutes ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">High memory usage</div>
                        <div className="text-xs text-slate-400">Payment Service using 85% memory</div>
                        <div className="text-xs text-slate-500 mt-1">15 minutes ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <RefreshCw className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">Auto-scaling triggered</div>
                        <div className="text-xs text-slate-400">Added 2 instances to checkout service</div>
                        <div className="text-xs text-slate-500 mt-1">1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
