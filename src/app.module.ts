import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModules } from './gateway/gateway.modules';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://thobui:Thanhtho96%40@fb.u6q1o5i.mongodb.net/?retryWrites=true&w=majority',
      {
        dbName: 'fb',
      },
    ),
    ScheduleModule.forRoot(),
    GatewayModules,
    UsersModule,
    AuthModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
