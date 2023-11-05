import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { lastValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import * as dayjs from 'dayjs';
import { CustomersService } from 'src/customers/customers.service';

const tokenProxy = `i5F0BO6PLGSh-IfhvLE20p1mLLU9qJLoMGo0hlWIW6I`;

const ids = [
  618114715010581, 452769581947089, 533851090781667, 296769157540088,
  382908015245608, 118056438849756, 309364699595518, 283314998828030,
  289369428379939, 1390167227872503,
];

const tokens = {
  0: `EAABwzLixnjYBO2Di31VKiRE5nDN6pfkOkj1t6ZBRtuxXmioodkveCy9YyhWkjQWKBBa5VYNwFu8PDbwGtdmKZB3qqpumSkQeLKm3OsCJWO3NJSDyWG4mCZAjfJ0ZAMKjMvk354UEiyxmQNZAlMyBOoK687Y7qZB9xKxqAn6w9ZBA7gq3fNNCGqklwGoLTK9yZBXNhawVznYZD`,
  1: `EAAAAUaZA8jlABOzSghVpegjolwM7XI4NQxnu847HjkuCksZCoMGHG8QrZColwYZAU5nopNyQZCD1sAJ4ZAyuCkHMvDllYTwAg807PEKFlP7P1a7wIOQowdFEYaiJZAMokJk4xnuOfmTlkx6XeHWwNBvYNHKGuiQIVrB8KLVrIez3I4dAGlANZCMZAhmyNMZCHO53SiZAgZDZD`,
};

@WebSocketGateway({
  cors: true,
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private posts = [];
  constructor(
    private readonly httpService: HttpService,
    private customersService: CustomersService,
  ) {
    this.httpService.axiosRef.interceptors.request.use((config: any) => {
      config.proxy = {
        protocol: 'http',
        host: 'ip.mproxy.vn',
        port: 12340,
        auth: {
          username: 'thobui',
          password: 'KMuDZoncHZ4uSqh',
        },
      };

      return config;
    });
  }

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

  @Cron('*/6 * * * * *')
  async getPost() {
    try {
      const apis = ids.map((id) => {
        const api = `https://graph.facebook.com/v18.0/${id}/feed?access_token=${tokens[1]}&fields=created_time,message,id,from&limit=5`;
        return this.httpService.get(api);
      });
      const data = (await Promise.all(apis)).map((item) => lastValueFrom(item));
      const data1 = await Promise.all(data);
      const posts = data1.map((items) => {
        const post = this.findLatestPost(items?.data?.data);
        return {
          ...post,
          groupId: post?.id.split('_')[0],
          postId: post?.id.split('_')[1],
          created_time: dayjs(post?.created_time).format('YYYY-MM-DD HH:mm:ss'),
        };
      });

      const response = this.getPosts(this.posts, posts);
      this.posts = await this.getPhone(response.slice(0, 20));
      void this.server.emit('nhandon', this.posts);
    } catch (error) {
      console.error(error);
    }
  }

  async getPhone(posts) {
    const data: any = [];
    let phoneNumber = null;

    for (const item of posts) {
      const { message, from } = item || {};
      const phone = this.getPhoneNumber(message);
      if (phone) {
        phoneNumber = phone;
        const query = {
          fb_id: item?.from?.id,
        };
        const update = { $set: { phone: phone } };
        const options = { upsert: true };
        await this.customersService.updateOne(query, update, options);
      } else {
        phoneNumber = (await this.customersService.findOne(from?.id))?.phone;
      }

      const input = { ...item, phone: phoneNumber ?? null };

      data.push(input);
    }

    return data;
  }

  findLatestPost(posts) {
    let latestPost = null;
    let latestTime = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const postTime = new Date(post.created_time).getTime();

      if (postTime > latestTime) {
        latestTime = postTime;
        latestPost = post;
      }
    }

    return latestPost;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async changIp() {
    const { data } = await this.getKeyCodeProxy();
    const keyCode = data.data[0].key_code;

    return this.httpService.get(
      `https://mproxy.vn/capi/${tokenProxy}/key/${keyCode}/resetIp`,
    );
  }

  async getKeyCodeProxy() {
    const data = await this.httpService.get(
      `https://mproxy.vn/capi/${tokenProxy}/keys`,
    );

    return lastValueFrom(data);
  }

  getPosts(array1: any[], dataSocket: any[]) {
    const uniqueIds = new Set(array1.map((item: any) => item.id));
    const postNews = dataSocket
      .filter((item: any) => !uniqueIds.has(item.id))
      .map((item: any) => {
        return {
          ...item,
          isNew: true,
        };
      });

    const postOlds = this.posts.map((item: any) => {
      return {
        ...item,
        isNew: false,
      };
    });

    const combinedArray = [...postOlds, ...postNews];

    combinedArray.sort(function (a: any, b: any) {
      const dateA = new Date(a.created_time).getTime();
      const dateB = new Date(b.created_time).getTime();
      return dateB - dateA;
    });

    return combinedArray;
  }

  getPhoneNumber(inputString: string) {
    const phonePattern = /\d{10,11}/; // Biểu thức chính quy để tìm số điện thoại có độ dài từ 10 đến 11 chữ số

    const phoneNumber = inputString.match(phonePattern);

    if (phoneNumber) {
      return phoneNumber[0];
    } else {
      return null;
    }
  }
}
