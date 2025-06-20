import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Redirect, Request, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AUTH_SERVICE, IAuthService } from "./interfaces/IAuthCandiateService";
import { LoginDto } from "./dto/login.dto";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { setJwtCookie } from "src/shared/utils/cookie.util";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";


@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly  authService:IAuthService,
        private readonly configservice:ConfigService
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body()LoginDto:LoginDto) {
        const user = await this.authService.validateUser(LoginDto.email,LoginDto.password)
        if(!user){
            throw new UnauthorizedException('Invalid credentials.')
        }
        return this.authService.login(user);
    }

    @UseGuards()
    @Get('profile')
    getProfile(@Request() req) {
        return { message: `Welcome, ${req.user.email}! This is a protected resource.`, user: req.user };
    }


    @Post('/candidate/register')
    @HttpCode(HttpStatus.CREATED)
    async registerCandidate(@Body() registerDto: RegisterCandidateDto) {
        return this.authService.registerCandidate(registerDto);
    }

    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        if (!token) {
        throw new BadRequestException('Verification token is missing.');
        }
        return await this.authService.verifyEmail(token);
    }

    @Post('candidate/login')
    async candidateLogin(@Body()loginDto:LoginDto,@Res({ passthrough: true }) response: Response){
        const {user,accessToken,refreshToken} = await this.authService.login(loginDto)

        setJwtCookie(
        response,this.configservice,
        'access_token',accessToken, 
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS',
        true 
        );

        setJwtCookie(
        response,this.configservice,
        'refresh_token',refreshToken,
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME_MS',
        true 
        );

        return {
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
            message: 'Login successful.'

        }
    }
    
}