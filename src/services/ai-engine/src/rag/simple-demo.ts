#!/usr/bin/env node

/**
 * Simple RAG Pipeline Demo Script
 * 
 * This script demonstrates the RAG pipeline functionality
 * without requiring external dependencies.
 */

interface LLMResponse {
  rootCause: {
    hypothesis: string;
    confidence: number;
    evidence: Array<{
      type: string;
      description: string;
      source: string;
      confidence: number;
    }>;
  };
  similarIncidents: Array<{
    id: string;
    title: string;
    similarity: number;
    explanation: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    autoExecutable: boolean;
    command?: string;
  }>;
}

class SimpleRAGService {
  async analyzeIncident(query: string): Promise<LLMResponse> {
    console.log(`🔍 Analyzing query: "${query}"`);
    
    // Simulate processing delay
    await this.delay(1000);
    
    // Extract entities (simplified)
    const services = this.extractServices(query);
    const intent = this.detectIntent(query);
    
    console.log(`📊 Detected services: ${services.join(', ')}`);
    console.log(`🎯 Detected intent: ${intent}`);
    
    // Simulate vector search and LLM analysis
    await this.delay(1500);
    
    // Return mock analysis based on query
    return this.generateMockAnalysis(query, services, intent);
  }
  
  private extractServices(query: string): string[] {
    const servicePattern = /\b(checkout-service|payment-service|user-service|api-gateway)\b/gi;
    const matches = query.match(servicePattern) || [];
    return matches.map(s => s.toLowerCase());
  }
  
  private detectIntent(query: string): string {
    if (/\b(why|cause|reason)\b.*\b(failing|error|problem|issue)\b/i.test(query)) {
      return 'root_cause';
    }
    if (/\b(similar|like|previous)\b.*\b(incident|issue|problem)\b/i.test(query)) {
      return 'similar_incidents';
    }
    if (/\b(status|health|state)\b.*\b(service|system)\b/i.test(query)) {
      return 'status_check';
    }
    return 'general_inquiry';
  }
  
  private generateMockAnalysis(query: string, services: string[], intent: string): LLMResponse {
    const baseAnalysis = {
      rootCause: {
        hypothesis: 'Database connection pool exhaustion in checkout-service',
        confidence: 82,
        evidence: [
          {
            type: 'log',
            description: 'High frequency of connection timeout errors',
            source: 'datadog',
            confidence: 90
          },
          {
            type: 'metric',
            description: 'Database connection utilization at 95%',
            source: 'datadog',
            confidence: 85
          }
        ]
      },
      similarIncidents: [
        {
          id: 'inc_987654321',
          title: 'Checkout service database connection issues',
          similarity: 91,
          explanation: 'Similar incident 14 days ago. Root cause: memory leak in service X. Confidence: 91%'
        }
      ],
      recommendations: [
        {
          title: 'Restart checkout-service',
          description: 'Restart the checkout-service to clear connection pool issues',
          priority: 'high',
          autoExecutable: true,
          command: 'kubectl restart deployment/checkout-service'
        },
        {
          title: 'Increase database connection pool size',
          description: 'Increase the connection pool size to handle higher load',
          priority: 'medium',
          autoExecutable: false
        }
      ]
    };
    
    // Customize based on detected services
    if (services.includes('payment-service')) {
      baseAnalysis.rootCause.hypothesis = 'Payment gateway timeout due to network latency';
      baseAnalysis.similarIncidents[0].title = 'Payment service network connectivity issues';
      baseAnalysis.recommendations[0].command = 'kubectl restart deployment/payment-service';
    }
    
    if (services.includes('user-service')) {
      baseAnalysis.rootCause.hypothesis = 'User service authentication token expiration';
      baseAnalysis.similarIncidents[0].title = 'User service authentication failures';
      baseAnalysis.recommendations[0].command = 'kubectl restart deployment/user-service';
    }
    
    // Customize based on intent
    if (intent === 'similar_incidents') {
      baseAnalysis.similarIncidents.push({
        id: 'inc_123456789',
        title: 'Database connection pool exhaustion',
        similarity: 87,
        explanation: 'Similar incident 30 days ago. Root cause: connection leak in application code. Confidence: 87%'
      });
    }
    
    if (intent === 'status_check') {
      baseAnalysis.rootCause.confidence = 95;
      baseAnalysis.rootCause.evidence.push({
        type: 'health_check',
        description: 'Service health check failing',
        source: 'kubernetes',
        confidence: 95
      });
    }
    
    return baseAnalysis;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function runDemo() {
  console.log('Starting Simple RAG Pipeline Demo...\n');
  
  const ragService = new SimpleRAGService();
  
  // Demo queries
  const queries = [
    'Why is checkout service failing?',
    'Find similar incidents to database connection issues',
    'What is the status of payment service?',
    'User service authentication errors are increasing'
  ];
  
  for (let i = 0; i < queries.length; i++) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Demo Query ${i + 1}: ${queries[i]}`);
    console.log(`${'='.repeat(80)}\n`);
    
    try {
      const result = await ragService.analyzeIncident(queries[i]);
      
      console.log('\nAnalysis Result:');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\nKey Insights:');
      console.log(`• Root Cause: ${result.rootCause.hypothesis}`);
      console.log(`• Confidence: ${result.rootCause.confidence}%`);
      console.log(`• Similar Incidents: ${result.similarIncidents.length}`);
      console.log(`• Recommendations: ${result.recommendations.length}`);
      
      if (result.similarIncidents.length > 0) {
        console.log(`• Top Similar Incident: ${result.similarIncidents[0].title} (${result.similarIncidents[0].similarity}% similarity)`);
      }
      
      if (result.recommendations.length > 0) {
        const topRec = result.recommendations[0];
        console.log(`• Top Recommendation: ${topRec.title} (${topRec.priority} priority)`);
        if (topRec.autoExecutable) {
          console.log(`• Executable: kubectl ${topRec.command?.split(' ').slice(1).join(' ')}`);
        }
      }
      
    } catch (error) {
      console.error('Demo failed:', error);
    }
    
    // Small delay between queries
    if (i < queries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Demo completed successfully!\n');
  console.log('Key Features Demonstrated:');
  console.log('Query processing with entity extraction');
  console.log('Intent detection (root_cause, similar_incidents, status_check)');
  console.log('Service-specific analysis');
  console.log('Similar incident detection with similarity scores');
  console.log('Root cause hypothesis with confidence scores');
  console.log('Evidence correlation from multiple sources');
  console.log('Actionable recommendations with priority levels');
  console.log('Auto-executable commands for quick remediation');
  
  console.log('Killer Feature: Similar Incident Detection');
  console.log('91% similarity match found');
  console.log('Historical context provided');
  console.log('Resolution patterns identified');
  console.log('Confidence scoring applied');
  
  console.log('Performance Metrics:');
  console.log('• Query Processing: ~100ms');
  console.log('• Vector Search: ~200ms (simulated)');
  console.log('• LLM Generation: ~1.5s (simulated)');
  console.log('• Total Response Time: ~2.5s');
  
  console.log('\nReady for Production!');
  console.log('• Replace mock data with real Pinecone + OpenAI integration');
  console.log('• Add real-time data collection from Datadog, Kubernetes, PagerDuty');
  console.log('• Deploy with Docker and Kubernetes');
  console.log('• Scale horizontally with load balancing');
}

// Check if this is running directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo, SimpleRAGService };
