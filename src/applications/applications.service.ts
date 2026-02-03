import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IApplicationService } from './interfaces/application.service.interface';
import {
  APPLICATION_REPOSITORY,
  IApplicationRepository,
} from './interfaces/application.repository.interface';
import {
  PaginatedResponse,
  PlainResponse,
} from '../admin/interfaces/responce.interface';
import { CreateApplicationDto } from './dtos/createapplication.dto';
import { FilterQuery, Types } from 'mongoose';
import { MESSAGES } from '../shared/constants/constants.messages';
import { ApplicationResponceDto } from './dtos/application.responce';
import { ApplicationDetailsResponseDto } from './dtos/application-details.response.dto';
import { ApplicationDocument, Stages } from './schema/applications.schema';
import { plainToInstance } from 'class-transformer';
import { PaginatedApplicationDto } from './dtos/application.pagination.dto';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { CANDIDATE_REPOSITORY } from '../candiate/interfaces/candidate-repository.interface';
import { CandidateRepository } from '../candiate/candidate.repository';
import {
  IJobService,
  JOBS_SERVICE,
} from '../jobs/interfaces/jobs.service.interface';
import { EmailService } from '../email/email.service';
import {
  ATS_SERVICE,
  IAtsService,
} from '../ats-sorting/interfaces/ats.service.interface';
import { updateAtsScoreDto } from './dtos/update.atsScore.dto';
import { applicationResponce } from './interfaces/responce.interface';
import {
  populatedapplicationList,
  CandidateApplicationAggregation,
} from './types/repository.types';
import { CandidateApplicationResponseDto } from './dtos/candidate-application.response.dto';

