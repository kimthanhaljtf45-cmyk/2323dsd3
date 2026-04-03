import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsEnum(['NEWS', 'EVENT', 'VIDEO', 'PHOTO', 'ANNOUNCEMENT'])
  type: 'NEWS' | 'EVENT' | 'VIDEO' | 'PHOTO' | 'ANNOUNCEMENT';

  @IsEnum(['GROUP', 'LOCATION', 'GLOBAL'])
  visibility: 'GROUP' | 'LOCATION' | 'GLOBAL';

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;
}
