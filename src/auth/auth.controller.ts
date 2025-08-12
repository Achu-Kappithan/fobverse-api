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
import { AuthGuard } from '@nestjs/passport';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { Request as ERequest, Response } from 'express';
import { generalResponce, LoginResponce, tokenresponce } from './interfaces/api-response.interface';
import { userDto } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  logger = new Logger(AuthController.name);
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
  ) {}


  @Get('profile')
  getProfile(@Request() req:ERequest) {
    return {
      message: `Welcome, ${req.user!.email}! This is a protected resource.`,
      user: req.user,
    };
  }


  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerCandidate(@Body() registerDto: RegisterCandidateDto){
    return this._authService.registerCandidate(registerDto);
  }


  @Get('verify-email')
  async verifyEmail(@Query('token') token: string){
    return await this._authService.verifyEmail(token);
  }


  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async Login(
    @Body() Dto: LoginDto,
    @Res({ passthrough: true }) response:Response,
  ){
    const user = await this._authService.validateUser(Dto.email,Dto.password,Dto.role,);
    return this._authService.login(user,response);
  }


  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response){
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message:MESSAGES.AUTH.LOGOUT_SUCCESS };
  }


  @Get('getuser')
  @UseGuards(AuthGuard('access_token'))
  @HttpCode(HttpStatus.OK)
  getCurrentUser(@Request() req:ERequest){
    const user = req.user 
    return {
      id: user?.id,
      role: user?.role,
      email: user?.email,
      is_verified: user?.isVerified,
      profileImg:user?.profileImg,
      message: 'completed',
    };
  }


  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshTokens(
    @Req() req: ERequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<tokenresponce> {
    const user = req.user 
    return this._authService.regenerateAccessToken(user!,response);
  }


  @Get('google')
  @HttpCode(HttpStatus.ACCEPTED)
  async googleAuthCallback(
    @Query() query: { googleId: string; role: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponce<userDto>> {
    return  this._authService.googleLogin(query.googleId, query.role,response);
  }


  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ):Promise<LoginResponce<userDto>> {
    const user = await this._authService.validateAdmin(dto);
    return this._authService.login(user,response);
  }


  @Post('companyuserslogin')
  async companyUsersLogin(
    @Body()dto:LoginDto,
    @Res({ passthrough: true }) res:Response
  ){
    return this._authService.companyUserLogin(dto,res)
  }


  @Post('forgotpassword')
  @HttpCode(HttpStatus.CREATED)
  async updatePassword( @Body() dto:forgotPasswordDto):Promise<generalResponce>{
    return this._authService.validateEmailAndRoleExistence(dto)
  }


  @Post('updatepassword')
  async updateNewPassword(@Body() dto:UpdatePasswordDto):Promise<generalResponce>{
    return this._authService.updateNewPassword(dto)
  }
}
