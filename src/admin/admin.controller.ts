import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ADMIN_SERVICE, IAdminService } from './interfaces/IAdminService';
import { AuthGuard } from '@nestjs/passport';
import {
  PaginatedResponse,
  PlainResponse,
} from './interfaces/responce.interface';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import {
  CompanyProfileResponseDto,
  UserResponceDto,
} from '../company/dtos/responce.allcompany';
import { CandidateProfileResponseDto } from '../candiate/dtos/candidate-responce.dto';
import { AllJobsAdminResponce } from '../jobs/dtos/responce.job.dto';
import { ApiResponce } from '../shared/interface/api.responce';
import { Request as ERequest } from 'express';
import { changePassDto } from '../company/dtos/update.profile.dtos';
import { generalResponce } from '../auth/interfaces/api-response.interface';
import { UpdateAdminProfileDto } from './dtos/admin-profile.dto';
import { AdminDashboardDto } from './dtos/admin-dashboard.dto';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly _adminService: IAdminService,
  ) {}

  @Get('getallcompany')
  @UseGuards(AuthGuard('access_token'))
  async getAllcompany(
    @Query() dto: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    return await this._adminService.getAllCompnys(dto);
  }

  @Get('getAllcandidates')
  @UseGuards(AuthGuard('access_token'))
  async getAllCandidates(
    @Query() dto: PaginationDto,
  ): Promise<PaginatedResponse<CandidateProfileResponseDto[]>> {
    return this._adminService.getAllCandidates(dto);
  }

  @Get('company/updatestatus')
  @UseGuards(AuthGuard('access_token'))
  async updateStatus(@Query('id') id: string): Promise<PlainResponse> {
    return this._adminService.updateCompanyStatus(id);
  }

  @Get('candidate/updatestatus')
  @UseGuards(AuthGuard('access_token'))
  async updateCandidateStatus(@Query('id') id: string): Promise<PlainResponse> {
    return this._adminService.updateCandidateStatus(id);
  }

  @Get('jobs/getalljobs')
  @UseGuards(AuthGuard('access_token'))
  async getAllJobs(
    @Query() parms: PaginationDto,
  ): Promise<PaginatedResponse<AllJobsAdminResponce[]>> {
    return this._adminService.getAllJobs(parms);
  }

  @Get('jobs/updatejobstatus')
  @UseGuards(AuthGuard('access_token'))
  async updateJobStatus(@Query('id') id: string): Promise<PlainResponse> {
    return this._adminService.updateJobStatus(id);
  }

  @Get('profile')
  @UseGuards(AuthGuard('access_token'))
  async getProfie(
    @Request() request: ERequest,
  ): Promise<ApiResponce<UserResponceDto>> {
    const user = request.user as { _id: string };
    return this._adminService.getAdminProfile(user._id.toString());
  }

  @Post('updatepassword')
  @UseGuards(AuthGuard('access_token'))
  async UpdatePassword(
    @Body() dto: changePassDto,
    @Request() req: ERequest,
  ): Promise<generalResponce> {
    const user = req.user as { _id: string };
    return await this._adminService.updatePassword(user._id.toString(), dto);
  }

  @Post('updateprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateUserProfile(
    @Body() dto: UpdateAdminProfileDto,
    @Request() req: ERequest,
  ): Promise<ApiResponce<UserResponceDto>> {
    const user = req.user as { _id: string };
    return this._adminService.upateUserProfile(user._id.toString(), dto);
  }

  @Get('dashboard-stats')
  @UseGuards(AuthGuard('access_token'))
  async getDashboardStats(): Promise<ApiResponce<AdminDashboardDto>> {
    return this._adminService.getDashboardStats();
  }
}
