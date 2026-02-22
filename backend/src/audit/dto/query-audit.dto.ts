import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryAuditDto {
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'action', 'entityType'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
