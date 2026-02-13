import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CANDIDATE_SERVICE,
  ICandidateService,
} from './interfaces/candidate-service.interface';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCandidateProfileDto } from './dtos/update-candidate-profile.dto';
import { Request as ERequest } from 'express';
import { CandidateProfileResponseDto } from './dtos/candidate-response.dto';
import { CompanyProfileResponseDto } from '../company/dtos/response.allcompany';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../shared/responses/api.response';
import { CandidateApplicationResponseDto } from '../applications/dtos/candidate-application.response.dto';
import { CandidateApplicationsQueryDto } from '../applications/dtos/candidate-applications-query.dto';
import { AllStagesResponseDto } from '../interview/dtos/all-stages-response.dto';
import { changePassDto } from '../company/dtos/update.profile.dtos';
import { ApiResponse } from '../shared/responses/api.response';
import { ResponseJobsDto } from '../jobs/dtos/response.job.dto';
@Controller('candidate')
export class CandidateController {
  constructor(
    @Inject(CANDIDATE_SERVICE)
    private readonly _candidateService: ICandidateService,
  ) {}
  @Get('getprofile')
  @UseGuards(AuthGuard('access_token'))
  async getProfile(
    @Request() req: ERequest,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    const user = req.user as { id: string };
    return this._candidateService.getProfile(user.id);
  }
  @Post('updateprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateProfile(
    @Body() dto: UpdateCandidateProfileDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    const user = req.user as { id: string };
    return this._candidateService.updateProfile(dto, user.id);
  }
  @Get('/public/profile')
  @UseGuards(AuthGuard('access_token'))
  async publicView(
    @Query('id') id: string,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    return this._candidateService.publicView(id);
  }
  @Get('all-companies')
  async getAllCompanies(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    return this._candidateService.getAllCompanies(pagination);
  }
  @Get('my-applications')
  @UseGuards(AuthGuard('access_token'))
  async getMyApplications(
    @Request() req: ERequest,
    @Query() dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>> {
    const user = req.user as { id: string };
    return this._candidateService.getMyApplications(user.id, dto);
  }
  @Get('application-details/:applicationId')
  async getApplicationStages(
    @Param('applicationId') applicationId: string,
  ): Promise<ApiResponse<AllStagesResponseDto>> {
    return await this._candidateService.getApplicationStages(applicationId);
  }
  @Get('home-data-public')
  async getHomeDataPublic(): Promise<
    ApiResponse<{
      jobs: ResponseJobsDto[];
      companies: CompanyProfileResponseDto[];
    }>
  > {
    return await this._candidateService.getHomeDataPublic();
  }
  @Post('change-pwd')
  @UseGuards(AuthGuard('access_token'))
  async UpdatePassword(
    @Body() dto: changePassDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<unknown>> {
    const user = req.user as { _id: string };
    const id = user?._id?.toString();
    return await this._candidateService.updatePassword(id, dto);
  }
}
