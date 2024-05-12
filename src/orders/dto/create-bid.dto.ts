import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty()
  @IsNotEmpty()
  user: string; // Assuming user will be a string representing the ObjectId of the user

  @ApiProperty()
  author: any; // Define the type for the author property based on your requirements

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  offer: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty()
  order: string; // Assuming order will be a string representing the ObjectId of the order

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  coverLetter: string;

  @ApiProperty({ default: false })
  isChosen: boolean;
}
