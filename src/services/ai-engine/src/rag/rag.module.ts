import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RAGService } from './rag.service';

@Module({
  imports: [HttpModule],
  providers: [RAGService],
  exports: [RAGService],
})
export class RAGModule {}
