'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Zap,
  TrendingUp,
  FileText,
  Play,
  RefreshCw
} from 'lucide-react'

interface AnalysisResult {
  query: string
  timestamp: Date
  duration: number
  confidence: number
  rootCause: {
    hypothesis: string
    confidence: number
    evidence: Array<{
      type: string
      description: string
      source: string
      confidence: number
    }>
  }
  recommendations: Array<{
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    autoExecutable: boolean
    command?: string
  }>
  similarIncidents: Array<{
    id: string
    title: string
    similarity: number
    resolvedAt: Date
    resolution: string
  }>
  dataPoints: number
  services: string[]
}

interface IncidentAnalysisProps {
  onAnalysisComplete?: (result: AnalysisResult) => void
}

export default function IncidentAnalysis({ onAnalysisComplete }: IncidentAnalysisProps) {
  const [query, setQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([])

  // Mock analysis function
  const performAnalysis = async () => {
    if (!query.trim()) return

    setIsAnalyzing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult: AnalysisResult = {
      query,
      timestamp: new Date(),
      duration: 2340,
      confidence: 87,
      rootCause: {
        hypothesis: 'Database connection pool exhaustion in checkout-service',
        confidence: 87,
        evidence: [
          {
            type: 'log_pattern',
            description: 'High frequency of connection timeout errors',
            source: 'datadog',
            confidence: 90
          },
          {
            type: 'metric_anomaly',
            description: 'Database connection utilization at 95%',
            source: 'datadog',
            confidence: 85
          },
          {
            type: 'k8s_event',
            description: 'Pod restarts detected in checkout-service',
            source: 'kubernetes',
            confidence: 78
          }
        ]
      },
      recommendations: [
        {
          title: 'Restart checkout-service',
          description: 'Restart the service to clear connection pool issues',
          priority: 'high',
          autoExecutable: true,
          command: 'kubectl rollout restart deployment/checkout-service'
        },
        {
          title: 'Increase database connection pool size',
          description: 'Scale up connection pool to handle increased load',
          priority: 'medium',
          autoExecutable: false
        },
        {
          title: 'Add database connection monitoring',
          description: 'Implement connection pool metrics and alerting',
          priority: 'low',
          autoExecutable: false
        }
      ],
      similarIncidents: [
        {
          id: 'INC-001',
          title: 'Checkout service database timeout',
          similarity: 91,
          resolvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          resolution: 'Service restart and connection pool increase'
        },
        {
          id: 'INC-003',
          title: 'Payment service connection issues',
          similarity: 78,
          resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          resolution: 'Database scaling and connection optimization'
        }
      ],
      dataPoints: 15420,
      services: ['checkout-service', 'payment-service', 'database']
    }

    setRecentAnalyses(prev => [mockResult, ...prev.slice(0, 4)])
    setIsAnalyzing(false)
    onAnalysisComplete?.(mockResult)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-blue-200 bg-blue-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'high': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="space-y-6">
      {/* Analysis Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Incident Analysis</span>
          </CardTitle>
          <CardDescription>
            Describe the incident or issue you're experiencing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Why is checkout service failing?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && performAnalysis()}
            />
            <Button 
              onClick={performAnalysis} 
              disabled={!query.trim() || isAnalyzing}
              className="min-w-[120px]"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">91%</div>
            <div className="text-sm text-gray-600">Similarity Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">15K</div>
            <div className="text-sm text-gray-600">Data Points Analyzed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-purple-600">2.3s</div>
            <div className="text-sm text-gray-600">Avg Analysis Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-600">87%</div>
            <div className="text-sm text-gray-600">Confidence Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Analyses</h3>
          {recentAnalyses.map((analysis, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{analysis.query}</CardTitle>
                    <CardDescription>
                      {analysis.timestamp.toLocaleString()} • {formatDuration(analysis.duration)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge>{analysis.confidence}% confidence</Badge>
                    <Badge variant="outline">{analysis.dataPoints.toLocaleString()} data points</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Root Cause */}
                <div>
                  <h4 className="font-medium mb-3">Root Cause Analysis</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{analysis.rootCause.hypothesis}</span>
                      <Badge>{analysis.rootCause.confidence}% confidence</Badge>
                    </div>
                    <div className="space-y-2">
                      {analysis.rootCause.evidence.map((evidence, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
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

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{rec.title}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{rec.priority}</Badge>
                            {rec.autoExecutable && (
                              <Badge className="bg-green-100 text-green-800">Auto-executable</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        {rec.autoExecutable && rec.command && (
                          <div className="bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono mb-3">
                            {rec.command}
                          </div>
                        )}
                        <div className="flex space-x-2">
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

                {/* Similar Incidents */}
                <div>
                  <h4 className="font-medium mb-3">Similar Incidents</h4>
                  <div className="space-y-2">
                    {analysis.similarIncidents.map((similar, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{similar.title}</div>
                          <div className="text-sm text-gray-600">
                            {similar.id} • Resolved {similar.resolvedAt.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">{similar.resolution}</div>
                        </div>
                        <Badge>{similar.similarity}% similar</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
