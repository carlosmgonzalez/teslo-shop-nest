import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows do you need',
    required: false,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows do you want skip',
    required: false,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  offset?: number;
}
