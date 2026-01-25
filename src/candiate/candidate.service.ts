import { PaginatedResponse } from '../admin/interfaces/responce.interface';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ICandidateService } from './interfaces/candidate-service.interface';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from './interfaces/candidate-repository.interface';
import { CreateCandidateProfileDto } from './dtos/create-candidate-profile.dto';
import { CandidateProfileDocument } from './schema/candidate.profile.schema';
import { Types } from 'mongoose';
import { CandidateResponceInterface } from './interfaces/responce.interface';
import { CandidateProfileResponseDto } from './dtos/candidate-responce.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateCandidateProfileDto } from './dtos/update-candidate-profile.dto';
import { MESSAGES } from '../shared/constants/constants.messages';
import {
  COMPANY_SERVICE,
  IComapnyService,
} from '../company/interface/profile.service.interface';
import { CompanyProfileResponseDto } from '../company/dtos/responce.allcompany';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import {
  APPLICATION_SERVICE,
  IApplicationService,
} from '../applications/interfaces/application.service.interface';
import { CandidateApplicationResponseDto } from '../applications/dtos/candidate-application.response.dto';
import { CandidateApplicationsQueryDto } from '../applications/dtos/candidate-applications-query.dto';

@Injectable()
export class CandidateService implements ICandidateService {
  private readonly _logger = new Logger(CandidateService.name);

  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly _candidateRepository: ICandidateRepository,
    @Inject(COMPANY_SERVICE)
    private readonly _companyService: IComapnyService,
    @Inject(APPLICATION_SERVICE)
    private readonly _applicationService: IApplicationService,
  ) {}

  async findByEmail(email: string): Promise<CandidateProfileDocument | null> {
    this._logger.debug(`Finding user by email: ${email}`);
    return this._candidateRepository.findByEmail(email);
  }

  async findById(id: string): Promise<CandidateProfileDocument | null> {
    this._logger.debug(`Finding user by Id:${id}`);
    return this._candidateRepository.findById(id);
  }

  async createPorfile(
    dto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    this._logger.debug(
      `[CandidateService] Creating new candieate profile${dto.name}`,
    );
    const updateDto = {
      name: dto.name,
      UserId: new Types.ObjectId(dto.UserId),
    };
    const newprofile = await this._candidateRepository.create(updateDto);
    this._logger.debug(`new profil created ${JSON.stringify(newprofile)}`);

    if (!newprofile) {
      throw new InternalServerErrorException(
        MESSAGES.AUTH.PROFILE_CREATION_FAIILD,
      );
    }
    const mappedData = plainToInstance(CandidateProfileResponseDto, newprofile);
    return mappedData;
  }

  async findAllCandidate(): Promise<CandidateProfileDocument[] | null> {
    return await this._candidateRepository.findAll();
  }

  async getProfile(
    id: string,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>> {
    const userId = new Types.ObjectId(id);
    const ProfileData = await this._candidateRepository.findOne({
      UserId: userId,
    });
    if (!ProfileData) {
      throw new NotFoundException(MESSAGES.CANDIDATE.PROFILE_FETCH_FAIL);
    }
    const mappedData = plainToInstance(
      CandidateProfileResponseDto,
      {
        ...ProfileData?.toObject(),
      },
      { excludeExtraneousValues: true },
    );
    return {
      message: MESSAGES.CANDIDATE.PROFILE_FETCH_SUCCESS,
      data: mappedData,
    };
  }

  async updateProfile(
    dto: UpdateCandidateProfileDto,
    id: string,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>> {
    this._logger.debug(
      `[CandidateService] data get frondend for updating candidate profile id is : ${id} data :${JSON.stringify(dto)}`,
    );
    const userId = new Types.ObjectId(id);
    const profileData = await this._candidateRepository.update(
      { UserId: userId },
      { $set: dto },
    );

    if (!profileData) {
      throw new NotFoundException(MESSAGES.CANDIDATE.PROFILE_UPDATE_FAIL);
    }
    this._logger.log(
      `[CandiateServie], updated profile data ${JSON.stringify(profileData)}`,
    );

    const mappedData = plainToInstance(
      CandidateProfileResponseDto,
      {
        ...profileData?.toObject(),
      },
      { excludeExtraneousValues: true },
    );

    return {
      message: MESSAGES.CANDIDATE.PROFILE_UPDATE_SUCCESS,
      data: mappedData,
    };
  }

  async publicView(
    id: string,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>> {
    const ProfileData = await this._candidateRepository.findById(id);
    if (!ProfileData) {
      throw new NotFoundException(MESSAGES.CANDIDATE.PROFILE_FETCH_FAIL);
    }
    const mappedData = plainToInstance(
      CandidateProfileResponseDto,
      {
        ...ProfileData?.toObject(),
      },
      { excludeExtraneousValues: true },
    );
    return {
      message: MESSAGES.CANDIDATE.PROFILE_FETCH_SUCCESS,
      data: mappedData,
    };
  }

  async getAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    return this._companyService.getAllCompanies(pagination);
  }

  async getMyApplications(
    candidateId: string,
    dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>> {
    this._logger.log(
      `[CandidateService] Fetching applications for candidate: ${candidateId}`,
    );
    return await this._applicationService.getCandidateApplications(
      candidateId,
      dto,
    );
  }
}
