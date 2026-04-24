import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  service: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsNotEmpty()
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  assignee?: string;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsString()
  @IsOptional()
  rootCause?: string;
}

export class AnalyzeIncidentDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsNotEmpty()
  services: string[];

  @IsNotEmpty()
  timeRange: {
    start: string;
    end: string;
  };
}

export class IncidentResponseDto {
  id: string;
  title: string;
  description?: string;
  status: string;
  severity: string;
  service?: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  duration?: number;
  analysis?: any;
}

export class AnalysisResponseDto {
  id: string;
  query: string;
  analysis: any;
  metadata: any;
}
