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
import {
  APPLICATION_SERVICE,
  IApplicationService,
} from './interfaces/application.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { CreateApplicationDto } from './dtos/createapplication.dto';
import {
  PaginatedResponse,
  PlainResponse,
} from '../admin/interfaces/responce.interface';
import { Request as ERequest } from 'express';
import { UserDocument } from '../auth/schema/user.schema';
import { PaginatedApplicationDto } from './dtos/application.pagination.dto';
import { ApplicationResponceDto } from './dtos/application.responce';
import { updateAtsScoreDto } from './dtos/update.atsScore.dto';
import { applicationResponce } from './interfaces/responce.interface';

@Controller('applications')
export class ApplicationsController {
  constructor(
    @Inject(APPLICATION_SERVICE)
    private readonly applicationsService: IApplicationService,
  ) {}

  @Post('applyjob')
  @UseGuards(AuthGuard('access_token'))
  async applayJob(
    @Body() dto: CreateApplicationDto,
    @Request() req: ERequest,
    @Query('id') id: string,
  ): Promise<PlainResponse> {
    const user = req.user as UserDocument;
    return this.applicationsService.createApplication(
      dto,
      user._id.toString(),
      id,
    );
  }

  @Get('applicants')
  @UseGuards(AuthGuard('access_token'))
  async getApplications(
    @Query() dto: PaginatedApplicationDto,
    @Request() req: ERequest,
  ): Promise<PaginatedResponse<ApplicationResponceDto[]>> {
    const user = req.user as UserDocument;
    return this.applicationsService.getAllApplications(
      user.companyId!.toString(),
      dto,
    );
  }

  @Patch('updateScore')
  @UseGuards(AuthGuard('access_token'))
  async updateAtsScore(
    @Request() req: ERequest,
    @Body() dto: updateAtsScoreDto,
  ): Promise<PaginatedResponse<ApplicationResponceDto[]>> {
    const user = req.user as UserDocument;
    return this.applicationsService.updateAtsScore(
      dto,
      user.companyId!.toString(),
    );
  }

  @Get('applicationDetails/:appId/:canId')
  @UseGuards(AuthGuard('access_token'))
  async getApplicationDetails(
    @Param('appId') appId: string,
    @Param('canId') canId: string,
  ): Promise<applicationResponce<ApplicationResponceDto>> {
    return this.applicationsService.getjobDetails(appId, canId);
  }
}
