import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response, Express } from 'express';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('wallImage'))
  async create(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.ordersService.create(createOrderDto, req, res, file);
  }

  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.ordersService.findAll(req, res);
  }

  @Get('/bids')
  getAllBids(@Req() req: Request, @Res() res: Response) {
    return this.ordersService.getAllBids(req, res);
  }

  @Get('/bids/:id')
  getBidById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.ordersService.getBidById(id, req, res);
  }

  @Patch('/bids/:id')
  @UseGuards(AuthGuard())
  updateBid(
    @Param('id') id: string,
    @Body() updateBidDto: UpdateBidDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.ordersService.updateBid(id, updateBidDto, req, res);
  }

  @Delete('/bids/:id')
  @UseGuards(AuthGuard())
  deleteBid(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.ordersService.deleteBid(id, req, res);
  }

  @Post('/bids/:id/:orderId')
  @UseGuards(AuthGuard())
  createNotification(
    @Param('id') id: string,
    @Param('orderId') orderId: string,
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.ordersService.createNotification(
      id,
      orderId,
      createNotificationDto,
      req,
      res,
    );
  }

  @Post('/:id/:bidId')
  @UseGuards(AuthGuard())
  chooseBid(
    @Param('id') id: string,
    @Param('bidId') bidId: string,
    @Body() createBidDto: CreateBidDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.ordersService.chooseBid(id, bidId, createBidDto, req, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.ordersService.findOne(id, req, res);
  }

  @Post(':id')
  @UseGuards(AuthGuard())
  createBid(
    @Param('id') id: string,
    @Body() createBidDto: CreateBidDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log(id);
    return this.ordersService.createBid(createBidDto, id, req, res);
  }
}
