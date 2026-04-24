import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || request.query.api_key;
    
    const validApiKey = this.configService.get<string>('API_KEY_SECRET');
    
    if (!validApiKey) {
      return true; // Allow if no API key is configured (development mode)
    }
    
    return apiKey === validApiKey;
  }
}
