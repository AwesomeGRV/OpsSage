'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface ServiceMetrics {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  cpu: number
  memory: number
  requests: number
  errors: number
  uptime: number
  responseTime: number
  lastUpdated: Date
}

interface ServiceHealthChartProps {
  services: ServiceMetrics[]
}

export default function ServiceHealthChart({ services }: ServiceHealthChartProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMetricColor = (value: number, type: 'cpu' | 'memory' | 'errors') => {
    if (type === 'errors') {
      if (value < 1) return 'text-green-600'
      if (value < 5) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (value < 50) return 'text-green-600'
    if (value < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    }
    return <Activity className="h-4 w-4 text-gray-500" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <Card key={service.name} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </div>
              <Badge className={getStatusBadge(service.status)}>
                {service.status}
              </Badge>
            </div>
            <CardDescription>
              Last updated: {service.lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">CPU</span>
                </div>
                <div className={`text-lg font-semibold ${getMetricColor(service.cpu, 'cpu')}`}>
                  {service.cpu}%
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Memory</span>
                </div>
                <div className={`text-lg font-semibold ${getMetricColor(service.memory, 'memory')}`}>
                  {service.memory}%
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Errors</span>
                </div>
                <div className={`text-lg font-semibold ${getMetricColor(service.errors, 'errors')}`}>
                  {service.errors}%
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Response</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDuration(service.responseTime)}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Requests</span>
                </div>
                <span className="font-medium">{formatNumber(service.requests)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Uptime</span>
                </div>
                <span className="font-medium">{service.uptime}%</span>
              </div>
            </div>

            {/* Status Indicator */}
            {service.status !== 'healthy' && (
              <div className="flex items-center space-x-2 pt-2 border-t">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  {service.status === 'critical' && 'Critical issues detected'}
                  {service.status === 'warning' && 'Performance degraded'}
                  {service.status === 'offline' && 'Service unavailable'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
