import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AUTH_SERVICE, IAuthService } from './interfaces/IAuthCandiateService';
import { forgotPasswordDto, LoginDto, UpdatePasswordDto } from './dto/login.dto';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { setJwtCookie } from 'src/shared/utils/cookie.util';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { UserDocument } from './schema/user.schema';

@Controller('auth')
export class AuthController {
  logger = new Logger(AuthController.name);
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: `Welcome, ${req.user.email}! This is a protected resource.`,
      user: req.user,
    };
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerCandidate(@Body() registerDto: RegisterCandidateDto) {
    return this.authService.registerCandidate(registerDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async Login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.role,
    );
    const { accessToken, refreshToken, data } =
      await this.authService.login(user);

    setJwtCookie(
      response,
      this.configService,
      'access_token',
      accessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    setJwtCookie(
      response,
      this.configService,
      'refresh_token',
      refreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      7 * 24 * 60 * 60 * 1000,
    );

    return {
      message:MESSAGES.AUTH.LOGIN_SUCCESS,
      data,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message:MESSAGES.AUTH.LOGOUT_SUCCESS };
  }

  @Get('getuser')
  @UseGuards(AuthGuard('access_token'))
  @HttpCode(HttpStatus.OK)
  getCurrentUser(@Request() req: any) {
    const user = req.user as UserDocument;
    this.logger.log(`User details from getuser: ${JSON.stringify(user)}`);
    return {
      id: user.id,
      role: user.role,
      email: user.email,
      is_verified: user.isVerified,
      profileImg:user.profileImg,
      message: 'completed',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshTokens(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const candidate = req.user as UserDocument;

    const { newAccess, message } =
      await this.authService.regenerateAccessToken(candidate);

    setJwtCookie(
      response,
      this.configService,
      'access_token',
      newAccess,
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME_MS',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    return {
      accessToken: newAccess,
      message: message,
    };
  }

  @Get('google')
  @HttpCode(HttpStatus.ACCEPTED)
  async googleAuthCallback(
    @Query() query: { googleId: string; role: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const { accessToken, refreshToken, data } =
      await this.authService.googleLogin(query.googleId, query.role);
    this.logger.log(`user  details in googleauth ${data} `);

    setJwtCookie(
      response,
      this.configService,
      'access_token',
      accessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    setJwtCookie(
      response,
      this.configService,
      'refresh_token',
      refreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      7 * 24 * 60 * 60 * 1000,
    );

    return {
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data,
    };
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateAdmin(dto);
    const { accessToken, refreshToken, data } =
      await this.authService.login(user);

    setJwtCookie(
      response,
      this.configService,
      'access_token',
      accessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      7 * 24 * 60 * 60 * 1000,
    );

    setJwtCookie(
      response,
      this.configService,
      'refresh_token',
      refreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      7 * 24 * 60 * 60 * 1000,
    );

    return {
      id: data?._id.toString(),
      role: data?.role,
      email: data?.email,
      message:MESSAGES.AUTH.LOGIN_SUCCESS
    };
  }


  @Post('companyuserslogin')
  async companyUsersLogin(
    @Body()dto:LoginDto,
    @Res({ passthrough: true }) res:Response
  ){
    const {data ,accessToken,refreshToken } = await this.authService.companyUserLogin(dto)
    setJwtCookie(
      res,
      this.configService,
      'access_token',
      accessToken,
      'JWT_ACCESS_EXPIRES_IN',
      true,
      7 * 24 * 60 * 60 * 1000,
    );


    setJwtCookie(
      res,
      this.configService,
      'refresh_token',
      refreshToken,
      'JWT_REFRESH_EXPIRES_IN',
      false,
      7 * 24 * 60 * 60 * 1000,
    );
    return {
      message:MESSAGES.AUTH.LOGIN_SUCCESS,
      data:data
    }
  }

  @Post('forgotpassword')
  @HttpCode(HttpStatus.CREATED)
  async updatePassword( @Body() dto:forgotPasswordDto){
    return this.authService.validateEmailAndRoleExistence(dto)
  }

  @Post('updatepassword')
  async updateNewPassword(@Body() dto:UpdatePasswordDto){
    return this.authService.UpdateNewPassword(dto)
  }
}
