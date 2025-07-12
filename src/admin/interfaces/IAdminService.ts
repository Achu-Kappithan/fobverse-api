import { CompanyProfileResponseDto } from "src/company/dtos/responce.allcompany"
import { GetAllcompanyResponce, PlainResponse } from "./responce.interface"
import { GetAllcandidatesResponce } from "src/candiate/interfaces/responce.interface"
import { CandidateProfileResponseDto } from "src/candiate/dtos/candidate-responce.dto"


export  interface IAdminService {
    getAllCompnys():Promise<GetAllcompanyResponce<CompanyProfileResponseDto>>
    getAllCandidates():Promise<GetAllcandidatesResponce<CandidateProfileResponseDto>>
    updateCompanyStatus(id:string):Promise<PlainResponse>
    updateCandidateStatus(id:string):Promise<PlainResponse>
}

export const ADMIN_SERVICE = 'ADMIN_SERVICE'