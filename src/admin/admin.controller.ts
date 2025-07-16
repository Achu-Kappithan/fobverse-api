import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ADMIN_SERVICE, IAdminService } from './interfaces/IAdminService';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly _adminService :IAdminService
  ) {}

  @Get('getallcompany')
  @UseGuards(AuthGuard('access_token'))
  async getAllcompany(){
    return this._adminService.getAllCompnys()
  }

  @Get('getAllcandidates')
  @UseGuards(AuthGuard('access_token'))
  async getAllCandidates(){
    return this._adminService.getAllCandidates()
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
