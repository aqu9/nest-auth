import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'schema';
import { SessionSerializer } from './session/session.serializer';
import { PassportModule } from '@nestjs/passport';
import { SessionModule } from 'nestjs-session';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ session: true, defaultStrategy: 'jwt' }),
    SessionModule.forRoot({
      session: { secret: process.env.SECRECT || 'secrect', resave:true, saveUninitialized:true },
    }),
    JwtModule.register({
      secret: process.env.ACCESS_SECRET,
      signOptions: {
        expiresIn: 3600,
      },
    }),
    MongooseModule.forFeature([{ name: 'users', schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer, JwtStrategy],
})
export class AuthModule {}
