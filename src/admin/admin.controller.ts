import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ADMIN_SERVICE, IAdminService } from './interfaces/IAdminService';
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly _adminService :IAdminService
  ) {}

  @Get('getallcompany')
  @UseGuards(AuthGuard('access_token'))
  async getAllcompany(
    @Query() dto:PaginationDto
  ){
    return await this._adminService.getAllCompnys(dto)
  }

  @Get('getAllcandidates')
  @UseGuards(AuthGuard('access_token'))
  async getAllCandidates(
    @Query() dto:PaginationDto
  ){
    return this._adminService.getAllCandidates(dto)
  }

  @Get('company/updatestatus')
  @UseGuards(AuthGuard('access_token')) 
  async updateStatus(
    @Query('id') id:string
  ){
    return this._adminService.updateCompanyStatus(id)
  }

  @Get('candidate/updatestatus')
  @UseGuards(AuthGuard('access_token'))
  async updateCandidateStatus(
    @Query('id') id:string
  ){
    return this._adminService.updateCandidateStatus(id)
  }
}
