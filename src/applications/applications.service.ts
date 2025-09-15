import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
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
import { ApplicationDocument } from './schema/applications.schema';
import { plainToInstance } from 'class-transformer';
import { PaginatedApplicationDto } from './dtos/application.pagination.dto';
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
    // console.log(`resume text extracted ${parsedResumeText}`);

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
    const { page = 1, limit = 6, search, filtervalue, jobId } = dto;
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

    console.log('data: ', JSON.stringify(data));

    const plaindata = data.map((job) => {
      return {
        ...job,
        candidateId: job.candidateId.toString(),
        _id: job._id.toString(),
        profile: job.profile?.[0]?.profileUrl || null,
      };
    });

    const mappedData = plainToInstance(ApplicationResponceDto, plaindata, {
      excludeExtraneousValues: true,
    });

    console.log(' mapped data ', mappedData);

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
}
