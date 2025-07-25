import { Body, Controller, Get, Inject, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { COMPANY_SERVICE, IComapnyService } from './interface/profile.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { comapnyResponceInterface } from './interface/responce.interface';
import { CompanyProfileResponseDto, InternalUserResponceDto } from './dtos/responce.allcompany';
import { changePassDto, InternalUserDto, TeamMemberDto, UpdateInternalUserDto, UpdateProfileDto } from './dtos/update.profile.dtos';
import { generalResponce } from 'src/auth/interfaces/api-response.interface';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';

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
        return this._companyService.getPorfile(user.companyId)
    }

    @Patch('updateprofile')
    @UseGuards(AuthGuard('access_token'))
    async updateProfile(
        @Request()req:any,
        @Body() dto:UpdateProfileDto
    ):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>{
        const user = req.user
        return this._companyService.updatePorfile(user.companyId,dto)
    }

    @Post('createuser')
    @UseGuards(AuthGuard('access_token'))
    async createUser(
        @Request() req:any,
        @Body() dto:InternalUserDto
    ){
        const user = req.user
        return await this._companyService.createUser(user.companyId,dto)
    }

    @Get('internalusers')
    @UseGuards(AuthGuard('access_token'))
    async getInternalUsers(
        @Request()req:any,
        @Query() parms:PaginationDto
    ){
        const user = req.user
        return this._companyService.getInternalUsers(user.companyId.toString(),parms)
    }

    @Get('userprofile')
    @UseGuards(AuthGuard('access_token'))
    async getUserProfile(
        @Request() req:any
    ):Promise<comapnyResponceInterface<InternalUserResponceDto>>{
        const user = req.user
        return this._companyService.getUserProfile(user._id.toString())
    }

    @Post('updateuserprofile')
    @UseGuards(AuthGuard('access_token'))
    async updateUserProfile(
        @Body() dto:UpdateInternalUserDto,
        @Request() req:any
    ):Promise<comapnyResponceInterface<InternalUserResponceDto>>{
        const user = req.user
        return this._companyService.upateUserProfile(user._id.toString(),dto)
    }

    @Post('updatepassword')
    @UseGuards(AuthGuard('access_token'))
    async UpdatePassword(
        @Body() dto:changePassDto,
        @Request() req:any
    ):Promise<generalResponce>{
        return await this._companyService.UpdatePassword(req.user._id.toString(),dto)
    }

    @Post('addteammember')
    @UseGuards(AuthGuard('access_token'))
    async AddTeamMembers(
        @Request() req:any,
        @Body() dto:TeamMemberDto
    ):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>{
        console.log(dto)
        const user = req.user
        return this._companyService.AddTeamMembers(user.companyId.toString(),dto)
    }
}
