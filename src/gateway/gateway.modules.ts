import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AppGateway, JwtService],
  controllers: [],
})
export class GatewayModules {}
