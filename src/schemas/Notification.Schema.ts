import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { Order } from './Order.schema';
import { Bid } from './Bid.Schema';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
  user: mongoose.Types.ObjectId | User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' })
  order: mongoose.Types.ObjectId | Order;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bid' })
  bid: mongoose.Types.ObjectId | Bid;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  date: string;

  @Prop()
  phoneNumber: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
