import { IsNotEmpty, IsEnum, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Bid } from 'src/schemas/Bid.Schema';

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  user: string; // Assuming user will be a string representing the ObjectId of the user

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  artStyle: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(['Individual', 'Corporate'])
  businessType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(['Interior', 'Exterior'])
  artPosition: string;

  @ApiProperty()
  @IsNotEmpty()
  artDimension: string;

  @ApiProperty()
  @IsNotEmpty()
  artLocation: string;

  @ApiProperty({ type: Bid })
  @IsArray()
  bids: Bid[]; // Assuming Bid is an object type and you might need a specific DTO for Bid

  @ApiProperty()
  @IsNotEmpty()
  wallImage?: {
    data: Buffer;
    contentType: string;
    path: string;
  }; // Assuming you'll handle file uploads separately

  @ApiProperty()
  @IsNotEmpty()
  description: string;
}
