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
import { ConfigService } from '@nestjs/config';
import { AUTH_SERVICE, IAuthService } from './interfaces/IAuthCandiateService';
import {
  forgotPasswordDto,
  LoginDto,
  UpdatePasswordDto,
} from './dto/login.dto';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request as ERequest, Response } from 'express';
import { ApiResponse } from '../shared/responses/api.response';
import { userDto } from './dto/user.dto';
import { MESSAGES } from '../shared/constants/constants.messages';
import { CurrentUserDto } from '../shared/dtos/user-response.dto';
import { UserDocument } from './schema/user.schema';
@Controller('auth')
export class AuthController {
  logger = new Logger(AuthController.name);
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
    private readonly _configService: ConfigService,
  ) {}
  @Get('profile')
  getProfile(@Request() req: ERequest) {
    const user = req.user as { email: string };
    return {
      message: `Welcome, ${user.email}! This is a protected resource.`,
      user: user,
    };
  }
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerCandidate(@Body() registerDto: RegisterCandidateDto) {
    return this._authService.registerCandidate(registerDto);
  }
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return await this._authService.verifyEmail(token);
  }
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async Login(
    @Body() Dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this._authService.validateUser(
      Dto.email,
      Dto.password,
      Dto.role,
    );
    return this._authService.login(user, response);
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction =
      this._configService.get<string>('NODE_ENV') === 'production';
    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'none' | 'lax';
      domain?: string;
      path: string;
    } = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.achuu.online' : undefined,
      path: '/',
    };
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', { ...cookieOptions, httpOnly: false });
    return { message: MESSAGES.AUTH.LOGOUT_SUCCESS };
  }
  @Get('getuser')
  @UseGuards(AuthGuard('access_token'))
  @HttpCode(HttpStatus.OK)
  getCurrentUser(@Request() req: ERequest) {
    const user = req.user as CurrentUserDto;
    return {
      id: user?.id.toString(),
      role: user?.role,
      email: user?.email,
      name: user?.name,
      is_verified: user?.is_verified,
      profileImg: user?.profileImg,
      message: 'completed',
    };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  refreshTokens(
    @Req() req: ERequest,
    @Res({ passthrough: true }) response: Response,
  ): ApiResponse<unknown> {
    const user = req.user as UserDocument;
    return this._authService.regenerateAccessToken(user, response);
  }
  @Get('google')
  @HttpCode(HttpStatus.ACCEPTED)
  async googleAuthCallback(
    @Query() query: { googleId: string; role: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse<userDto>> {
    return this._authService.googleLogin(query.googleId, query.role, response);
  }
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse<userDto>> {
    const user = await this._authService.validateAdmin(dto);
    return this._authService.login(user, response);
  }
  @Post('companyuserslogin')
  async companyUsersLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this._authService.companyUserLogin(dto, res);
  }
  @Post('forgotpassword')
  @HttpCode(HttpStatus.CREATED)
  async updatePassword(
    @Body() dto: forgotPasswordDto,
  ): Promise<ApiResponse<unknown>> {
    return this._authService.validateEmailAndRoleExistence(dto);
  }
  @Post('updatepassword')
  async updateNewPassword(
    @Body() dto: UpdatePasswordDto,
  ): Promise<ApiResponse<unknown>> {
    return this._authService.updateNewPassword(dto);
  }
}
