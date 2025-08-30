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
import { IJobService, JOBS_SERVICE } from './interfaces/jobs.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { ResponseJobsDto } from './dtos/responce.job.dto';
import { ApiResponce, ERequest } from '../shared/interface/api.responce';
import { PaginatedResponse } from '../admin/interfaces/responce.interface';
import { JobsDto, jobsPagesAndFilterDto } from './dtos/createjobs.dto';

@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(JOBS_SERVICE)
    private readonly _jobservices: IJobService,
  ) {}

  @Post('createjob')
  @UseGuards(AuthGuard('access_token'))
  async createJobs(
    @Body() dto: JobsDto,
    @Request() req: ERequest,
  ): Promise<ApiResponce<ResponseJobsDto>> {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._jobservices.createJobs(companyId.toString(), dto);
  }

  @Get('getalljobs')
  @UseGuards(AuthGuard('access_token'))
  async getAllJobs(
    @Query() parms: jobsPagesAndFilterDto,
    @Request() req: ERequest,
  ): Promise<PaginatedResponse<ResponseJobsDto[]>> {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._jobservices.getAllJobs(companyId.toString(), parms);
  }

  @Get('jobdetails')
  @UseGuards(AuthGuard('access_token'))
  async getjobDetails(@Query('id') id: string) {
    return this._jobservices.getJobDetails(id);
  }

  @Post('updatejob')
  @UseGuards(AuthGuard('access_token'))
  async updateJobDetails(
    @Query('id') id: string,
    @Body() dto: JobsDto,
  ): Promise<ApiResponce<ResponseJobsDto>> {
    return this._jobservices.updateJobDetails(id.toString(), dto);
  }

  @Get('publicview')
  @UseGuards(AuthGuard('access_token'))
  async jobPublicView(@Query('id') id: string) {
    return this._jobservices.populatedJobView(id);
  }
}
