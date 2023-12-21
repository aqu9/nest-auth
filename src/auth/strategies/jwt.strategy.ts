import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

// import { User } from 'protegeDatabaseManager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { config } from 'dotenv';
import { User, UserDocument } from 'schema';
config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  //validate the signature
  constructor(
    @InjectModel('users') private readonly userModal: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload): Promise<User> {
    const { email } = payload;

    let existingUser: User;

    try {
      existingUser = await this.userModal.findOne({
        $or: [{ email: email }],
      });
      // existingUser = await userModal.findOne({
      // 	where: {
      // 		[Op.or]: [{ phone: userId }, { alias: userId }, { email: userId }],
      // 	},
      // });
    } catch (error) {
      throw new HttpException(
        'Exception while connecting with the database.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!existingUser)
      throw new HttpException(
        'No User exists with userId : ' + email,
        HttpStatus.NOT_FOUND,
      );

    return existingUser;
  }
}
