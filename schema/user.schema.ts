import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, minlength: 10, maxlength: 10 })
  phone: string;

  @Prop({ required: false })
  address: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
