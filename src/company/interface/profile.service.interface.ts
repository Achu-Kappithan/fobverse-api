import { CreateProfileDto } from "../dtos/create.profile.dto";


export interface IComapnyService {
    createProfile(dto:CreateProfileDto):Promise<void>

}

export const COMPANY_SERVICE = 'COMPANY_SERVICE'