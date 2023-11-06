/* eslint-disable @typescript-eslint/no-var-requires */
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
import puppeteer from 'puppeteer';
const fs = require('fs');
const { JSDOM } = require('jsdom');

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
  private browser = null;
  private isLogin = false;
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
      await this.loginFacebook();
      await this.getDatePuppeteer();
      console.log(1111);
    } catch (error) {
      console.log(222, error);
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

    const phoneNumber = inputString?.match(phonePattern);

    if (phoneNumber) {
      return phoneNumber[0];
    } else {
      return null;
    }
  }

  async getDatePuppeteer() {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.goto(
      `https://www.facebook.com/groups/shipperdanang?sorting_setting=CHRONOLOGICAL`,
    );

    // Đọc nội dung trang web
    const content = await page.evaluate(() => {
      return document.body.innerHTML;
    });

    const duongDan = '123.txt';

    // Sử dụng phương thức writeFile để ghi chuỗi vào tệp tin
    // fs.writeFile(duongDan, content, (err) => {
    //   if (err) {
    //     console.error('Lỗi khi ghi tệp tin:', err);
    //   }
    // });
    await page.close();
    const ten = this.getTen(content);
    const postId = this.getPostId(content);
    await this.getNoiDung(content);
    console.log(2222, { ten: ten, postId: postId });

    return content;
  }

  async getBrowser() {
    if (!this.browser) {
      const browser = await puppeteer.launch({ headless: false });
      this.browser = browser;
    }

    return this.browser;
  }

  async loginFacebook() {
    console.log(999, this.isLogin);
    if (!this.isLogin) {
      this.isLogin = true;
      const browser = await this.getBrowser();
      const page = await browser.newPage();

      // Navigate to Facebook's login page
      await page.goto('https://www.facebook.com/');

      // Enter your email/phone and password
      await page.type('#email', '0822423246');
      await page.type('#pass', 'Thitanh98@');

      // Click the login button
      await page.click('button[name="login"]');

      // Wait for the login to complete (you may need to adjust the selector and wait time)
      await page.waitForSelector('YOUR_LOGGED_IN_USER_SELECTOR');
      await page.close();
    }
  }

  getTen(inputString) {
    // Biểu thức chính quy để trích xuất giá trị nằm trong cặp chuỗi <strong><span> và </span></strong>
    const regex = /<strong><span>(.*?)<\/span><\/strong>/;

    // Sử dụng phương thức match() để tìm các kết quả khớp với biểu thức chính quy
    const matches = inputString.match(regex);

    if (matches && matches.length > 1) {
      // Giá trị bạn cần nằm ở trong matches[1]
      const extractedValue = matches[1];
      return extractedValue;
    } else {
      return null;
    }
  }

  getPostId(inputString) {
    // Biểu thức chính quy để trích xuất giá trị của "post_id"
    const regex = /"post_id":"(\d+)"/;

    // Sử dụng phương thức match() để tìm các kết quả khớp với biểu thức chính quy
    const matches = inputString.match(regex);

    if (matches && matches.length > 1) {
      // Giá trị "post_id" bạn cần nằm ở trong matches[1]
      const postIdValue = matches[1];
      return postIdValue;
    } else {
      return null;
    }
  }

  getNoiDung(inputString) {

    // Tạo một DOMParser để phân tích chuỗi HTML thành cây DOM ảo
    const dom1 = new JSDOM(inputString);

    // Sử dụng document của dom1 và dom2 để tìm các phần tử theo lớp CSS
    const elements1 = dom1.window.document.querySelectorAll(
      '.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs',
    );


    // Lấy nội dung bên trong các phần tử tìm thấy
    const content1 = elements1[0]?.textContent;


    console.log(22222, content1); // In ra "Xin chào" từ chuỗi str1
  }
}
