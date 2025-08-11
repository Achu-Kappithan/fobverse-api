import { Body, Controller, Get, Inject, Post, Query, Request, UseGuards } from '@nestjs/common';
import { IJobService, JOBS_SERVICE } from './interfaces/jobs.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { createJobsDto } from './dtos/createjobs.dto';
import { ApiResponce } from 'src/shared/interface/api.responce';
import { ResponseJobsDto } from './dtos/responce.job.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PaginatedResponse } from 'src/admin/interfaces/responce.interface';

@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(JOBS_SERVICE)
    private readonly _jobservices:IJobService
  ){}

  @Post('createjob')
  @UseGuards(AuthGuard('access_token'))
  async CreateJobs(
    @Body() dto:createJobsDto,
    @Request() req:any
  ):Promise<ApiResponce<ResponseJobsDto>>{
    const user = req.user
    return this._jobservices.CreateJobs(user.companyId.toString(),dto)
  }

  @Get('getalljobs')
  @UseGuards(AuthGuard('access_token'))
  async GetAllJobs(
    @Query() parms:PaginationDto,
    @Request() req:any
  ):Promise<PaginatedResponse<ResponseJobsDto[]>>{
    const user = req.user
    return this._jobservices.getAllJobs(user.companyId.toString(),parms)
  }

  @Get('jobdetails')
  @UseGuards(AuthGuard('access_token'))
  async GetjobDetails(
    @Query('id')id:string,
    @Request() req:any
  ){
    const user = req.user
    console.log(id)
    return this._jobservices.getJobDetails(id)
  }
}
