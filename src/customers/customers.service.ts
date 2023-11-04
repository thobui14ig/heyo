import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customers, CustomersDocument } from './schemas/customers.schema';
import { Users, UsersDocument } from 'src/users/schemas/users.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customers.name)
    private readonly customersModel: Model<CustomersDocument>,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    return this.customersModel.create(createCustomerDto);
  }

  findAll() {
    return `This action returns all customers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  async updateOne(options) {
    for (const option of options) {
      const { options, update, query } = option
      await this.customersModel.updateOne(query, update, options);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
