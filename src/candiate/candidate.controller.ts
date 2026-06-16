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
import { Throttle } from '@nestjs/throttler';
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
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('getprofile')
  @UseGuards(AuthGuard('access_token'))
  async getProfile(
    @Request() req: ERequest,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    const user = req.user as { id: string };
    return this._candidateService.getProfile(user.id);
  }
  // 10 requests per 1 minute — prevent profile spam flooding
  @Throttle({ 'write-moderate': { limit: 10, ttl: 60000 } })
  @Post('updateprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateProfile(
    @Body() dto: UpdateCandidateProfileDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    const user = req.user as { id: string };
    return this._candidateService.updateProfile(dto, user.id);
  }
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('/public/profile')
  @UseGuards(AuthGuard('access_token'))
  async publicView(
    @Query('id') id: string,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    return this._candidateService.publicView(id);
  }
  // 30 requests per 1 minute — unauthenticated public endpoint, scraping risk
  @Throttle({ 'read-public': { limit: 30, ttl: 60000 } })
  @Get('all-companies')
  async getAllCompanies(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    return this._candidateService.getAllCompanies(pagination);
  }
  // 60 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 60, ttl: 60000 } })
  @Get('my-applications')
  @UseGuards(AuthGuard('access_token'))
  async getMyApplications(
    @Request() req: ERequest,
    @Query() dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>> {
    const user = req.user as { id: string };
    return this._candidateService.getMyApplications(user.id, dto);
  }
  // 30 requests per 1 minute — public route, limit enumeration
  @Throttle({ 'read-public': { limit: 30, ttl: 60000 } })
  @Get('application-details/:applicationId')
  async getApplicationStages(
    @Param('applicationId') applicationId: string,
  ): Promise<ApiResponse<AllStagesResponseDto>> {
    return await this._candidateService.getApplicationStages(applicationId);
  }
  // 30 requests per 1 minute — public homepage data, scraping risk
  @Throttle({ 'read-public': { limit: 30, ttl: 60000 } })
  @Get('home-data-public')
  async getHomeDataPublic(): Promise<
    ApiResponse<{
      jobs: ResponseJobsDto[];
      companies: CompanyProfileResponseDto[];
    }>
  > {
    return await this._candidateService.getHomeDataPublic();
  }
  // 5 requests per 15 minutes — password change brute-force protection
  @Throttle({ 'auth-strict': { limit: 5, ttl: 900000 } })
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
