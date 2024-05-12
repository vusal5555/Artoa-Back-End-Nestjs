import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Order } from './order.schema';

@Schema({ timestamps: true })
export class Bid extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  user: MongooseSchema.Types.ObjectId | User;

  @Prop({ type: Object })
  author: any; // Define the type for the author property based on your requirements

  @Prop({ required: true })
  offer: string;

  @Prop({ required: true })
  totalPrice: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Order' })
  order: MongooseSchema.Types.ObjectId | Order;

  @Prop({ required: false })
  coverLetter: string;

  @Prop({ default: false })
  isChosen: boolean;
}

export const BidSchema = SchemaFactory.createForClass(Bid);
