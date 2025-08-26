import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  APPLICATION_SERVICE,
  IApplicationService,
} from './interfaces/application.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { CreateApplicationDto } from './dtos/createapplication.dto';
import { PlainResponse } from '../admin/interfaces/responce.interface';
import { Request as ERequest } from 'express';
import { UserDocument } from '../auth/schema/user.schema';

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
  ): Promise<PlainResponse> {
    const user = req.user as UserDocument;
    return this.applicationsService.createApplication(dto, user._id.toString());
  }
}
