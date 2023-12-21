import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserDocument } from 'schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('users') private readonly userModel: Model<UserDocument>,
  ) {}

  async fetchCurrentUserDetail() {}
  async updateCurrentUser() {}

  async findAllUser() {
    try {
      const user = await this.userModel.find({}).select('-password -__v');

      if (!user.length) {
        throw new NotFoundException('something went wrong while fetching user');
      }
      return user;
    } catch (e) {
      throw new NotFoundException('something went wrong while fetching user');
    }
  }

  async userById(id: string) {
    try {
      const user = await this.userModel.findById(id).select('-password -__v');

      if (!user) {
        throw new NotFoundException('no record found with id' + id);
      }
      return user;
    } catch (e) {
      throw new NotFoundException(e.message || 'no record found with id' + id);
    }
  }

  async updateUserById(id: string, data) {
    try {
      if (data.email) {
        const user = await this.userModel
          .findOne({ email: data?.email })
          .select('-password -__v');
        if (user) {
          throw new NotFoundException('another record exists with user id');
        }
      }

      const user = await this.userModel
        .findByIdAndUpdate(new mongoose.Types.ObjectId(id), data, {
          new: true,
        })
        .select('-password -__v');

      if (!user) {
        throw new NotFoundException(
          'record not exisit with email ' + data.email,
        );
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeUserById(id: string) {
    try {
      const user = await this.userModel
        .findByIdAndDelete(id)
        .select('-password -__v');

      if (!user) {
        throw new NotFoundException('record not exisit with id ' + id);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
