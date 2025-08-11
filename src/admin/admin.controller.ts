import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { ADMIN_SERVICE, IAdminService } from './interfaces/IAdminService';
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PaginatedResponse, PlainResponse } from './interfaces/responce.interface';
import { ResponseJobsDto } from 'src/jobs/dtos/responce.job.dto';

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
  ){
    return await this._adminService.getAllCompnys(dto)
  }

  @Get('getAllcandidates')
  @UseGuards(AuthGuard('access_token'))
  async getAllCandidates(
    @Query() dto:PaginationDto
  ){
    return this._adminService.getAllCandidates(dto)
  }

  @Get('company/updatestatus')
  @UseGuards(AuthGuard('access_token')) 
  async updateStatus(
    @Query('id') id:string
  ){
    return this._adminService.updateCompanyStatus(id)
  }

  @Get('candidate/updatestatus')
  @UseGuards(AuthGuard('access_token'))
  async updateCandidateStatus(
    @Query('id') id:string
  ){
    return this._adminService.updateCandidateStatus(id)
  }

  @Get('jobs/getalljobs')
  @UseGuards(AuthGuard('access_token'))
  async GetAllJobs(
    @Query() parms:PaginationDto
  ):Promise<PaginatedResponse<ResponseJobsDto[]>>{
    return this._adminService.GetAllJobs(parms)
  }

  @Get('jobs/updatejobstatus')
  @UseGuards(AuthGuard('access_token'))
  async UpdateJobStatus(
    @Query('id') id:string
  ):Promise<PlainResponse>{
    return this._adminService.updateJobStatus(id)
  }
}
