import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/login')
  async login(@Body() createUserDto: CreateUserDto, @Res() res: any) {
    const token = await this.usersService.login(createUserDto, res);
    res.status(200).json({ token });
  }

  @Post('/logout')
  @UseGuards(AuthGuard())
  async logoutUser(@Req() req, @Res() res) {
    return this.usersService.logout(req, res);
  }

  @Post('/verify-email')
  async verifyEmail(createUserDto: CreateUserDto, @Res() res) {
    return this.usersService.verifyEmail(createUserDto, res);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/artists')
  getAllArtists() {
    return this.usersService.getAllArtists();
  }

  @Get('/profile')
  @UseGuards(AuthGuard())
  getUserProfile(@Req() req: Request, @Res() res: Response) {
    return this.usersService.getUserProfile(req, res);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    try {
      return this.usersService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  @Patch('/change-password')
  @UseGuards(AuthGuard())
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.usersService.changePassword(changePasswordDto, res, req);
  }

  @Patch('/profile')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('profileImage'))
  update(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.usersService.update(updateUserDto, req, res, file);
  }

  @Post('/upload-projects')
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor('personalProjects'))
  async uploadProjects(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.usersService.uploadPersonalProjects(
      updateUserDto,
      req,
      res,
      files,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
