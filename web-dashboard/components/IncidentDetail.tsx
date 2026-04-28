'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Play,
  Pause,
  Square,
  FileText,
  GitBranch
} from 'lucide-react'

interface Incident {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'investigating' | 'active' | 'resolved'
  service: string
  createdAt: Date
  assignee: string
  confidence: number
  description?: string
  rootCause?: {
    hypothesis: string
    confidence: number
    evidence: Array<{
      type: string
      description: string
      source: string
      confidence: number
    }>
  }
  recommendations?: Array<{
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    autoExecutable: boolean
    command?: string
  }>
  similarIncidents?: Array<{
    id: string
    title: string
    similarity: number
    resolvedAt: Date
  }>
  timeline?: Array<{
    timestamp: Date
    event: string
    type: 'info' | 'warning' | 'error'
  }>
}

interface IncidentDetailProps {
  incident: Incident
  onClose?: () => void
}

export default function IncidentDetail({ incident, onClose }: IncidentDetailProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'analysis' | 'timeline'>('overview')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'bg-blue-500'
      case 'active': return 'bg-red-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-blue-200 bg-blue-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'high': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const formatDuration = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`
    }
    return `${minutes}m ago`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(incident.status)}`} />
              <div>
                <h2 className="text-xl font-semibold">{incident.title}</h2>
                <p className="text-sm text-gray-600">{incident.id} • {incident.service}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getSeverityColor(incident.severity)}>
                {incident.severity}
              </Badge>
              <Badge variant="outline">
                {incident.confidence}% confidence
              </Badge>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {['overview', 'analysis', 'timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Service</h4>
                  <p className="text-gray-600">{incident.service}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Assignee</h4>
                  <p className="text-gray-600">{incident.assignee}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Created</h4>
                  <p className="text-gray-600">{formatDuration(incident.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <p className="text-gray-600">{incident.status}</p>
                </div>
              </div>

              {/* Description */}
              {incident.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{incident.description}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                <div className="flex space-x-2">
                  <Button size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Start Investigation
                  </Button>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-run Analysis
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Runbook
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'analysis' && (
            <div className="space-y-6">
              {/* Root Cause Analysis */}
              {incident.rootCause && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Root Cause Analysis</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">{incident.rootCause.hypothesis}</h5>
                      <Badge>{incident.rootCause.confidence}% confidence</Badge>
                    </div>
                    <div className="space-y-2">
                      {incident.rootCause.evidence.map((evidence, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>{evidence.description}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <span>{evidence.source}</span>
                            <Badge variant="outline">{evidence.confidence}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {incident.recommendations && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Recommendations</h4>
                  <div className="space-y-3">
                    {incident.recommendations.map((rec, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{rec.title}</h5>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{rec.priority}</Badge>
                            {rec.autoExecutable && (
                              <Badge className="bg-green-100 text-green-800">Auto-executable</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        {rec.autoExecutable && rec.command && (
                          <div className="bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono">
                            {rec.command}
                          </div>
                        )}
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm">
                            {rec.autoExecutable ? (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Execute
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Incidents */}
              {incident.similarIncidents && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Similar Incidents</h4>
                  <div className="space-y-2">
                    {incident.similarIncidents.map((similar, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{similar.title}</div>
                          <div className="text-sm text-gray-600">
                            Resolved {formatDuration(similar.resolvedAt)}
                          </div>
                        </div>
                        <Badge>{similar.similarity}% similar</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'timeline' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Incident Timeline</h4>
              <div className="space-y-4">
                {incident.timeline?.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.type === 'error' ? 'bg-red-500' :
                      event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">
                        {event.timestamp.toLocaleString()}
                      </div>
                      <div className="text-gray-900">{event.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
