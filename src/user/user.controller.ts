import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserDTO } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/helper.service';
@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  fetchCurrentUserDetail(@GetUser() user) {
    return this.userService.userById(user._id);
  }

  @Patch('/')
  updateCurrentUser(@GetUser() user, @Body() body: updateUserDTO) {
    return this.userService.updateUserById(user._id, body);
  }

  @Get('/all')
  findAllUser() {
    return this.userService.findAllUser();
  }

  @Get(':id')
  userById(@Param('id') id: string) {
    return this.userService.userById(id);
  }

  @Patch('/:id')
  updateUserById(@Param('id') id: string, @Body() body: updateUserDTO) {
    return this.userService.updateUserById(id, body);
  }

  @Delete('/:id')
  removeUserById(@Param('id') id: string) {
    return this.userService.removeUserById(id);
  }
}
