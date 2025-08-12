import { Body, Controller, Get, Inject, Post, Query, Request, UseGuards } from '@nestjs/common';
import { IJobService, JOBS_SERVICE } from './interfaces/jobs.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { createJobsDto } from './dtos/createjobs.dto';
import { ApiResponce } from 'src/shared/interface/api.responce';
import { ResponseJobsDto } from './dtos/responce.job.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PaginatedResponse } from 'src/admin/interfaces/responce.interface';
import { Request as ERequest } from 'express';

@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(JOBS_SERVICE)
    private readonly _jobservices:IJobService
  ){}

  @Post('createjob')
  @UseGuards(AuthGuard('access_token'))
  async createJobs(
    @Body() dto:createJobsDto,
    @Request() req:ERequest
  ):Promise<ApiResponce<ResponseJobsDto>>{
    const companyId = req.user?.companyId?.toString() ?? ""
    return this._jobservices.createJobs(companyId.toString(),dto)
  }

  @Get('getalljobs')
  @UseGuards(AuthGuard('access_token'))
  async getAllJobs(
    @Query() parms:PaginationDto,
    @Request() req:ERequest
  ):Promise<PaginatedResponse<ResponseJobsDto[]>>{
    const companyId = req.user?.companyId?.toString() ?? ""
    return this._jobservices.getAllJobs(companyId.toString(),parms)
  }

  @Get('jobdetails')
  @UseGuards(AuthGuard('access_token'))
  async getjobDetails(
    @Query('id')id:string,
  ){
    return this._jobservices.getJobDetails(id)
  }
}
