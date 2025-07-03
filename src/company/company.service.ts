import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import { COMAPNY_REPOSITORY } from './interface/profile.repository.interface';
import { CompanyRepository } from './comapny.repository';
import { CreateProfileDto } from './dtos/create.profile.dto';

@Injectable()
export class CompanyService implements IComapnyService{
    logger = new Logger(CompanyService.name)
    constructor(
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository : CompanyRepository
    ){}

    async createProfile(dto: CreateProfileDto): Promise<void> {
       this.logger.debug(`[CompanyService] creating new company profiel${dto.companyName}`)
        const newProfile = await this._companyRepository.create(dto)
        this.logger.debug(`[CompanyService] new profile created ${newProfile}`)
        if(!newProfile){
            throw new InternalServerErrorException('error regding profile creation')
        }
    }

}
