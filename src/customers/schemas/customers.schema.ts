import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type CustomersDocument = HydratedDocument<Customers>;

@Schema({
  autoCreate: true,
  collection: 'customers',
  timestamps: true,
  versionKey: false,
})
export class Customers {
  @Prop()
  fb_id: string;

  @Prop()
  phone: string;
}

export const CustomersSchema = SchemaFactory.createForClass(Customers)
