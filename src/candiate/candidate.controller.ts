import { Controller, Get, Inject, Request, UseGuards } from '@nestjs/common';
import { CANDIDATE_SERVICE, ICandidateService } from './interfaces/candidate-service.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('candiate')
export class CandiateController {
  constructor(
    @Inject(CANDIDATE_SERVICE)
    private readonly _candiateService:ICandidateService
  ) {}

  @Get()
  @UseGuards(AuthGuard('access_token'))
  async GetProfile(
    @Request() req:any
  ){
    const user = req.user
    console.log(user)
    return this._candiateService.GetProfile(user._id.toString())
  }

  
}
