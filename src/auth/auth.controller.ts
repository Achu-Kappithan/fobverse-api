import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Redirect, Req, Request, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AUTH_SERVICE, IAuthService } from "./interfaces/IAuthCandiateService";
import { LoginDto } from "./dto/login.dto";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { setJwtCookie } from "src/shared/utils/cookie.util";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { get } from "http";
import { UserDocument } from "src/candidates/schema/candidate.schema";
import { JwtRefreshPayload } from "./interfaces/jwt-payload.interface";


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
        const {accessToken,refreshToken} = await this.authService.login(loginDto)

        setJwtCookie(
        response,this.configservice,
        'access_token',accessToken, 
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS',
        true,
        (7*24*60*60*1000)
        );

        setJwtCookie(
        response,this.configservice,
        'refresh_token',refreshToken,
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME_MS',
        true ,
        (7*24*60*60*1000)
        );

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            message: 'Login successful.'
        }
    }

    @Get('getuser')
    @UseGuards(AuthGuard('access_token'))
    @HttpCode(HttpStatus.OK)
     getCurrentUser(@Request() req:any){
        const user  = req.user as UserDocument
        return {user:user,message:"completed"}
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt-refresh'))
    async refreshTokens(@Req() req: any, @Res({ passthrough: true }) response: Response): Promise<any> {
        const candidate = req.user as JwtRefreshPayload;
        
        const {newAccess,message} = await this.authService.regenerateAccessToken(candidate)

        setJwtCookie(
        response,this.configservice,
        'access_token',newAccess, 
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS',
        true,
        (7*24*60*60*1000)
        );

        return {
        accessToken: newAccess,
        message: message,
        };
    }

    
}