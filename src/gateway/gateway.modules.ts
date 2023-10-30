import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  providers: [AppGateway, JwtService],
  controllers: [],
})
export class GatewayModules {}
