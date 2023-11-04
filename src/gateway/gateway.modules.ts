import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { CustomersModule } from 'src/customers/customers.module';

@Module({
  imports: [HttpModule, CustomersModule],
  providers: [AppGateway, JwtService],
  controllers: [],
})
export class GatewayModules {}
