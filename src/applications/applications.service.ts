import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IApplicationService } from './interfaces/application.service.interface';
import {
  APPLICATION_REPOSITORY,
  IApplicationRepository,
} from './interfaces/application.repository.interface';
import {
  ApiResponse,
  PaginatedResponse,
} from '../shared/responses/api.response';
import { CreateApplicationDto } from './dtos/createapplication.dto';
import { FilterQuery, Types } from 'mongoose';
import { MESSAGES } from '../shared/constants/constants.messages';
import { ApplicationResponseDto } from './dtos/application.response';
import { ApplicationDetailsResponseDto } from './dtos/application-details.response.dto';
import { ApplicationDocument, Stages } from './schema/applications.schema';
import { MappingUtil } from '../shared/utils/mapping.util';
import { PaginationUtil } from '../shared/utils/pagination.util';
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
import { AtsWorkerPoolService } from '../ats-sorting/ats-worker-pool.service';
import {
  InotificationService,
  NOTIFICATION_SERVICE,
} from '../notification/interfaces/notification.service.interface';
import { updateAtsScoreDto } from './dtos/update.atsScore.dto';
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
    @Inject(NOTIFICATION_SERVICE)
    private readonly _notificationService: InotificationService,
    private readonly _emailService: EmailService,
    private readonly _atsWorkerPool: AtsWorkerPoolService,
    private readonly _configService: ConfigService,
  ) {}
  async createApplication(
    dto: CreateApplicationDto,
    id: string,
    companyId: string,
  ): Promise<ApiResponse<unknown>> {
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
      const profile = await this._candidateRepository.findOne({
        UserId: candidateObjId,
      });
      if (!profile?.resumeUrl) {
        throw new BadRequestException('Resume not found in Profile');
      }
      updatedDto.resumeUrl = profile.resumeUrl;
    }

    const jobDetails = await this._jobservice.populatedJobView(
      dto.jobId.toString(),
    );
    this._logger.log(
      `[ApplicationService] Job details fetched for jobId: ${dto.jobId.toString()}`,
    );
    if (!jobDetails.data) {
      throw new NotFoundException('Job details not found');
    }

    const previousApplication = await this._applicationRepository.findOne({
      candidateId: candidateObjId,
      jobId: jobid,
    });
    if (previousApplication) {
      const prevJobId = previousApplication.jobId.toString();
      if (prevJobId === dto.jobId) {
        throw new ConflictException(MESSAGES.APPLICATIONS.ALREADY_APPLIED);
      }
    }

    updatedDto.atsScore = 0;
    updatedDto.Stages = Stages.Default;

    const data = await this._applicationRepository.create(updatedDto);

    if (!data) {
      throw new InternalServerErrorException(
        MESSAGES.APPLICATIONS.SUBMISSION_FAILED,
      );
    }

    void this._atsWorkerPool.runAtsJob({
      applicationId: data._id.toString(),
      resumeUrl: updatedDto.resumeUrl!,
      cloudinaryBaseUrl:
        this._configService.get<string>('CLOUDINARY_BASEURL') ?? '',
      atsCriteria: 60,
      jobDetails: {
        title: jobDetails.data.jobDetails.title,
        description: jobDetails.data.jobDetails.description,
        responsibility: jobDetails.data.jobDetails.responsibility,
        skills: jobDetails.data.jobDetails.skills ?? [],
        location: jobDetails.data.jobDetails.location ?? [],
      },
    });

    try {
      await this._emailService.sendApplicationSubmitedEmail(
        updatedDto.email,
        jobDetails.data,
      );
    } catch (error: unknown) {
      this._logger.warn(
        `[ApplicationService] Email send failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    try {
      await this._notificationService.createApplicationSubmittedNotification(
        id,
        jobDetails.data.jobDetails.title,
      );
    } catch (error: unknown) {
      this._logger.warn(
        `[ApplicationService] Notification failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    return { message: MESSAGES.APPLICATIONS.SUBMIT_APPLICATION };
  }

  async getAllApplications(
    companyId: string,
    dto: PaginatedApplicationDto,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>> {
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
    const plaindata = data.map((job) => this._mapToPlainObject(job));
    const mappedData = MappingUtil.map(ApplicationResponseDto, plaindata);
    return PaginationUtil.toPaginatedResponse(
      mappedData,
      total,
      page,
      limit,
      MESSAGES.COMPANY.USERS_GET_SUCCESS,
    );
  }
  async getCompanyApplicants(
    companyId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>> {
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
    const plaindata = data.map((job) => this._mapToPlainObject(job));
    const mappedData = MappingUtil.map(ApplicationResponseDto, plaindata);
    return PaginationUtil.toPaginatedResponse(
      mappedData,
      total,
      page,
      limit,
      MESSAGES.COMPANY.USERS_GET_SUCCESS,
    );
  }
  async updateAtsScore(
    dto: updateAtsScoreDto,
    companyId: string,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>> {
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
    const plaindata = data.map((job) => this._mapToPlainObject(job));
    const mappedData = MappingUtil.map(ApplicationResponseDto, plaindata);
    return PaginationUtil.toPaginatedResponse(
      mappedData,
      total,
      page,
      limit,
      MESSAGES.COMPANY.UPDATE_ATS_SCORE,
    );
  }
  async getjobDetails(
    appId: string,
    canId: string,
  ): Promise<ApiResponse<ApplicationDetailsResponseDto>> {
    console.log(appId, canId);
    const data = await this._applicationRepository.getApplicationDetails(appId);
    if (!data) {
      throw new NotFoundException('Application not found');
    }
    const plainData = this._mapToDetailedPlainObject(data);
    const mappedData = MappingUtil.map(
      ApplicationDetailsResponseDto,
      plainData,
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
    const application = await this._applicationRepository.findById(appId);
    if (!application) return null;
    const jobDetails = await this._jobservice.populatedJobView(
      application.jobId.toString(),
    );
    const jobData = jobDetails.data as unknown as {
      profile?: { name: string }[];
      jobDetails?: { title: string };
    };
    const companyName = jobData?.profile?.[0]?.name || 'the company';
    const jobTitle = jobData?.jobDetails?.title || 'the position';
    if (interviewResult === 'Pass' || nextStage === Stages.Shortlisted) {
      const updated = await this._applicationRepository.update(
        { _id: applicationId },
        { Stages: (nextStage as Stages) || Stages.Shortlisted },
      );
      if (updated) {
        await this._notificationService.createApplicationShortlistedNotification(
          application.candidateId.toString(),
          jobTitle,
        );
        await this._emailService.SendApplicationShortlistedEmail(
          application.email,
          jobTitle,
          companyName,
        );
      }
      return updated;
    } else {
      const updated = await this._applicationRepository.update(
        { _id: applicationId },
        { Rejected: true },
      );
      if (updated) {
        await this._notificationService.createApplicationRejectedNotification(
          application.candidateId.toString(),
          jobTitle,
        );
        await this._emailService.SendApplicationRejectedEmail(
          application.email,
          jobTitle,
          companyName,
        );
      }
      return updated;
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
    const mappedData = MappingUtil.map(
      CandidateApplicationResponseDto,
      plainData,
    );
    return PaginationUtil.toPaginatedResponse(
      mappedData,
      total,
      page,
      limit,
      MESSAGES.APPLICATIONS.FETCH_APPLICATION_DETAILS,
    );
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
