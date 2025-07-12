import { Body, Controller, Get, Inject, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { COMPANY_SERVICE, IComapnyService } from './interface/profile.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { comapnyResponceInterface } from './interface/responce.interface';
import { CompanyProfileResponseDto } from './dtos/responce.allcompany';
import { UpdateProfileDto } from './dtos/update.profile.dtos';

@Controller('company')
export class CompanyController {
    constructor(
        @Inject(COMPANY_SERVICE)
        private readonly _companyService:IComapnyService
    ){}

    @Get('profile')
    @UseGuards(AuthGuard('access_token'))
    async getProfile(
        @Request() req:any 
    ):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>{
        const user = req.user
        return this._companyService.getPorfile(user._id)
    }

    @Patch('updateprofile')
    @UseGuards(AuthGuard('access_token'))
    async updateProfile(
        @Request()req:any,
        @Body() dto:UpdateProfileDto
    ){
        const user = req.user
        return this._companyService.updatePorfile(user._id,dto)
    }
}
