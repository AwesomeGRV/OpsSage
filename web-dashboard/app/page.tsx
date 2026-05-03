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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Modern Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">OpsSage</h1>
                    <p className="text-sm text-gray-300 font-medium">AI-Powered Operations Intelligence</p>
                  </div>
                </div>
                
                <nav className="hidden md:flex items-center space-x-8">
                  <button className="text-white font-semibold hover:text-blue-400 transition-colors relative">
                    Dashboard
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400" />
                  </button>
                  <button className="text-gray-300 hover:text-white transition-colors">Incidents</button>
                  <button className="text-gray-300 hover:text-white transition-colors">Services</button>
                  <button className="text-gray-300 hover:text-white transition-colors">Analytics</button>
                  <button className="text-gray-300 hover:text-white transition-colors">Settings</button>
                </nav>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-sm text-green-400 font-semibold">All Systems Operational</span>
                </div>
                <button className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <Bell className="h-5 w-5 text-gray-300" />
                </button>
                <button className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <Settings className="h-5 w-5 text-gray-300" />
                </button>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="p-8">
          {/* Hero Section with Key Metrics */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">System Overview</h2>
                <p className="text-lg text-gray-300">Real-time monitoring and AI-powered insights</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:scale-105">
                  <Brain className="h-4 w-4 mr-2 inline" />
                  Run AI Analysis
                </button>
                <button className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300">
                  <BarChart3 className="h-4 w-4 mr-2 inline" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Impressive KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-gradient-to-br from-blue-600/10 to-blue-800/10 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                      <Activity className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center text-green-400 font-bold text-lg">
                      <ArrowUpRight className="h-5 w-5 mr-1" />
                      12.5%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-3">{formatNumber(mockMetrics.performance.throughput)}</div>
                  <div className="text-lg text-gray-300 mb-6">Requests per Second</div>
                  <div className="h-20">
                    <LineChart data={requestData.slice(-8)} color="#3B82F6" height={80} />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-gradient-to-br from-green-600/10 to-green-800/10 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center text-green-400 font-bold text-lg">
                      <ArrowUpRight className="h-5 w-5 mr-1" />
                      0.2%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-3">{mockMetrics.uptime.overall}%</div>
                  <div className="text-lg text-gray-300 mb-6">System Uptime</div>
                  <div className="h-20 flex items-end justify-between">
                    {[99.9, 99.8, 99.7, 99.9, 99.8, 99.7, 99.9, 99.7].map((value, index) => (
                      <div key={index} className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t" style={{ height: `${(value - 99) * 100}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-gradient-to-br from-purple-600/10 to-purple-800/10 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25">
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center text-green-400 font-bold text-lg">
                      <ArrowDownRight className="h-5 w-5 mr-1" />
                      28%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-3">{mockMetrics.mttr.current}m</div>
                  <div className="text-lg text-gray-300 mb-6">Mean Time to Recovery</div>
                  <div className="h-20">
                    <LineChart data={[45, 42, 38, 35, 30, 25, 20, 12.5]} color="#A855F7" height={80} />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-gradient-to-br from-orange-600/10 to-orange-800/10 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-8 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                      <AlertTriangle className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center text-red-400 font-bold text-lg">
                      <ArrowUpRight className="h-5 w-5 mr-1" />
                      15%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-3">{mockMetrics.incidents.today}</div>
                  <div className="text-lg text-gray-300 mb-6">Active Incidents</div>
                  <div className="h-20">
                    <BarChart data={incidentData} color="#F97316" height={80} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Chart - Large */}
            <div className="lg:col-span-2">
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Performance Analytics</h3>
                    <p className="text-gray-400">Real-time system performance metrics</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 text-sm rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">1D</button>
                    <button className="px-4 py-2 text-sm rounded-xl text-gray-400 hover:bg-white/10 font-medium">1W</button>
                    <button className="px-4 py-2 text-sm rounded-xl text-gray-400 hover:bg-white/10 font-medium">1M</button>
                  </div>
                </div>
                
                <div className="mb-8">
                  <LineChart data={performanceData} color="#3B82F6" height={300} />
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-2xl p-6 border border-blue-500/20">
                    <div className="text-sm text-gray-400 mb-2">Average Response</div>
                    <div className="text-2xl font-bold text-white">{formatDuration(mockMetrics.performance.avgResponseTime)}</div>
                    <div className="text-xs text-green-400 mt-2">↓ 15% from last week</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-2xl p-6 border border-purple-500/20">
                    <div className="text-sm text-gray-400 mb-2">Peak Load</div>
                    <div className="text-2xl font-bold text-white">16.2K req/s</div>
                    <div className="text-xs text-green-400 mt-2">↑ 8% from yesterday</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600/10 to-orange-800/10 rounded-2xl p-6 border border-orange-500/20">
                    <div className="text-sm text-gray-400 mb-2">Error Rate</div>
                    <div className="text-2xl font-bold text-white">{mockMetrics.performance.errorRate}%</div>
                    <div className="text-xs text-red-400 mt-2">↑ 0.3% from baseline</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Distribution */}
            <div>
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Service Load</h3>
                    <p className="text-gray-400">Traffic distribution</p>
                  </div>
                  <PieChartIcon className="h-6 w-6 text-gray-400" />
                </div>
                
                <div className="mb-8">
                  <PieChart data={serviceDistribution} colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']} height={250} />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-4 rounded-full bg-blue-500" />
                      <span className="text-white font-medium">API Gateway</span>
                    </div>
                    <span className="text-blue-400 font-bold">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <span className="text-white font-medium">Checkout</span>
                    </div>
                    <span className="text-green-400 font-bold">25%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-4 rounded-full bg-yellow-500" />
                      <span className="text-white font-medium">Payment</span>
                    </div>
                    <span className="text-yellow-400 font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-4 rounded-full bg-red-500" />
                      <span className="text-white font-medium">User Service</span>
                    </div>
                    <span className="text-red-400 font-bold">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Services and Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Service Health */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Service Health</h3>
                  <p className="text-gray-400">Real-time service monitoring</p>
                </div>
                <button className="text-blue-400 hover:text-blue-300 font-medium">View All →</button>
              </div>
              
              <div className="space-y-6">
                {mockServices.map((service) => (
                  <div key={service.name} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`h-4 w-4 rounded-full ${getStatusColor(service.status)} animate-pulse shadow-lg`} />
                        <span className="text-lg font-semibold text-white">{service.name}</span>
                      </div>
                      <span className="text-lg text-gray-300">{service.uptime}% uptime</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-gray-400 mb-2">CPU Usage</div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                service.cpu > 80 ? 'bg-red-500' : 
                                service.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${service.cpu}%` }}
                            />
                          </div>
                          <span className="text-white font-bold">{service.cpu}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Memory</div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                service.memory > 80 ? 'bg-red-500' : 
                                service.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${service.memory}%` }}
                            />
                          </div>
                          <span className="text-white font-bold">{service.memory}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Errors</div>
                        <div className="text-white font-bold">{service.errors}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Recent Incidents</h3>
                  <p className="text-gray-400">Latest system events</p>
                </div>
                <button className="text-blue-400 hover:text-blue-300 font-medium">View All →</button>
              </div>
              
              <div className="space-y-6">
                {mockIncidents.map((incident) => (
                  <div key={incident.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`h-4 w-4 rounded-full mt-1 ${getStatusColor(incident.status)} animate-pulse shadow-lg`} />
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-white mb-2">{incident.title}</div>
                          <div className="text-gray-400 mb-3">{incident.service} • {incident.id}</div>
                          <div className="flex items-center space-x-4">
                            <Badge className={`border ${getSeverityColor(incident.severity)} font-medium`}>
                              {incident.severity}
                            </Badge>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <Brain className="h-4 w-4" />
                              <span>{incident.confidence}% confidence</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-300 font-medium">{incident.assignee}</div>
                        <div className="text-sm text-gray-500 mt-1">
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
