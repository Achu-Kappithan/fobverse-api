import { CompanyResponseDto } from "src/company/dtos/responce.allcompany"
import { GetAllcompanyResponce } from "./responce.interface"
import { GetAllcandidatesResponce } from "src/candiate/interfaces/responce.interface"
import { CandidateProfileResponseDto } from "src/candiate/dtos/candidate-responce.dto"


export  interface IAdminService {
    getAllCompnys():Promise<GetAllcompanyResponce<CompanyResponseDto>>
    getAllCandidates():Promise<GetAllcandidatesResponce<CandidateProfileResponseDto>>
}

export const ADMIN_SERVICE = 'ADMIN_SERVICE'