import { HttpService } from '@nestjs/axios';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomersService } from 'src/customers/customers.service';
interface Message {
    name: string;
    postId: string;
    content: string;
    link: string;
    phone?: string;
    time?: Date;
    userId?: string;
}
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly httpService;
    private customersService;
    private posts;
    constructor(httpService: HttpService, customersService: CustomersService);
    server: Server;
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handle(posts: Message): Promise<{
        userId: string;
        phoneNumber: any;
    }>;
    getPhoneNumber(inputString: string): string;
    handleRemovmessageseMessage(client: Socket, payload: Message): Promise<void>;
}
export {};
