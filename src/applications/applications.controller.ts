import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  APPLICATION_SERVICE,
  IApplicationService,
} from './interfaces/application.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { CreateApplicationDto } from './dtos/createapplication.dto';
import {
  ApiResponse,
  PaginatedResponse,
} from '../shared/responses/api.response';
import { Request as ERequest } from 'express';
import { UserDocument } from '../auth/schema/user.schema';
import { PaginatedApplicationDto } from './dtos/application.pagination.dto';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { ApplicationResponseDto } from './dtos/application.response';
import { ApplicationDetailsResponseDto } from './dtos/application-details.response.dto';
import { updateAtsScoreDto } from './dtos/update.atsScore.dto';
@Controller('applications')
export class ApplicationsController {
  constructor(
    @Inject(APPLICATION_SERVICE)
    private readonly applicationsService: IApplicationService,
  ) {}
  // 10 requests per 5 minutes — prevents bot application spam
  @Throttle({ 'apply-job': { limit: 10, ttl: 300000 } })
  @Post('applyjob')
  @UseGuards(AuthGuard('access_token'))
  async applayJob(
    @Body() dto: CreateApplicationDto,
    @Request() req: ERequest,
    @Query('id') id: string,
  ): Promise<ApiResponse<unknown>> {
    const user = req.user as UserDocument;
    return this.applicationsService.createApplication(
      dto,
      user._id.toString(),
      id,
    );
  }
  // 30 requests per 1 minute — paginated list read
  @Throttle({ 'read-standard': { limit: 30, ttl: 60000 } })
  @Get('applicants')
  @UseGuards(AuthGuard('access_token'))
  async getApplications(
    @Query() dto: PaginatedApplicationDto,
    @Request() req: ERequest,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>> {
    const user = req.user as UserDocument;
    return this.applicationsService.getAllApplications(
      user.companyId!.toString(),
      dto,
    );
  }
  // 30 requests per 1 minute — paginated list read
  @Throttle({ 'read-standard': { limit: 30, ttl: 60000 } })
  @Get('all-applicants')
  @UseGuards(AuthGuard('access_token'))
  async getCompanyApplicants(
    @Query() dto: PaginationDto,
    @Request() req: ERequest,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>> {
    const user = req.user as UserDocument;
    return this.applicationsService.getCompanyApplicants(
      user.companyId!.toString(),
      dto,
    );
  }
  // 20 requests per 1 minute — ATS score update
  @Throttle({ 'write-moderate': { limit: 20, ttl: 60000 } })
  @Patch('updateScore')
  @UseGuards(AuthGuard('access_token'))
  async updateAtsScore(
    @Request() req: ERequest,
    @Body() dto: updateAtsScoreDto,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>> {
    const user = req.user as UserDocument;
    return this.applicationsService.updateAtsScore(
      dto,
      user.companyId!.toString(),
    );
  }
  // 30 requests per 1 minute — standard authenticated read
  @Throttle({ 'read-standard': { limit: 30, ttl: 60000 } })
  @Get('applicationDetails/:appId/:canId')
  @UseGuards(AuthGuard('access_token'))
  async getApplicationDetails(
    @Param('appId') appId: string,
    @Param('canId') canId: string,
  ): Promise<ApiResponse<ApplicationDetailsResponseDto>> {
    return this.applicationsService.getjobDetails(appId, canId);
  }
}
