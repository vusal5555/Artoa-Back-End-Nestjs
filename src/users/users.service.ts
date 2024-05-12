import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import sendVerificationEmail from 'src/utils/sendVerificationEmail';
import { comparePasswords } from 'src/utils/comparePasswords';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        role,
        artStyle,
        aboutMe,
        notifications,
        orders,
      } = createUserDto;

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

      // Validating the email format using the regular expression
      if (!emailRegex.test(email)) {
        throw new HttpException('Email is not valid', HttpStatus.NOT_FOUND);
      }

      if (!firstName || !lastName || !email || !password) {
        throw new HttpException('Please provide credentials', 400);
      }

      const userExists = await this.userModel.findOne({ email });

      if (userExists) {
        throw new HttpException('User already exists', 400);
      }

      const user = await this.userModel.create({
        firstName,
        lastName,
        email,
        password,
        role,
        artStyle,
        aboutMe,
        emailToken: crypto.randomBytes(64).toString('hex'), // Generating a random email token
        notifications,
        orders,
      });

      if (user) {
        // Log successful registration
        sendVerificationEmail(user);
        // Responding with user details upon successful registration
        // This is handled by the generateTokenAndRespond function
      } else {
        // Log failed registration attempt
        throw new HttpException('Invalid user data', 400);
      }

      return user;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async login(createUserDto: CreateUserDto, res: any) {
    try {
      const { email, password } = createUserDto;

      const user = await this.userModel.findOne({
        email: email,
      });

      if (user && (await comparePasswords(password, user.password))) {
        if (!user.isVerified) {
          throw new HttpException('Please verify your email', 401);
        }

        const token = this.jwtService.sign({ id: user._id });

        return token;
      } else {
        // Log failed authentication attempt
        throw new HttpException('Invalid email or password', 401);
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async logout(req: any, res: any) {
    // Clearing the JWT cookie by setting its expiration date to a past date

    // Responding with a 200 status and a JSON message indicating successful user logout

    res.status(200).json({ msg: 'User logged out' });
  }

  async verifyEmail(createUserDto: CreateUserDto, res: any) {
    try {
      const { emailToken } = createUserDto;

      // Checking if emailToken is provided
      if (!emailToken) {
        throw new HttpException('Email token not found', 404);
      }

      // Finding a user in the database with the provided emailToken
      const user = await this.userModel.findOne({ emailToken });

      // Checking if a user with the provided emailToken exists
      if (user) {
        // Updating user properties to mark email as verified
        user.emailToken = null; // Clearing the emailToken
        user.isVerified = true; // Setting isVerified to true

        // Saving the updated user details to the database
        await user.save();

        // Responding with user details upon successful email verification
        return user;
      } else {
        // Log failed email verification attempt
        throw new HttpException('Email Verification failed', 400);
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async findAll() {
    return this.userModel.find({}).select('-profileImage -personalProjects');
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role === 'artist') {
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage?.path,
          role: user.role,
          personalProjects: user?.personalProjects,
          artStyle: user.artStyle,
          aboutMe: user.aboutMe,
          notifications: user.notifications,
        };
      } else {
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage?.path,
          role: user.role,
          orders: user.orders,
          notifications: user.notifications,
        };
      }
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getAllArtists() {
    try {
      const artists = await this.userModel.find({
        role: 'artist',
      });

      // Checking if any artists are found
      if (artists) {
        // Responding with a 200 status and a JSON object containing the list of artists
        return artists;
      } else {
        // Handling a case where no artists are found with a 404 status and a JSON message
        throw new HttpException('Artists not found', 404);
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getUserProfile(req: any, res: any) {
    try {
      // Fetching the user's profile information using their user ID from the request
      const user = await this.userModel.findById(req.user._id);

      // Checking if the user is found
      if (user) {
        // Responding with a 200 status and a JSON object containing the user's profile details
        if (user.role === 'artist') {
          res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImage: user.profileImage?.path,
            role: user.role,
            isVerified: user.isVerified,
            personalProjects: user?.personalProjects,
            artStyle: user.artStyle,
            aboutMe: user.aboutMe,
            notifications: user.notifications,
            // reviews: user.reviews,
          });
        }
        res.status(200).json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage?.path,
          role: user.role,
          isVerified: user.isVerified,
          notifications: user.notifications,
          personalProjects: user.personalProjects,
          // orders: user.orders,
        });
      } else {
        throw new HttpException('User not found', 404);
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async changePassword(changePassword: ChangePasswordDto, res: any, req: any) {
    try {
      const { currentPassword, newPassword } = changePassword;

      const user = await this.userModel
        .findById(req.user._id)
        .select('+password');

      if (!(await comparePasswords(currentPassword, user.password))) {
        throw new HttpException('Your current password is wrong', 401);
      }

      user.password = newPassword;
      await user.save();

      res.status(201).json({ msg: 'password changed' });
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async update(updateUserDto: UpdateUserDto, req: any, res: any, file: any) {
    try {
      const { firstName, lastName, email, artStyle, aboutMe } = updateUserDto;
      // Fetching the user's profile information using their user ID from the request
      const user = await this.userModel.findById(req.user._id);

      const result = await this.cloudinaryService.uploadFile(file);

      // Checking if the user is found
      if (user) {
        // Updating user information based on the provided request body
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.artStyle = artStyle || user.artStyle;
        user.aboutMe = aboutMe || user.aboutMe;

        let profileImage;

        // console.log(file);
        // Check if profileImage was uploaded
        if (file && file.fieldname === 'profileImage') {
          profileImage = {
            data: file.buffer,
            contentType: file.mimetype,
            path: result.secure_url,
          };

          user.profileImage = profileImage || user.profileImage;
        }
        // console.log(user.profileImage);

        // Saving the updated user details to the database
        await user.save();

        // Responding with a 201 status and a JSON object containing the updated user profile
        res.status(201).json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          personalProjects: user?.personalProjects,
          profileImage: user.profileImage?.path,
          artStyle: user.artStyle,
          aboutMe: user.aboutMe,
        });
      } else {
        throw new HttpException('User not found', 404);
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async uploadPersonalProjects(
    updateUserDto: UpdateUserDto,
    req: any,
    res: any,
    files: any,
  ) {
    try {
      const user = await this.userModel.findById(req.user._id);

      const cloudinaryResponses = await Promise.all(
        files.map((file) => this.cloudinaryService.uploadFile(file)),
      );

      const projectURLs = cloudinaryResponses.map(
        (response) => response.secure_url,
      );

      if (user && files && files.length > 0) {
        user.personalProjects = user.personalProjects.concat(projectURLs);
        await user.save();
      } else {
        throw new HttpException('User or files nto found', 404);
      }

      res.status(201).json({
        personalProjects: user ? user.personalProjects : [],
      });
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  remove(id: string) {}
}
