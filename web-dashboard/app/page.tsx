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
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:border-blue-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                        <Server className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center text-green-400 font-bold text-sm">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        12.5%
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">247</div>
                    <div className="text-sm text-slate-300 font-medium">Active Servers</div>
                    <div className="mt-4 h-12">
                      <div className="flex items-end justify-between h-full">
                        {[40, 65, 45, 80, 60, 90, 75, 85].map((height, index) => (
                          <div key={index} className="w-2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:border-green-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center text-green-400 font-bold text-sm">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        8.2%
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">99.97%</div>
                    <div className="text-sm text-slate-300 font-medium">System Uptime</div>
                    <div className="mt-4 flex items-center space-x-1">
                      <div className="h-2 flex-1 bg-green-500 rounded-full" />
                      <div className="h-2 flex-1 bg-green-500 rounded-full" />
                      <div className="h-2 flex-1 bg-green-500 rounded-full" />
                      <div className="h-2 flex-1 bg-green-500 rounded-full" />
                      <div className="h-2 w-1 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center text-red-400 font-bold text-sm">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        3.1%
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">1.2M</div>
                    <div className="text-sm text-slate-300 font-medium">Requests/min</div>
                    <div className="mt-4 h-12">
                      <div className="flex items-center justify-center h-full">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full border-4 border-purple-500/30" />
                          <div className="absolute inset-0 h-10 w-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 hover:border-orange-400/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center text-red-400 font-bold text-sm">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        2
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">8</div>
                    <div className="text-sm text-slate-300 font-medium">Active Alerts</div>
                    <div className="mt-4 flex items-center justify-center">
                      <div className="relative">
                        <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                        <div className="absolute inset-0 h-3 w-3 rounded-full bg-orange-500 animate-ping" />
                      </div>
                    </div>
                  </div>
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
                  
                  <div className="h-64 bg-slate-800/30 rounded-lg p-4 mb-6">
                    <div className="h-full flex items-end justify-between">
                      {[30, 45, 35, 50, 40, 60, 45, 55, 40, 65, 50, 70].map((height, index) => (
                        <div key={index} className="flex-1 mx-0.5">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
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
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All →</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                            <Cloud className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">Cloud Services</div>
                            <div className="text-xs text-slate-400">AWS, GCP, Azure</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xs text-slate-400">Load</div>
                            <div className="text-sm font-medium text-white">67%</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                            <span className="text-xs text-green-400 font-medium">Healthy</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-green-500/20 hover:border-green-400/40 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                            <Database className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">Databases</div>
                            <div className="text-xs text-slate-400">PostgreSQL, Redis</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xs text-slate-400">Load</div>
                            <div className="text-sm font-medium text-white">42%</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                            <span className="text-xs text-green-400 font-medium">Healthy</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                            <Network className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">Network</div>
                            <div className="text-xs text-slate-400">Global CDN</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xs text-slate-400">Load</div>
                            <div className="text-sm font-medium text-white">89%</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50" />
                            <span className="text-xs text-yellow-400 font-medium">Warning</span>
                          </div>
                        </div>
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
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All →</button>
                  </div>
                  
                  <div className="space-y-3">
                    {mockServices.map((service) => (
                      <div key={service.name} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className={`h-3 w-3 rounded-full ${
                              service.status === 'healthy' ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 
                              service.status === 'warning' ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50' : 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                            }`} />
                            <div>
                              <div className="text-sm font-semibold text-white">{service.name}</div>
                              <div className="text-xs text-slate-400">Service Status</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="text-xs text-slate-400">CPU</div>
                              <div className="text-sm font-medium text-white">{service.cpu}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-400">Memory</div>
                              <div className="text-sm font-medium text-white">{service.memory}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-400">Uptime</div>
                              <div className="text-sm font-medium text-white">{service.uptime}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All →</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-start space-x-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">Deployment successful</div>
                          <div className="text-xs text-slate-400">API Gateway v2.3.1 deployed to production</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-green-400 font-medium">Success</span>
                            <span className="text-xs text-slate-500">2 minutes ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-start space-x-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all">
                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg shadow-yellow-500/25">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">High memory usage detected</div>
                          <div className="text-xs text-slate-400">Payment Service using 85% memory capacity</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-yellow-400 font-medium">Warning</span>
                            <span className="text-xs text-slate-500">15 minutes ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-start space-x-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                          <RefreshCw className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">Auto-scaling triggered</div>
                          <div className="text-xs text-slate-400">Added 2 instances to checkout service cluster</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-blue-400 font-medium">Info</span>
                            <span className="text-xs text-slate-500">1 hour ago</span>
                          </div>
                        </div>
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
