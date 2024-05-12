import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Bid, BidSchema } from './Bid.Schema';
// import { Bid } from './bid.schema';

export interface WallImage {
  data: Buffer;
  contentType: string;
  path: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  user: MongooseSchema.Types.ObjectId | User;

  @Prop([{ name: { type: String, required: false } }])
  artStyle: { name: string }[];

  @Prop({ required: true, enum: ['Individual', 'Corporate'] })
  businessType: string;

  @Prop({ required: true, enum: ['Interior', 'Exterior'] })
  artPosition: string;

  @Prop({ required: true })
  artDimension: string;

  @Prop({ required: true })
  artLocation: string;

  @Prop({ type: [BidSchema] })
  bids: Bid[];

  @Prop({ type: Object, required: false })
  wallImage: WallImage;

  @Prop({ required: true })
  description: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
