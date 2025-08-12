import { Body, Controller, Get, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { CANDIDATE_SERVICE, ICandidateService } from './interfaces/candidate-service.interface';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCandidateProfileDto } from './dtos/update-candidate-profile.dto';
import { Request as ERequest } from 'express';

@Controller('candidate')
export class CandiateController {
  constructor(
    @Inject(CANDIDATE_SERVICE)
    private readonly _candiateService:ICandidateService
  ) {}

  @Get('getprofile')
  @UseGuards(AuthGuard('access_token'))
  async GetProfile(
    @Request() req:ERequest
  ){
    const user = req.user
    return this._candiateService.GetProfile(user!.id)
  }

  @Post('updataprofile')
  @UseGuards(AuthGuard('access_token'))
  async UpdateProfile(
    @Body() dto:UpdateCandidateProfileDto,
    @Request() req:ERequest
  ){
    const user = req.user
    console.log(user)
    return this._candiateService.updateProfile(dto,user!.id)
  }

  
}
