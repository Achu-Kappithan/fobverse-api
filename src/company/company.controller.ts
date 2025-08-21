import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  COMPANY_SERVICE,
  IComapnyService,
} from './interface/profile.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { comapnyResponceInterface } from './interface/responce.interface';
import {
  CompanyProfileResponseDto,
  UserResponceDto,
} from './dtos/responce.allcompany';
import {
  changePassDto,
  InternalUserDto,
  TeamMemberDto,
  UpdateInternalUserDto,
  UpdateProfileDto,
} from './dtos/update.profile.dtos';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { generalResponce } from '../auth/interfaces/api-response.interface';
import { ERequest } from '../shared/interface/api.responce';

@Controller('company')
export class CompanyController {
  constructor(
    @Inject(COMPANY_SERVICE)
    private readonly _companyService: IComapnyService,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard('access_token'))
  async getProfile(
    @Request() req: ERequest,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
    const user = req.user;
    const companyId = user?.companyId?.toString() ?? '';
    return this._companyService.getPorfile(companyId);
  }

  @Patch('updateprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateProfile(
    @Request() req: ERequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
    const user = req.user;
    const companyId = user?.companyId?.toString() ?? '';
    return this._companyService.updatePorfile(companyId, dto);
  }

  @Post('createuser')
  @UseGuards(AuthGuard('access_token'))
  async createUser(@Request() req: ERequest, @Body() dto: InternalUserDto) {
    const companyId = req.user?.companyId?.toString() ?? '';
    return await this._companyService.createUser(companyId, dto);
  }

  @Get('internalusers')
  @UseGuards(AuthGuard('access_token'))
  async getInternalUsers(
    @Request() req: ERequest,
    @Query() parms: PaginationDto,
  ) {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._companyService.getInternalUsers(companyId, parms);
  }

  @Get('userprofile')
  @UseGuards(AuthGuard('access_token'))
  async getUserProfile(
    @Request() req: ERequest,
  ): Promise<comapnyResponceInterface<UserResponceDto>> {
    const user = req.user;
    return this._companyService.getUserProfile(user!._id.toString());
  }

  @Post('updateuserprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateUserProfile(
    @Body() dto: UpdateInternalUserDto,
    @Request() req: ERequest,
  ): Promise<comapnyResponceInterface<UserResponceDto>> {
    const user = req.user;
    return this._companyService.upateUserProfile(user!._id.toString(), dto);
  }

  @Post('updatepassword')
  @UseGuards(AuthGuard('access_token'))
  async UpdatePassword(
    @Body() dto: changePassDto,
    @Request() req: ERequest,
  ): Promise<generalResponce> {
    return await this._companyService.updatePassword(
      req.user!._id.toString(),
      dto,
    );
  }

  @Post('addteammember')
  @UseGuards(AuthGuard('access_token'))
  async addTeamMembers(
    @Request() req: ERequest,
    @Body() dto: TeamMemberDto,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
    const companyId = req.user?.companyId?.toString() ?? '';
    return this._companyService.addTeamMembers(companyId.toString(), dto);
  }

  @Get('public/profile')
  @UseGuards(AuthGuard('access_token'))
  async getPublicView(
    @Query('id') id: string,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
    return this._companyService.getPorfile(id);
  }
}
