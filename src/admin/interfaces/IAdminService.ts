import { CompanyProfileResponseDto } from "src/company/dtos/responce.allcompany"
import { PaginatedResponse, PlainResponse } from "./responce.interface"
import { CandidateProfileResponseDto } from "src/candiate/dtos/candidate-responce.dto"
import { PaginationDto } from "src/shared/dtos/pagination.dto"
import { ResponseJobsDto } from "src/jobs/dtos/responce.job.dto"


export  interface IAdminService {
    getAllCompnys(dto:PaginationDto):Promise<PaginatedResponse<CompanyProfileResponseDto[]>>
    getAllCandidates(dto:PaginationDto):Promise<PaginatedResponse<CandidateProfileResponseDto[]>>
    updateCompanyStatus(id:string):Promise<PlainResponse>
    updateCandidateStatus(id:string):Promise<PlainResponse>
    getAllJobs(dto:PaginationDto):Promise<PaginatedResponse<ResponseJobsDto[]>>
    updateJobStatus(id:string):Promise<PlainResponse>
}

export const ADMIN_SERVICE = 'ADMIN_SERVICE'