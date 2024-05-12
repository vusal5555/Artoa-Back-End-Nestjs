import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/Order.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User, UserSchema } from 'src/schemas/User.schema';
import { JwtStrategy } from 'src/middleware/authStrategy';
import { Bid, BidSchema } from 'src/schemas/Bid.Schema';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/Notification.Schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Bid.name,
        schema: BidSchema,
      },
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),

    CloudinaryModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, CloudinaryService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, CloudinaryModule],
})
export class OrdersModule {}
