/* eslint-disable @typescript-eslint/no-var-requires */
import { HttpService } from '@nestjs/axios';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomersService } from 'src/customers/customers.service';

const ids = [
  618114715010581,
  533851090781667,
  296769157540088,
  382908015245608,
  118056438849756,
  309364699595518, //
  289369428379939,
  1390167227872503,
];

interface Message {
  name: string;
  postId: string;
  content: string;
  link: string;
  phone?: string;
  time?: Date;
  userId?: string;
}

@WebSocketGateway({
  cors: true,
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private posts: Message[] = [];
  constructor(
    private readonly httpService: HttpService,
    private customersService: CustomersService,
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('Socket.IO server initialized');
  }

  async handleConnection(client: Socket) {
    console.log('connectionnnnnnnnnnnn');
  }

  handleDisconnect(client: Socket) {
    console.log('Ngat ket noi!.', client.id);
  }

  async handle(posts: Message) {
    let phoneNumber = null;

    const { content, link } = posts || {};
    const phone = this.getPhoneNumber(content);
    const userId = link.split('/')[4];

    if (phone) {
      phoneNumber = phone;
      const query = {
        fb_id: userId,
      };
      const update = { $set: { phone: phone } };
      const options = { upsert: true };
      await this.customersService.updateOne(query, update, options);
    } else {
      phoneNumber = (await this.customersService.findOne(userId))?.phone;
    }

    return {
      userId,
      phoneNumber: phoneNumber ?? null,
    };
  }

  getPhoneNumber(inputString: string) {
    const phonePattern = /\d{10,11}/; // Biểu thức chính quy để tìm số điện thoại có độ dài từ 10 đến 11 chữ số

    const phoneNumber = inputString?.match(phonePattern);

    if (phoneNumber) {
      return phoneNumber[0];
    } else {
      return null;
    }
  }

  @SubscribeMessage('message')
  async handleRemovmessageseMessage(client: Socket, payload: Message) {
    const { phoneNumber, userId } = await this.handle(payload);
    const check = this.posts.find((item) => item.postId === payload.postId);

    if (!check) {
      payload = { ...payload, phone: phoneNumber, userId, time: new Date() };

      if (this.posts.length === 20) {
        this.posts.shift();
      }

      this.posts.push(payload);
      console.log(this.posts);
    }
  }
}
