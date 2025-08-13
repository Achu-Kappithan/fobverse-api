import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { ADMIN_SERVICE, IAdminService } from './interfaces/IAdminService';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedResponse, PlainResponse } from './interfaces/responce.interface';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { CompanyProfileResponseDto } from '../company/dtos/responce.allcompany';
import { CandidateProfileResponseDto } from '../candiate/dtos/candidate-responce.dto';
import { AllJobsAdminResponce, ResponseJobsDto } from '../jobs/dtos/responce.job.dto';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly _adminService :IAdminService
  ) {}

  @Get('getallcompany')
  @UseGuards(AuthGuard('access_token'))
  async getAllcompany(
    @Query() dto:PaginationDto
  ):Promise<PaginatedResponse<CompanyProfileResponseDto[]>>{
    return await this._adminService.getAllCompnys(dto)
  }

  @Get('getAllcandidates')
  @UseGuards(AuthGuard('access_token'))
  async getAllCandidates(
    @Query() dto:PaginationDto
  ):Promise<PaginatedResponse<CandidateProfileResponseDto[]>>{
    return this._adminService.getAllCandidates(dto)
  }

  @Get('company/updatestatus')
  @UseGuards(AuthGuard('access_token')) 
  async updateStatus(
    @Query('id') id:string
  ):Promise<PlainResponse>{
    return this._adminService.updateCompanyStatus(id)
  }

  @Get('candidate/updatestatus')
  @UseGuards(AuthGuard('access_token'))
  async updateCandidateStatus(
    @Query('id') id:string
  ):Promise<PlainResponse>{
    return this._adminService.updateCandidateStatus(id)
  }

  @Get('jobs/getalljobs')
  @UseGuards(AuthGuard('access_token'))
  async getAllJobs(
    @Query() parms:PaginationDto
  ):Promise<PaginatedResponse<AllJobsAdminResponce[]>>{
    return this._adminService.getAllJobs(parms)
  }

  @Get('jobs/updatejobstatus')
  @UseGuards(AuthGuard('access_token'))
  async updateJobStatus(
    @Query('id') id:string
  ):Promise<PlainResponse>{
    return this._adminService.updateJobStatus(id)
  }
}
