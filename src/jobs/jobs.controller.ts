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
import { ResponseJobsDto } from './dtos/response.job.dto';
import {
  ApiResponse,
  PaginatedResponse,
} from '../shared/responses/api.response';
import { ERequest } from '../shared/interfaces/auth.interface';
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
  ): Promise<ApiResponse<ResponseJobsDto>> {
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
  ): Promise<ApiResponse<ResponseJobsDto>> {
    return this._jobservices.updateJobDetails(id.toString(), dto);
  }
  @Get('publicview')
  async jobPublicView(@Query('id') id: string) {
    return this._jobservices.populatedJobView(id);
  }
  @Get('getalljobs-public')
  async getAllJobsPublic(
    @Query() parms: jobsPagesAndFilterDto,
  ): Promise<PaginatedResponse<ResponseJobsDto[]>> {
    return this._jobservices.getAllJobs('', parms);
  }
}
