import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Redirect, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AUTH_SERVICE, IAuthService } from "./interfaces/IAuthCandiateService";
import { LoginDto } from "./dto/login.dto";
import { RegisterCandidateDto } from "./dto/register-candidate.dto";


@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly  authService:IAuthService
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


    @Post('register/candidate')
    @HttpCode(HttpStatus.CREATED)
    async registerCandidate(@Body() registerDto: RegisterCandidateDto) {
        return this.authService.registerCandidate(registerDto);
    }

    @Get('verify-email')
    // @Redirect('http://localhost:4200/email-verified', HttpStatus.FOUND)
    async verifyEmail(@Query('token') token: string) {
        if (!token) {
        throw new BadRequestException('Verification token is missing.');
        }
        const result = await this.authService.verifyEmail(token);
        return result
    }
    
}