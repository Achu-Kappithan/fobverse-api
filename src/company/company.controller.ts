import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  COMPANY_SERVICE,
  IComapnyService,
} from './interface/profile.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../shared/responses/api.response';
import {
  CompanyProfileResponseDto,
  UserResponseDto,
} from './dtos/response.allcompany';
import {
  changePassDto,
  InternalUserDto,
  TeamMemberDto,
  UpdateInternalUserDto,
  UpdateProfileDto,
} from './dtos/update.profile.dtos';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { ERequest } from '../shared/interfaces/auth.interface';
import { populateProfileDto } from './dtos/populatedprofile.res.dto';
import { DashboardResponseDto } from './dtos/dashboard.dto';
@Controller('company')
export class CompanyController {
  constructor(
    @Inject(COMPANY_SERVICE)
    private readonly _companyService: IComapnyService,
  ) {}
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('profile')
  @UseGuards(AuthGuard('access_token'))
  async getProfile(
    @Request() req: ERequest,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const user = req.user;
    const companyId = user?.companyId?.toString() ?? '';
    return this._companyService.getProfile(companyId);
  }
  // 10 requests per 1 minute — profile update spam prevention
  @Throttle({ 'write-moderate': { limit: 10, ttl: 60000 } })
  @Patch('updateprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateProfile(
    @Request() req: ERequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const user = req.user;
    const companyId = user?.companyId?.toString() ?? '';
    return this._companyService.updateProfile(companyId, dto);
  }
  // 10 requests per 1 minute — prevent internal user creation spam
  @Throttle({ 'write-moderate': { limit: 10, ttl: 60000 } })
  @Post('createuser')
  @UseGuards(AuthGuard('access_token'))
  async createUser(@Request() req: ERequest, @Body() dto: InternalUserDto) {
    const companyId = req.user?.companyId?.toString() ?? '';
    return await this._companyService.createUser(companyId, dto);
  }
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('internalusers')
  @UseGuards(AuthGuard('access_token'))
  async getInternalUsers(
    @Request() req: ERequest,
    @Query() parms: PaginationDto,
  ) {
    const user = req.user;
    return this._companyService.getInternalUsers(
      user!.companyId!.toString(),
      user!._id.toString(),
      parms,
    );
  }
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('hrusers')
  @UseGuards(AuthGuard('access_token'))
  async getHrUsers(
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const user = req.user;
    const companyId = user?.companyId?.toString();
    return await this._companyService.getHrUsers(companyId!);
  }
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('interviewers')
  @UseGuards(AuthGuard('access_token'))
  async getInterviewers(
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const user = req.user;
    const companyId = user?.companyId?.toString();
    return await this._companyService.getInterviewers(companyId!);
  }
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('userprofile')
  @UseGuards(AuthGuard('access_token'))
  async getUserProfile(
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = req.user;
    return this._companyService.getUserProfile(user!._id.toString());
  }
  // 10 requests per 1 minute — prevent profile mutation spam
  @Throttle({ 'write-moderate': { limit: 10, ttl: 60000 } })
  @Post('updateuserprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateUserProfile(
    @Body() dto: UpdateInternalUserDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = req.user;
    return this._companyService.updateUserProfile(user!._id.toString(), dto);
  }
  // 5 requests per 15 minutes — password change brute-force protection
  @Throttle({ 'auth-strict': { limit: 5, ttl: 900000 } })
  @Post('updatepassword')
  @UseGuards(AuthGuard('access_token'))
  async UpdatePassword(
    @Body() dto: changePassDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<unknown>> {
    return await this._companyService.updatePassword(
      req.user!._id.toString(),
      dto,
    );
  }
  // 10 requests per 1 minute — prevent team member spam
  @Throttle({ 'write-moderate': { limit: 10, ttl: 60000 } })
  @Post('addteammember')
  @UseGuards(AuthGuard('access_token'))
  async addTeamMembers(
    @Request() req: ERequest,
    @Body() dto: TeamMemberDto,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._companyService.addTeamMembers(companyId.toString(), dto);
  }
  // 30 requests per 1 minute — unauthenticated public endpoint, scraping risk
  @Throttle({ 'read-public': { limit: 30, ttl: 60000 } })
  @Get('public/profile/:id')
  async getPublicProfile(
    @Param('id') id: string,
  ): Promise<ApiResponse<populateProfileDto>> {
    return this._companyService.getPublicProfile(id);
  }
  // 60 requests per 1 minute — standard authenticated write (user management)
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Delete('removeuser')
  @UseGuards(AuthGuard('access_token'))
  async removeUser(@Query('id') id: string): Promise<ApiResponse<unknown>> {
    return this._companyService.removeUser(id);
  }
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('dashboard')
  @UseGuards(AuthGuard('access_token'))
  async getDashboard(
    @Request() req: ERequest,
  ): Promise<ApiResponse<DashboardResponseDto>> {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._companyService.getDashboardData(companyId);
  }
}