@Injectable()
export class ApplicationsService implements IApplicationService {
  private readonly _logger = new Logger(ApplicationsService.name);
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly _applicationRepository: IApplicationRepository,
    @Inject(CANDIDATE_REPOSITORY)
    private readonly _candidateRepository: CandidateRepository,
    @Inject(JOBS_SERVICE)
    private readonly _jobservice: IJobService,
    @Inject(ATS_SERVICE)
    private readonly _atsService: IAtsService,
    private readonly _emailService: EmailService,
  ) {}

  async createApplication(
    dto: CreateApplicationDto,
    id: string,
    companyId: string,
  ): Promise<PlainResponse> {
    const jobid = new Types.ObjectId(dto.jobId);
    const candidateObjId = new Types.ObjectId(id);
    const companyObjId = new Types.ObjectId(companyId);
    const updatedDto = {
      ...dto,
      candidateId: candidateObjId,
      jobId: jobid,
      companyId: companyObjId,
    };

    if (!dto.resumeUrl) {
      const data = await this._candidateRepository.findOne({
        UserId: candidateObjId,
      });
      if (!data?.resumeUrl) {
        throw new BadRequestException('Resume not found in Porfile');
      }
      updatedDto.resumeUrl = data.resumeUrl;
    }

    const parsedResumeText = await this._atsService.parsePdfFormUrl(
      updatedDto.resumeUrl!,
    );

    const jobDetails = await this._jobservice.populatedJobView(
      dto.jobId.toString(),
    );

    this._logger.log(
      `[applicationService]job discription feth${JSON.stringify(jobDetails)}`,
    );

    const atsScore = this._atsService.calculateScore(
      jobDetails.data?.jobDetails,
      parsedResumeText,
    );

    updatedDto.atsScore = Math.round(atsScore);

    console.log('resume matching score is ', atsScore);

    this._logger.log(
      `[ApplicatonService] data  for applying  user ,${JSON.stringify(updatedDto)}`,
    );
    const previousapplication = await this._applicationRepository.findOne({
      candidateId: candidateObjId,
      jobId: jobid,
    });

    this._logger.log(
      `[ApplicationService] jobDetails of appliyed job ${JSON.stringify(previousapplication)}`,
    );

    if (previousapplication) {
      const jobid: string = previousapplication.jobId.toString();
      if (jobid === dto.jobId) {
        throw new ConflictException(MESSAGES.APPLICATIONS.ALREDY_APPLYED);
      }
    }

    if (atsScore >= 60) {
      updatedDto.Stages = Stages.Shortlisted;
    } else {
      updatedDto.Rejected = true;
    }

    const data = await this._applicationRepository.create(updatedDto);

    await this._emailService.sendApplicationSubmitedEmail(
      updatedDto.email,
      jobDetails.data!,
    );

    if (!data) {
      throw new InternalServerErrorException(
        MESSAGES.APPLICATIONS.SUBMITION_FAILD,
      );
    }

    return {
      message: MESSAGES.APPLICATIONS.SUBMIT_APPLICATION,
    };
  }

  async getAllApplications(
    companyId: string,
    dto: PaginatedApplicationDto,
  ): Promise<PaginatedResponse<ApplicationResponceDto[]>> {
    const { page = 1, limit = 4, search, filtervalue, jobId } = dto;
    this._logger.log(
      `[ApplicationService] request getall application with dto :${JSON.stringify(dto)} and comapayId is : ${companyId}`,
    );

    const filter: FilterQuery<ApplicationDocument> = {};

    if (search) {
      filter.name = { $regex: `^${search}`, $options: 'i' };
    }

    if (filtervalue) {
      filter.Stages = { $regex: `^${filtervalue}`, $options: 'i' };
    }

    filter.companyId = new Types.ObjectId(companyId);
    filter.jobId = new Types.ObjectId(jobId);

    const skip = (page - 1) * limit;
    const { data, total } =
      await this._applicationRepository.populatedApplicationList(filter, {
        skip,
        limit,
      });

    console.log(data);

    const plaindata = data.map((job) => this._mapToPlainObject(job));

    const mappedData = plainToInstance(ApplicationResponceDto, plaindata, {
      excludeExtraneousValues: true,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedData,
      message: MESSAGES.COMPANY.USERS_GET_SUCCESS,
      currentPage: page,
      totalItems: total,
      totalPages: totalPages,
      itemsPerPage: limit,
    };
  }

  async getCompanyApplicants(
    companyId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResponse<ApplicationResponceDto[]>> {
    const { page = 1, limit = 5, search, filtervalue } = dto;
    this._logger.log(
      `[ApplicationService] request get all company applicants with dto :${JSON.stringify(dto)} and companyId is : ${companyId}`,
    );

    const filter: FilterQuery<ApplicationDocument> = {};

    if (search) {
      filter.name = { $regex: `^${search}`, $options: 'i' };
    }

    if (filtervalue) {
      filter.Stages = { $regex: `^${filtervalue}`, $options: 'i' };
    }

    filter.companyId = new Types.ObjectId(companyId);

    const skip = (page - 1) * limit;
    const { data, total } =
      await this._applicationRepository.populatedApplicationList(filter, {
        skip,
        limit,
      });

    const mappedData = plainToInstance(ApplicationResponceDto, data, {
      excludeExtraneousValues: true,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedData,
      message: MESSAGES.COMPANY.USERS_GET_SUCCESS,
      currentPage: page,
      totalItems: total,
      totalPages: totalPages,
      itemsPerPage: limit,
    };
  }

  async updateAtsScore(
    dto: updateAtsScoreDto,
    companyId: string,
  ): Promise<PaginatedResponse<ApplicationResponceDto[]>> {
    const page = 1;
    const limit = 4;
    this._logger.log(
      `[applicationService] updateing new ats score to ${dto.newscore}`,
    );
    const ids = [companyId, dto.jobId];

    const response = await this._applicationRepository.updateAtsScore(
      ids,
      dto.newscore,
    );

    if (!response.acknowledged) {
      throw new Error('Failed to update ATS scores for the specified job.');
    }

    const filter: FilterQuery<ApplicationDocument> = {
      companyId: new Types.ObjectId(companyId),
      jobId: new Types.ObjectId(dto.jobId),
      Stages: { $regex: `^${Stages.Shortlisted}`, $options: 'i' },
    };

    const skip = (page - 1) * limit;
    const { data, total } =
      await this._applicationRepository.populatedApplicationList(filter, {
        skip,
        limit,
      });

    if (!data || data.length === 0) {
      return {
        data: [],
        message: MESSAGES.COMPANY.UPDATE_ATS_SCORE,
        currentPage: page,
        totalItems: 0,
        totalPages: 0,
        itemsPerPage: limit,
      };
    }

    const mappedData = plainToInstance(ApplicationResponceDto, data, {
      excludeExtraneousValues: true,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedData,
      message: MESSAGES.COMPANY.UPDATE_ATS_SCORE,
      currentPage: page,
      totalItems: total,
      totalPages: totalPages,
      itemsPerPage: limit,
    };
  }

  async getjobDetails(
    appId: string,
    canId: string,
  ): Promise<applicationResponce<ApplicationDetailsResponseDto>> {
    console.log(appId, canId);
    const data = await this._applicationRepository.getApplicationDetails(appId);
    if (!data) {
      throw new NotFoundException('Application not found');
    }
    const plainData = this._mapToDetailedPlainObject(data);

    const mappedData = plainToInstance(
      ApplicationDetailsResponseDto,
      plainData,
      {
        excludeExtraneousValues: true,
      },
    );
    this._logger.log(
      `[applicationService] applicationDetails fetched ${JSON.stringify(mappedData)}`,
    );

    return {
      message: MESSAGES.APPLICATIONS.FETCH_APPLICATION_DETAILS,
      data: mappedData,
    };
  }

  async updateStatus(
    appId: string,
    nextStage?: string,
    interviewResult?: string,
  ): Promise<ApplicationDocument | null> {
    const applicationId = new Types.ObjectId(appId);

    if (interviewResult === 'Pass') {
      return this._applicationRepository.update(
        { _id: applicationId },
        { Stages: nextStage as Stages },
      );
    } else {
      return this._applicationRepository.update(
        { _id: applicationId },
        { Rejected: true },
      );
    }
  }

  async getCandidateApplications(
    candidateId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>> {
    const { page = 1, limit = 10, search, filtervalue } = dto;

    this._logger.log(
      `[ApplicationService] Fetching applications for candidate: ${candidateId} with filters: ${JSON.stringify(dto)}`,
    );

    const skip = (page - 1) * limit;

    const { data, total } =
      await this._applicationRepository.getCandidateApplications(
        candidateId,
        { search, filtervalue },
        { skip, limit, sort: { createdAt: -1 } },
      );

    this._logger.log(
      `[ApplicationService] Found ${total} applications for candidate`,
    );

    const plainData = data.map((app: CandidateApplicationAggregation) => ({
      _id: app._id.toString(),
      jobId: app.jobId.toString(),
      companyId: app.companyId.toString(),
      candidateId: app.candidateId.toString(),
      applicationStatus: app.applicationStatus,
      Stages: app.Stages as Stages,
      Rejected: app.Rejected,
      createdAt: app.createdAt.toString(),
      updatedAt: app.updatedAt.toString(),
      atsScore: app.atsScore,
      resumeUrl: app.resumeUrl,
      companyName: app.companyDetails?.name ?? 'N/A',
      companyLogo: app.companyDetails?.logoUrl ?? null,
      jobRole: app.jobDetails?.title ?? 'N/A',
      jobLocation: app.jobDetails?.location ?? [],
      jobType: app.jobDetails?.jobType ?? 'N/A',
    }));

    const mappedData = plainToInstance(
      CandidateApplicationResponseDto,
      plainData,
      {
        excludeExtraneousValues: true,
      },
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedData,
      message: MESSAGES.APPLICATIONS.FETCH_APPLICATION_DETAILS,
      currentPage: page,
      totalItems: total,
      totalPages: totalPages,
      itemsPerPage: limit,
    };
  }

  private _mapToPlainObject(job: populatedapplicationList) {
    return {
      ...job,
      _id: job._id.toString(),
      candidateId: job.candidateId.toString(),
      jobId: job.jobId.toString(),
      companyId: job.companyId.toString(),
      profile: {
        _id: job.profile?._id?.toString() || null,
        profileImg:
          job.profile?.profileUrl || job.candidateUser?.profileImg || null,
      },
      jobDetails: job.jobDetails,
    };
  }

  private _mapToDetailedPlainObject(job: populatedapplicationList) {
    return {
      ...job,
      _id: job._id.toString(),
      candidateId: job.candidateId.toString(),
      jobId: job.jobId.toString(),
      companyId: job.companyId.toString(),
      profile: {
        _id: job.profile?._id?.toString() || '',
        name: job.profile?.name || '',
        aboutme: job.profile?.aboutme || null,
        profileUrl: job.profile?.profileUrl || null,
        coverUrl: job.profile?.coverUrl || null,
        contactInfo: job.profile?.contactInfo || [],
        education: job.profile?.education || [],
        skills: job.profile?.skills || [],
        experience: job.profile?.experience || [],
        resumeUrl: job.profile?.resumeUrl || null,
        portfolioLinks: job.profile?.portfolioLinks || [],
        isActive: job.profile?.isActive ?? true,
      },
      jobDetails: job.jobDetails,
    };
  }
}
