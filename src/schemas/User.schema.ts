import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Order, OrderSchema } from './Order.schema';
// import { ReviewSchema } from './Arist.schema'; // Assuming these are correct paths
// import { OrderSchema } from './Order.schema'; // Assuming these are correct paths

export interface ProfileImage {
  data: Buffer;
  contentType: string;
  path: string;
}

export interface PersonalProject {
  data: Buffer;
  contentType: string;
  path: string;
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: Object })
  profileImage: ProfileImage;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, enum: ['customer', 'artist'], default: 'customer' })
  role: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  emailToken: string;

  @Prop()
  spentMoney: number;

  @Prop()
  proposals: number;

  @Prop([{ name: String }])
  artStyle: Array<{ name: string }>;

  @Prop()
  aboutMe: string;

  @Prop()
  personalProjects: PersonalProject[];

  @Prop()
  numReviews: number;

  @Prop()
  rating: number;

  //   @Prop()
  //   reviews: ReviewSchema[];

  @Prop([{}])
  notifications: Array<any>;

  @Prop({ type: OrderSchema })
  orders: Order[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
