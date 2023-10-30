import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UsersDocument = HydratedDocument<Users>;

@Schema({
  autoCreate: true,
  collection: 'users',
  timestamps: true,
  versionKey: false,
})
export class Users {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  nickName: string;

  @Prop()
  password: string;

  @Prop()
  email: string;

  @Prop({ default: 0 })
  role?: number;
}

export const UserSchema = SchemaFactory.createForClass(Users);
