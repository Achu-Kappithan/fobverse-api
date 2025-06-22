import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Inject, Logger, Post, Query, Req, Request, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AUTH_SERVICE, IAuthService } from "./interfaces/IAuthCandiateService";
import { LoginDto } from "./dto/login.dto";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { UserDocument } from "src/candidates/schema/candidate.schema";
import { JwtAccessPayload, JwtRefreshPayload } from "./interfaces/jwt-payload.interface";
import { setJwtCookie } from "src/shared/utils/cookie.util";


@Controller('auth')
export class AuthController {
    logger = new Logger(AuthController.name)
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly  authService:IAuthService,
        private readonly ConfigService:ConfigService
    ) {}


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
    @HttpCode(HttpStatus.OK)
    async Login(@Body()loginDto:LoginDto,@Res({ passthrough: true }) response: Response){
        const user = await this.authService.validateUser(loginDto.email,loginDto.password)
        const {accessToken,refreshToken,userData} =await this.authService.login(user)

        setJwtCookie(
        response,this.ConfigService,
        'access_token',accessToken, 
        'JWT_ACCESS_EXPIRES_IN',
        true,
        (7*24*60*60*1000)
        );

        setJwtCookie(
        response,this.ConfigService,
        'refresh_token',refreshToken,
        'JWT_REFRESH_EXPIRES_IN',
        true,
        (7*24*60*60*1000)
        );

        return {
            message: 'Login successful.'
        }
    }

    @Get('getuser')
    @UseGuards(AuthGuard('access_token'))
    @HttpCode(HttpStatus.OK)
     getCurrentUser(@Request() req:any){
        const user  = req.user as UserDocument
        console.log(user)
        return {
            id : user.id,
            role: user.role,
            email: user.email,
            is_verified: user.isVerified,
            message:"completed"
        }
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt-refresh'))
    async refreshTokens(@Req() req: any, @Res({ passthrough: true }) response: Response): Promise<any> {
        const candidate = req.user as JwtRefreshPayload;
        
        const {newAccess,message} = await this.authService.regenerateAccessToken(candidate)

        setJwtCookie(
        response,this.ConfigService,
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