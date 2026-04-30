'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, BarChart, PieChart } from '@/components/Chart'
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
    <div className="min-h-screen bg-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-purple-950 to-gray-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">OpsSage</h1>
                    <p className="text-sm text-gray-400">Real-time System Monitoring</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">All Systems Operational</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <Bell className="h-5 w-5 text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <Settings className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="font-medium">12.5%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{formatNumber(mockMetrics.performance.throughput)}</div>
              <div className="text-sm text-gray-400 mb-4">Requests per Second</div>
              <LineChart data={requestData.slice(-8)} color="#3B82F6" height={60} />
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="font-medium">0.2%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{mockMetrics.uptime.overall}%</div>
              <div className="text-sm text-gray-400 mb-4">System Uptime</div>
              <div className="h-16 flex items-end justify-between">
                {[99.9, 99.8, 99.7, 99.9, 99.8, 99.7, 99.9, 99.7].map((value, index) => (
                  <div key={index} className="w-8 bg-green-500/20 rounded-t" style={{ height: `${(value - 99) * 100}%` }} />
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Clock className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span className="font-medium">-28%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{mockMetrics.mttr.current}m</div>
              <div className="text-sm text-gray-400 mb-4">Mean Time to Recovery</div>
              <LineChart data={[45, 42, 38, 35, 30, 25, 20, 12.5]} color="#A855F7" height={60} />
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <div className="flex items-center text-red-400 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="font-medium">+15%</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{mockMetrics.incidents.today}</div>
              <div className="text-sm text-gray-400 mb-4">Active Incidents</div>
              <BarChart data={incidentData} color="#F97316" height={60} />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Performance Trends</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">1D</button>
                  <button className="px-3 py-1 text-sm rounded-lg text-gray-400 hover:bg-gray-800">1W</button>
                  <button className="px-3 py-1 text-sm rounded-lg text-gray-400 hover:bg-gray-800">1M</button>
                </div>
              </div>
              <LineChart data={performanceData} color="#3B82F6" height={200} />
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <div className="text-sm text-gray-400">Avg Response</div>
                  <div className="text-lg font-bold text-white">{formatDuration(mockMetrics.performance.avgResponseTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Peak Load</div>
                  <div className="text-lg font-bold text-white">16.2K req/s</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Error Rate</div>
                  <div className="text-lg font-bold text-white">{mockMetrics.performance.errorRate}%</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Service Distribution</h3>
                <PieChartIcon className="h-5 w-5 text-gray-400" />
              </div>
              <PieChart data={serviceDistribution} colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']} height={200} />
              <div className="space-y-2 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-400">API Gateway</span>
                  </div>
                  <span className="text-sm text-white font-medium">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-400">Checkout</span>
                  </div>
                  <span className="text-sm text-white font-medium">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-400">Payment</span>
                  </div>
                  <span className="text-sm text-white font-medium">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-400">User Service</span>
                  </div>
                  <span className="text-sm text-white font-medium">20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services and Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Service Health</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
              </div>
              <div className="space-y-4">
                {mockServices.map((service) => (
                  <div key={service.name} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(service.status)} animate-pulse`} />
                        <span className="font-medium text-white">{service.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{service.uptime}% uptime</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">CPU</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
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
                      <div>
                        <div className="text-gray-400">Memory</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
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
                      <div>
                        <div className="text-gray-400">Errors</div>
                        <div className="text-gray-300 mt-1">{service.errors}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Recent Incidents</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
              </div>
              <div className="space-y-4">
                {mockIncidents.map((incident) => (
                  <div key={incident.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`h-3 w-3 rounded-full mt-1 ${getStatusColor(incident.status)} animate-pulse`} />
                        <div className="flex-1">
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
        </div>
      </div>
    </div>
  )
}
