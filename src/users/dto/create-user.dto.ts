import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Order } from 'src/schemas/Order.schema';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  profileImage: {
    data: Buffer;
    contentType: string;
    path: string;
  };

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: ['customer', 'artist'] })
  @IsEnum(['customer', 'artist'])
  @IsNotEmpty()
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  emailToken?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  spentMoney?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  proposals?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  artStyle?: Array<{ name: string }>;

  @ApiProperty({ required: false })
  @IsOptional()
  aboutMe?: string;

  @ApiProperty({ required: false })
  personalProjects?: {
    data: Buffer;
    contentType: string;
    path: string;
  }[];

  @ApiProperty({ required: false })
  @IsOptional()
  numReviews?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  rating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  reviews?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  notifications?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  orders?: Order[];
}
