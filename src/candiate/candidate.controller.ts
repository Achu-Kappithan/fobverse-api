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
import { CandidateResponceInterface } from './interfaces/responce.interface';
import { CandidateProfileResponseDto } from './dtos/candidate-responce.dto';
import { CompanyProfileResponseDto } from '../company/dtos/responce.allcompany';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../admin/interfaces/responce.interface';
import { CandidateApplicationResponseDto } from '../applications/dtos/candidate-application.response.dto';
import { CandidateApplicationsQueryDto } from '../applications/dtos/candidate-applications-query.dto';
import { AllStagesResponseDto } from '../interview/dtos/all-stages-response.dto';

@Controller('candidate')
export class CandiateController {
  constructor(
    @Inject(CANDIDATE_SERVICE)
    private readonly _candiateService: ICandidateService,
  ) {}

  @Get('getprofile')
  @UseGuards(AuthGuard('access_token'))
  async getProfile(
    @Request() req: ERequest,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>> {
    const user = req.user as { id: string };
    return this._candiateService.getProfile(user.id);
  }

  @Post('updataprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateProfile(
    @Body() dto: UpdateCandidateProfileDto,
    @Request() req: ERequest,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>> {
    const user = req.user as { id: string };
    return this._candiateService.updateProfile(dto, user.id);
  }

  @Get('/public/profile')
  @UseGuards(AuthGuard('access_token'))
  async publicView(
    @Query('id') id: string,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>> {
    return this._candiateService.publicView(id);
  }

  @Get('all-companies')
  @UseGuards(AuthGuard('access_token'))
  async getAllCompanies(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    return this._candiateService.getAllCompanies(pagination);
  }

  @Get('all-companies-public')
  async getAllCompaniesPublic(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    return this._candiateService.getAllCompanies(pagination);
  }

  @Get('my-applications')
  @UseGuards(AuthGuard('access_token'))
  async getMyApplications(
    @Request() req: ERequest,
    @Query() dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>> {
    const user = req.user as { id: string };
    return this._candiateService.getMyApplications(user.id, dto);
  }

  @Get('application-details/:applicationId')
  @UseGuards(AuthGuard('access_token'))
  async getApplicationStages(
    @Param('applicationId') applicationId: string,
  ): Promise<CandidateResponceInterface<AllStagesResponseDto>> {
    return await this._candiateService.getApplicationStages(applicationId);
  }

  @Get('home-data-public')
  async getHomeDataPublic(): Promise<
    CandidateResponceInterface<{ jobs: any[]; companies: any[] }>
  > {
    return this._candiateService.getHomeDataPublic();
  }
}
