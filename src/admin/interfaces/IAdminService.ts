import { CandidateProfileResponseDto } from "../../candiate/dtos/candidate-responce.dto"
import { CompanyProfileResponseDto } from "../../company/dtos/responce.allcompany"
import { ResponseJobsDto } from "../../jobs/dtos/responce.job.dto"
import { PaginationDto } from "../../shared/dtos/pagination.dto"
import { PaginatedResponse, PlainResponse } from "./responce.interface"

export  interface IAdminService {
    getAllCompnys(dto:PaginationDto):Promise<PaginatedResponse<CompanyProfileResponseDto[]>>
    getAllCandidates(dto:PaginationDto):Promise<PaginatedResponse<CandidateProfileResponseDto[]>>
    updateCompanyStatus(id:string):Promise<PlainResponse>
    updateCandidateStatus(id:string):Promise<PlainResponse>
    getAllJobs(dto:PaginationDto):Promise<PaginatedResponse<ResponseJobsDto[]>>
    updateJobStatus(id:string):Promise<PlainResponse>
}

export const ADMIN_SERVICE = 'ADMIN_SERVICE'