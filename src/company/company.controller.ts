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
  @Get('profile')
  @UseGuards(AuthGuard('access_token'))
  async getProfile(
    @Request() req: ERequest,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const user = req.user;
    const companyId = user?.companyId?.toString() ?? '';
    return this._companyService.getProfile(companyId);
  }
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
  @Post('createuser')
  @UseGuards(AuthGuard('access_token'))
  async createUser(@Request() req: ERequest, @Body() dto: InternalUserDto) {
    const companyId = req.user?.companyId?.toString() ?? '';
    return await this._companyService.createUser(companyId, dto);
  }
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
  @Get('hrusers')
  @UseGuards(AuthGuard('access_token'))
  async getHrUsers(
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const user = req.user;
    const companyId = user?.companyId?.toString();
    return await this._companyService.getHrUsers(companyId!);
  }
  @Get('interviewers')
  @UseGuards(AuthGuard('access_token'))
  async getInterviewers(
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    const user = req.user;
    const companyId = user?.companyId?.toString();
    return await this._companyService.getInterviewers(companyId!);
  }
  @Get('userprofile')
  @UseGuards(AuthGuard('access_token'))
  async getUserProfile(
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = req.user;
    return this._companyService.getUserProfile(user!._id.toString());
  }
  @Post('updateuserprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateUserProfile(
    @Body() dto: UpdateInternalUserDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = req.user;
    return this._companyService.updateUserProfile(user!._id.toString(), dto);
  }
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
  @Post('addteammember')
  @UseGuards(AuthGuard('access_token'))
  async addTeamMembers(
    @Request() req: ERequest,
    @Body() dto: TeamMemberDto,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._companyService.addTeamMembers(companyId.toString(), dto);
  }
  @Get('public/profile/:id')
  async getPublicProfile(
    @Param('id') id: string,
  ): Promise<ApiResponse<populateProfileDto>> {
    return this._companyService.getPublicProfile(id);
  }
  @Delete('removeuser')
  @UseGuards(AuthGuard('access_token'))
  async removeUser(@Query('id') id: string): Promise<ApiResponse<unknown>> {
    return this._companyService.removeUser(id);
  }
  @Get('dashboard')
  @UseGuards(AuthGuard('access_token'))
  async getDashboard(
    @Request() req: ERequest,
  ): Promise<ApiResponse<DashboardResponseDto>> {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._companyService.getDashboardData(companyId);
  }
}
