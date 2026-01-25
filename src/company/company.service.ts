import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import {
  COMAPNY_REPOSITORY,
  IcompanyRepository,
} from './interface/profile.repository.interface';
import { CreateProfileDto } from './dtos/create.profile.dto';
import {
  CompanyProfileResponseDto,
  UserResponceDto,
} from './dtos/responce.allcompany';
import { comapnyResponceInterface } from './interface/responce.interface';
import { plainToInstance } from 'class-transformer';
import {
  changePassDto,
  InternalUserDto,
  TeamMemberDto,
  UpdateInternalUserDto,
  UpdateProfileDto,
} from './dtos/update.profile.dtos';
import { FilterQuery, Types } from 'mongoose';
import {
  AUTH_SERVICE,
  IAuthService,
} from '../auth/interfaces/IAuthCandiateService';
import { MESSAGES } from '../shared/constants/constants.messages';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { generalResponce } from '../auth/interfaces/api-response.interface';
import { populateProfileDto } from './dtos/populatedprofile.res.dto';
import { ResponseJobsDto } from '../jobs/dtos/responce.job.dto';
import {
  PaginatedResponse,
  PlainResponse,
} from '../admin/interfaces/responce.interface';
import { CompanyProfileDocument } from './schema/company.profile.schema';

@Injectable()
export class CompanyService implements IComapnyService {
  logger = new Logger(CompanyService.name);
  constructor(
    @Inject(COMAPNY_REPOSITORY)
    private readonly _companyRepository: IcompanyRepository,
    @Inject(forwardRef(() => AUTH_SERVICE))
    private readonly _AuthService: IAuthService,
  ) {}

  //for updating bolock /unblock Status
  async createProfile(
    dto: CreateProfileDto,
  ): Promise<CompanyProfileResponseDto> {
    this.logger.debug(
      `[CompanyService] creating new company profiel${dto.name}`,
    );
    const updateDto = {
      name: dto.name,
      adminUserId: new Types.ObjectId(dto.UserId),
    };
    const newProfile = await this._companyRepository.create(updateDto);
    this.logger.debug(
      `[CompanyService] new profile created ${JSON.stringify(newProfile)}`,
    );
    if (!newProfile) {
      throw new InternalServerErrorException(
        MESSAGES.AUTH.PROFILE_CREATION_FAIILD,
      );
    }

    const mappedData = plainToInstance(CompanyProfileResponseDto, newProfile);

    return mappedData;
  }

  // for fetching company profile

  async getPorfile(
    id: string,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
    const profiledata = await this._companyRepository.findById(id);
    const mappedData = plainToInstance(
      CompanyProfileResponseDto,
      {
        ...profiledata?.toObject(),
        _id: profiledata?._id.toString(),
      },
      { excludeExtraneousValues: true },
    );
    return {
      message: MESSAGES.COMPANY.PROFILE_FETCH_SUCCESS,
      data: mappedData,
    };
  }

  // get Public Profile

  async getPublicPorfile(
    id: string,
  ): Promise<comapnyResponceInterface<populateProfileDto>> {
    const profiledata = await this._companyRepository.publicPorfile(id);

    if (!profiledata) {
      throw new NotFoundException('Company not found');
    }

    const mappedProfile = plainToInstance(
      CompanyProfileResponseDto,
      {
        ...profiledata,
        _id: profiledata._id.toString(),
      },
      { excludeExtraneousValues: true },
    );

    const mappedJobs = plainToInstance(
      ResponseJobsDto,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      profiledata.jobs.map(({ companyId, ...job }) => ({
        ...job,
        _id: job._id.toString(),
      })),
      { excludeExtraneousValues: true },
    );

    const mappedData: populateProfileDto = {
      company: mappedProfile,
      jobs: mappedJobs,
    };

    return {
      message: MESSAGES.COMPANY.PROFILE_FETCH_SUCCESS,
      data: mappedData,
    };
  }
  // updating profile  wiht new data

  async updatePorfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
    const updatedata = await this._companyRepository.update(
      { _id: id },
      { $set: dto },
    );

    const mappedData = plainToInstance(
      CompanyProfileResponseDto,
      {
        ...updatedata?.toJSON(),
      },
      { excludeExtraneousValues: true },
    );
    return {
      message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
      data: mappedData,
    };
  }

  //add internal users to the company

  async createUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<comapnyResponceInterface<UserResponceDto>> {
    const data = await this._AuthService.createInternalUser(id, dto);
    return {
      message: MESSAGES.COMPANY.USER_REG_SUCCESS,
      data: data,
    };
  }

  // get all Internal users

  async getInternalUsers(
    companyId: string,
    userId: string,
    pagination: PaginationDto,
  ): Promise<comapnyResponceInterface<UserResponceDto[]>> {
    this.logger.log(
      `[ComapanyService] id get in Comapny service :${companyId}`,
    );
    return await this._AuthService.getAllUsers(companyId, userId, pagination);
  }

  // get Hr Users

  async getHrUsers(
    companyId: string,
  ): Promise<comapnyResponceInterface<UserResponceDto[]>> {
    this.logger.log(`[companyService] fetch hr user of company ${companyId}`);
    return await this._AuthService.getHrUsers(companyId);
  }

  // get Interviewers

  async getInterviewers(
    companyId: string,
  ): Promise<comapnyResponceInterface<UserResponceDto[]>> {
    this.logger.log(
      `[companyService] fetch Interviewers of company ${companyId}`,
    );
    return await this._AuthService.getInterviewers(companyId);
  }

  //getUserProfile

  async getUserProfile(
    id: string,
  ): Promise<comapnyResponceInterface<UserResponceDto>> {
    this.logger.log(`[ComapayService] try to getUser Profile ${id}`);
    const userProfile = await this._AuthService.getUserProfile(id);
    return {
      message: MESSAGES.COMPANY.USER_PROFILE_GET,
      data: userProfile,
    };
  }

  //updateUserProfile

  async upateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<comapnyResponceInterface<UserResponceDto>> {
    const data = await this._AuthService.updateUserProfile(id, dto);
    return {
      message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
      data: data,
    };
  }

  // update Password

  async updatePassword(
    id: string,
    dto: changePassDto,
  ): Promise<generalResponce> {
    return await this._AuthService.changePassword(id, dto);
  }

  //addTeamMembers

  async addTeamMembers(
    id: string,
    dto: TeamMemberDto,
  ): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
    const data = await this._companyRepository.addTeamMembers(id, dto);

    const mappedData = plainToInstance(
      CompanyProfileResponseDto,
      {
        ...data?.toJSON(),
      },
      { excludeExtraneousValues: true },
    );
    return {
      message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
      data: mappedData,
    };
  }

  async removeUser(id: string): Promise<PlainResponse> {
    return await this._AuthService.removeUser(id);
  }

  async getAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    const { page = 1, limit = 6, search } = pagination;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<CompanyProfileDocument> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
      ];
    }

    const { data: companies, total } =
      await this._companyRepository.findManyWithPagination(filter, {
        limit,
        skip,
      });

    const mappedData = plainToInstance(
      CompanyProfileResponseDto,
      companies.map((company) => ({
        ...company.toObject(),
        _id: company._id.toString(),
      })),
      {
        excludeExtraneousValues: true,
      },
    );

    return {
      message: MESSAGES.COMPANY.PROFILE_FETCH_SUCCESS,
      data: mappedData,
      totalItems: total,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
