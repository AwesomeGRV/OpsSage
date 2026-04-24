#!/usr/bin/env node

/**
 * RAG Pipeline Demo Script
 * 
 * This script demonstrates the RAG pipeline functionality
 * without requiring the full NestJS application setup.
 * 
 * Usage: npm run rag-demo
 */

import { RAGService } from './rag.service';
import { ConfigService } from '@nestjs/config';

// Mock implementation for demo purposes
class MockConfigService {
  get(key: string): string {
    const config: Record<string, string> = {
      'OPENAI_API_KEY': process.env.OPENAI_API_KEY || 'demo-key',
      'PINECONE_API_KEY': process.env.PINECONE_API_KEY || 'demo-key',
      'REDIS_URL': process.env.REDIS_URL || 'redis://localhost:6379',
      'PINECONE_INDEX': process.env.PINECONE_INDEX || 'opssage-incidents'
    };
    return config[key] || '';
  }
}

class MockHttpService {
  // Mock HTTP service for demo
}

async function runDemo() {
  console.log('Starting RAG Pipeline Demo...');

  // Initialize RAG service
  const configService = new MockConfigService() as any;
  const httpService = new MockHttpService() as any;
  const ragService = new RAGService(configService, httpService);

  try {
    // Demo Query 1: Root Cause Analysis
    console.log('Demo Query 1: Root Cause Analysis');
    console.log('Query: "Why is checkout service failing?"');
    
    const result1 = await ragService.analyzeIncident(
      'Why is checkout service failing?',
      {
        userId: 'demo-user',
        defaultTimeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        },
        maxResults: 10,
        services: ['checkout-service']
      }
    );

    console.log('\nAnalysis Result:');
    console.log(JSON.stringify(result1, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Demo Query 2: Similar Incidents
    console.log('Killer Feature: Similar Incident Detection');
    console.log('Query: "Find similar incidents to database connection issues"');
    
    const result2 = await ragService.analyzeIncident(
      'Find similar incidents to database connection issues',
      {
        userId: 'demo-user',
        defaultTimeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        maxResults: 5,
        services: ['checkout-service', 'payment-service']
      }
    );

    console.log('\nAnalysis Result:');
    console.log(JSON.stringify(result2, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Demo Query 3: Status Check
    console.log('Demo Query 3: Status Check');
    console.log('Query: "What is the status of payment service?"');
    
    const result3 = await ragService.analyzeIncident(
      'What is the status of payment service?',
      {
        userId: 'demo-user',
        defaultTimeRange: {
          start: new Date(Date.now() - 60 * 60 * 1000),
          end: new Date()
        },
        maxResults: 3,
        services: ['payment-service']
      }
    );

    console.log('\nAnalysis Result:');
    console.log(JSON.stringify(result3, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Demo: Store Incident Embedding
    console.log('Resolution patterns identified');
    const incident = {
      id: 'inc_demo_001',
      title: 'Checkout service database timeout',
      description: 'Multiple timeout errors in checkout service database connections',
      service: 'checkout-service',
      severity: 'high'
    };

    await ragService.storeIncidentEmbedding(incident);
    console.log('Incident embedding stored successfully');
    console.log(`Incident ID: ${incident.id}`);
    console.log(`Service: ${incident.service}`);
    console.log(`Severity: ${incident.severity}`);

    console.log('Demo completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('Query processing with entity extraction');
    console.log('Intent detection (root_cause, similar_incidents, status_check)');
    console.log('Vector similarity search');
    console.log('Context assembly');
    console.log('LLM-powered analysis');
    console.log('Structured response generation');
    console.log('Incident embedding storage');

  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

// Check if this is running directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };
