import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ADMIN_SERVICE } from './interfaces/IAdminService';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly _adminService :AdminService
  ) {}

  @Get('getallcompany')
  @UseGuards(AuthGuard('access_token'))
  async getAllcompany(){
    return this._adminService.getAllCompnys()
  }
}
