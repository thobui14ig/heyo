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
const jwt_1 = require("@nestjs/jwt");
const schedule_1 = require("@nestjs/schedule");
const websockets_1 = require("@nestjs/websockets");
const axios_1 = require("axios");
const dayjs = require("dayjs");
const socket_io_1 = require("socket.io");
const ids = [
    618114715010581, 452769581947089, 533851090781667, 296769157540088,
    382908015245608, 118056438849756, 309364699595518, 283314998828030,
    289369428379939, 1390167227872503,
];
const tokens = {
    0: `EAABwzLixnjYBO2Di31VKiRE5nDN6pfkOkj1t6ZBRtuxXmioodkveCy9YyhWkjQWKBBa5VYNwFu8PDbwGtdmKZB3qqpumSkQeLKm3OsCJWO3NJSDyWG4mCZAjfJ0ZAMKjMvk354UEiyxmQNZAlMyBOoK687Y7qZB9xKxqAn6w9ZBA7gq3fNNCGqklwGoLTK9yZBXNhawVznYZD`,
    1: `EAAAAUaZA8jlABOzSghVpegjolwM7XI4NQxnu847HjkuCksZCoMGHG8QrZColwYZAU5nopNyQZCD1sAJ4ZAyuCkHMvDllYTwAg807PEKFlP7P1a7wIOQowdFEYaiJZAMokJk4xnuOfmTlkx6XeHWwNBvYNHKGuiQIVrB8KLVrIez3I4dAGlANZCMZAhmyNMZCHO53SiZAgZDZD`,
};
let AppGateway = class AppGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.i = 0;
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
    async getPost() {
        try {
            const apis = ids.map((id) => {
                const api = `https://graph.facebook.com/v18.0/${id}/feed?access_token=${tokens[0]}&fields=created_time,message,id,from&limit=5`;
                return axios_1.default.get(api);
            });
            const data = await Promise.all(apis);
            const posts = data.map((items) => {
                const post = this.findLatestPost(items?.data?.data);
                return {
                    ...post,
                    groupId: post?.id.split('_')[0],
                    postId: post?.id.split('_')[1],
                    created_time: dayjs(post?.created_time).format('YYYY-MM-DD HH:mm:ss'),
                };
            });
            console.log(222, posts);
            void this.server.emit('nhandon', posts);
        }
        catch (error) {
            console.error(error);
        }
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
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, schedule_1.Cron)('*/6 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "getPost", null);
exports.AppGateway = AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: true,
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map