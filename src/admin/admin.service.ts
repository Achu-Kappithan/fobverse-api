import { Inject, Injectable, Logger } from '@nestjs/common';
import { IAdminService } from './interfaces/IAdminService';
import { COMAPNY_REPOSITORY, IcompanyRepository } from 'src/company/interface/profile.repository.interface';
import { CompanyRepository } from 'src/company/comapny.repository';
import { GetAllcompanyResponce } from './interfaces/responce.interface';
import { CompanyProfileDocument } from 'src/company/schema/company.profile.schema';
import { plainToInstance } from 'class-transformer';
import { CompanyResponseDto } from 'src/company/dtos/responce.allcomay';

@Injectable()
export class AdminService implements IAdminService {
    logger = new  Logger(AdminService.name)
    constructor (
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository:CompanyRepository
    ) {}

    async getAllCompnys():Promise<GetAllcompanyResponce<CompanyResponseDto>>{
        const data = await this._companyRepository.findAll()
        this.logger.debug(`[Adminservice] All company details fetch ${data}`)
        const mapdeData = plainToInstance(
            CompanyResponseDto,
            data.map(doc => {
                const obj = doc.toObject();
                return {
                ...obj,
                _id: obj._id.toString(),
                userId: obj.userId.toString(),
                };
            }),
            { excludeExtraneousValues: true }
            );

        console.log(mapdeData)
        return {
            message:"data fetched successfully",
            data: mapdeData
        }
    }
}
