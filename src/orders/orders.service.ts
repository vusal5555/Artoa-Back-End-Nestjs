import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Model } from 'mongoose';
import { Order } from 'src/schemas/Order.schema';
import { User } from 'src/schemas/User.schema';
import { Bid } from 'src/schemas/Bid.Schema';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from 'src/schemas/Notification.Schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Bid.name) private bidModel: Model<Bid>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createOrderDto: CreateOrderDto, req: any, res: any, file: any) {
    const {
      businessType,
      artPosition,
      artDimension,
      artLocation,
      artStyle,
      description,
    } = createOrderDto;

    const result = await this.cloudinaryService.uploadFile(file);

    let wallImage;

    if (file && file.fieldname === 'wallImage') {
      wallImage = {
        data: file.buffer,
        contentType: file.mimetype,
        path: result.secure_url,
      };
    }

    const order = new this.orderModel({
      user: req.user._id, // Assign the ID of the authenticated user to the order.
      businessType, // Store the type of business associated with the order.
      artDimension, // Store the dimensions of the artwork.
      artPosition, // Store the position where the artwork will be placed.
      artLocation, // Store the location where the artwork will be installed.
      artStyle,
      description,
      wallImage: wallImage,
    });

    const user = await this.userModel.findById(req.user._id);

    if (user.role === 'artist') {
      throw new Error('You are an artist, You cannot create an order');
    }

    const artists = await this.userModel
      .find({
        role: 'artist',
        'artStyle.name': order.artStyle.map((style) => style.name),
      })
      .exec();

    const createOrder = (await order.save()) as Order & { createdAt: Date };

    // user.orders.push(createOrder); //come back to it later

    await user.save();

    const createdAt = new Date(createOrder.createdAt);
    const date = createdAt.getDate(); // returns the day of the month (1-31)
    const month = createdAt.getMonth() + 1; // months are zero-based (0-11), so we add 1
    const year = createdAt.getFullYear(); // returns the year (four digits)

    artists.forEach(async (artist) => {
      artist.notifications.push({
        _id: createOrder._id,
        firstName: user.firstName,
        lastName: user.lastName,
        artLocation,
        createdAt: `${date}/${month}/${year}`,
      });
      await artist.save(); // Save each artist's updated document
    });

    // Respond with a status of 201 (Created) and send the created order object in the response.
    res.status(201).json({
      _id: order._id,
      user: req.user._id, // Assign the ID of the authenticated user to the order.
      businessType, // Store the type of business associated with the order.
      artDimension, // Store the dimensions of the artwork.
      artPosition, // Store the position where the artwork will be placed.
      artLocation, // Store the location where the artwork will be installed.
      artStyle,
      description,
      wallImage: wallImage?.path,
    });
  }

  async findAll(req: any, res: any) {
    const orders = await this.orderModel
      .find({})
      .populate('user', 'name email spentMoney');
    res.status(200).json(orders);
  }

  async findOne(id: string, req: any, res: any) {
    const order = await this.orderModel
      .findById(req.params.id)
      .populate('user', 'name email spentMoney proposals');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.status(200).json(order);
  }

  async createBid(createBidDto: CreateBidDto, id: string, req: any, res: any) {
    const { offer, coverLetter } = createBidDto;

    const order = await this.orderModel.findById(id);

    const userArtist = await this.userModel.findOne({ _id: req.user._id });

    const dimensions = order.artDimension.split('x');

    const userCreatedOrder = await this.userModel.findOne({ _id: order.user });

    const firstValue = parseInt(dimensions[0], 10);

    const { firstName, lastName, artStyle, aboutMe, profileImage } = userArtist;

    // If the order is found
    if (order) {
      // Creating a new bid
      const bid = await this.bidModel.create({
        user: req.user._id,
        author: {
          firstName,
          lastName,
          artStyle,
          aboutMe,
          // profileImage: profileImage.path,
        },
        order: order._id,
        offer: Number(offer),
        coverLetter,
        totalPrice: Number(offer) * firstValue,
      });

      if (userArtist.role === 'customer') {
        throw new Error('You are an customer, You cannot create a bid');
      }

      // If the bid is created
      if (bid) {
        // Adding the bid to the order's reviews array
        order.bids.push(bid);
        userCreatedOrder.notifications.push(bid);

        // Saving the changes to the order
        await order.save();
        await userCreatedOrder.save();

        // Responding with a 200 status and a JSON message
        res.status(200).json({ msg: 'Bid added' });
      } else {
        // If the bid is not created, respond with a 404 status and throw an error
        res.status(404);
        throw new Error('Bid not created');
      }
    }
  }

  async getAllBids(req: any, res: any) {
    // Retrieve all bids from the database.
    const bids = await this.bidModel.find({});

    // Respond with a status of 200 (OK) and send the retrieved bids in the response.
    res.status(200).json(bids);
  }

  async getBidById(id: string, req: any, res: any) {
    // Attempt to find a bid in the database by its ID, which is extracted from the request parameters.
    const bid = await this.bidModel.findById(id);

    // If no bid is found with the provided ID, set the response status to 404 (Not Found)
    // and throw an error with a message indicating that the bid was not found.
    if (!bid) {
      res.status(404);
      throw new Error('Bid not found');
    }

    // If a bid is found, respond with a status of 200 (OK) and send the retrieved bid in the response.
    res.status(200).json(bid);
  }

  async updateBid(id: string, updateBidDto: UpdateBidDto, req: any, res: any) {
    // Fetching the bid information using the provided ID from the request parameters
    const bid = await this.bidModel.findById(id);

    let order = await this.orderModel.findOne({ _id: bid.order });

    console.log(bid.order);

    const userArtist = await this.userModel.findOne({ _id: req.user._id });

    // Checking if the bid is found
    if (!bid) {
      res.status(404);
      throw new Error('Bid not found');
    }

    if (userArtist.role === 'user') {
      throw new Error('You are an user, You cannot update a bid');
    }

    // Checking if the user is authorized to update the bid
    if (bid.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized to update this bid');
    }

    const { offer } = updateBidDto;

    // Updating bid information based on the provided request body
    bid.offer = offer.toString() || bid.offer;

    // Saving the updated bid details to the database
    await bid.save();

    order = await this.orderModel.findOneAndUpdate(
      { user: order.user },
      {
        $set: {
          'bids.$[elem].offer': bid.offer.toString(),
        },
      },
      { new: true, arrayFilters: [{ 'elem._id': bid._id }] },
    );

    // If the order document is not found, respond with a 404 status and throw an error
    if (!order) {
      res.status(404);
      throw new Error('Artist not found');
    }

    // Responding with a 200 status and a JSON object containing the updated bid
    res.status(200).json({
      _id: bid._id,
      offer: bid.offer,
    });
  }

  async deleteBid(id: string, req: any, res: any) {
    const bidId = id.replace(/\W/g, '');

    // Finding the bid by its ID
    const bid = await this.bidModel.findById(bidId);

    let order = await this.orderModel.findOne({ _id: bid.order });

    const userArtist = await this.userModel.findOne({ _id: req.user._id });

    // If the bid with the provided ID is not found, respond with a 404 status and throw an error
    if (!bid) {
      res.status(404);
      throw new Error('Bid not found');
    }

    if (userArtist.role === 'user') {
      throw new Error('You are an user, You cannot delete a bid');
    }
    // Delete the bid from the reviews collection
    await this.bidModel.deleteOne({ _id: req.params.id });

    // Find the order document using the user ID associated with the bid
    order = await this.orderModel.findOneAndUpdate(
      { user: order.user }, // Assuming bid.user is the user's ID
      { $pull: { bids: { _id: bid._id } } },
      { new: true },
    );

    // If the order document is not found, respond with a 404 status and throw an error
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // If the bid is successfully deleted, respond with a 200 status and a JSON message
    res.status(200).json({ msg: 'Bid deleted successfully' });
  }

  async chooseBid(
    id: string,
    bidId: string,
    createBidDto: CreateBidDto,
    req: any,
    res: any,
  ) {
    const order = await this.orderModel.findById(id);

    const chosenBid = await this.bidModel.findById(bidId);

    const userCreatedOrder = await this.userModel.findOne({ _id: order.user });

    const userArtist = await this.userModel.findOne({ _id: req.user._id });

    if (chosenBid) {
      chosenBid.isChosen = true;

      await chosenBid.save();

      // Filter out other bids which are not chosen
      order.bids = order.bids.filter((bid) => bid._id.equals(chosenBid._id));

      userCreatedOrder.notifications.push({
        message: `${userArtist.firstName} has agreed to your bid`,
      });

      await order.save();

      await userCreatedOrder.save();

      res.status(201).json({ msg: 'Bid chosen' });
    } else {
      throw new Error('Bid not found');
    }
  }

  async createNotification(
    id: string,
    orderId: string,
    createNotificationDto: CreateNotificationDto,
    req: any,
    res: any,
  ) {
    // Extracting rating and comment from the request body
    const { location, date, phoneNumber } = createNotificationDto;

    // Finding the bid by the bidId in the request parameters
    const bid = await this.bidModel.findById(id);

    // Finding the artist by the user ID provided in the request parameters
    const user = await this.userModel.findOne({ _id: bid.user });

    // Finding the order by the orderId in the request parameters
    const order = await this.orderModel.findById(orderId);

    // If the order, bid, artist is found
    if (user && bid && order) {
      // Creating a new notification
      const notification = await this.notificationModel.create({
        user: req.user._id,
        bid: bid._id,
        order: order._id,
        location,
        date,
        phoneNumber,
      });

      // If the notification is created
      if (notification) {
        // Adding the notification to the artists's notificatins array
        user.notifications.push(notification);

        // Saving the changes to the artist
        await user.save();

        console.log(user);

        // Responding with a 200 status and a JSON message
        res.status(200).json({ msg: 'Notification sent' });
      } else {
        // If the notification is not created, respond with a 404 status and throw an error
        res.status(404);
        throw new Error('Notification not created');
      }
    } else {
      // If the order, bid and artist are not found, respond with a 404 status and throw an error
      res.status(404);
      throw new Error('Resource not found');
    }
  }
}
