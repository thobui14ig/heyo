import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(auth: CreateAuthDto): string;
    signIn(email: any, pass: any, type?: 'web' | 'mobile'): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    createToken(payload: {
        email: string;
        userId: number;
        type: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refreshToken(refreshToken: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
