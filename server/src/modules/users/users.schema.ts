import { HydratedDocument } from 'mongoose';
import { ExcludeProperty } from 'nestjs-mongoose-exclude';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  @ExcludeProperty()
  password: string;

  @Prop()
  @ExcludeProperty()
  secret: string;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
