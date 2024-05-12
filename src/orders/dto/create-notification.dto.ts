import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class CreateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  user: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty()
  order: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty()
  bid: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phoneNumber: string;
}
