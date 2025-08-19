import { Body, Controller, Get, Inject, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CANDIDATE_SERVICE, ICandidateService } from './interfaces/candidate-service.interface';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCandidateProfileDto } from './dtos/update-candidate-profile.dto';
import { Request as ERequest } from 'express';
import { CandidateResponceInterface } from './interfaces/responce.interface';
import { CandidateProfileResponseDto } from './dtos/candidate-responce.dto';

@Controller('candidate')
export class CandiateController {
  constructor(
    @Inject(CANDIDATE_SERVICE)
    private readonly _candiateService:ICandidateService
  ) {}

  @Get('getprofile')
  @UseGuards(AuthGuard('access_token'))
  async getProfile(
    @Request() req:ERequest
  ):Promise<CandidateResponceInterface<CandidateProfileResponseDto>>{
    const user = req.user
    return this._candiateService.getProfile(user!.id)
  }

  @Post('updataprofile')
  @UseGuards(AuthGuard('access_token'))
  async updateProfile(
    @Body() dto:UpdateCandidateProfileDto,
    @Request() req:ERequest
  ):Promise<CandidateResponceInterface<CandidateProfileResponseDto>>{
    const user = req.user
    return this._candiateService.updateProfile(dto,user!.id)
  }

  @Get('/public/profile')
  @UseGuards(AuthGuard('access_token'))
  async publicView(
    @Query('id') id:string
  ):Promise<CandidateResponceInterface<CandidateProfileResponseDto>>{
    return this._candiateService.publicView(id)
  }

  
}
