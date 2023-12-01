"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const axios_1 = require("@nestjs/axios");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const customers_service_1 = require("../customers/customers.service");
const ids = [
    618114715010581,
    533851090781667,
    296769157540088,
    382908015245608,
    118056438849756,
    309364699595518,
    289369428379939,
    1390167227872503,
];
let AppGateway = class AppGateway {
    constructor(httpService, customersService) {
        this.httpService = httpService;
        this.customersService = customersService;
        this.posts = [];
    }
    afterInit(server) {
        console.log('Socket.IO server initialized');
    }
    async handleConnection(client) {
        console.log('connectionnnnnnnnnnnn');
    }
    handleDisconnect(client) {
        console.log('Ngat ket noi!.', client.id);
    }
    async handle(posts) {
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
        }
        else {
            phoneNumber = (await this.customersService.findOne(userId))?.phone;
        }
        return {
            userId,
            phoneNumber: phoneNumber ?? null,
        };
    }
    getPhoneNumber(inputString) {
        const phonePattern = /\d{10,11}/;
        const phoneNumber = inputString?.match(phonePattern);
        if (phoneNumber) {
            return phoneNumber[0];
        }
        else {
            return null;
        }
    }
    async handleRemovmessageseMessage(client, payload) {
        const { phoneNumber, userId } = await this.handle(payload);
        const check = this.posts.find((item) => item.postId === payload.postId);
        if (!check) {
            payload = { ...payload, phone: phoneNumber, userId, time: new Date() };
            if (this.posts.length === 20) {
                this.posts.shift();
            }
            this.posts.push(payload);
            void this.server.emit('nhandon', this.posts.reverse());
        }
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleRemovmessageseMessage", null);
exports.AppGateway = AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: true,
    }),
    __metadata("design:paramtypes", [axios_1.HttpService,
        customers_service_1.CustomersService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map