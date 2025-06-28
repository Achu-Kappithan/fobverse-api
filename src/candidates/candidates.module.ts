import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/candidate.schema";
import { CANDIDATE_REPOSITORY } from "./interfaces/candidate-repository.interface";
import { CandidateRepository } from "./candidate.repository";
import { CANDIDATE_SERVICE } from "./interfaces/candidate-service.interface";
import { CandidateService } from "./candidate.service";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ],
    providers:[
        {
            provide: CANDIDATE_REPOSITORY,
            useClass: CandidateRepository
        },
        {
            provide:CANDIDATE_SERVICE,
            useClass:CandidateService
        }
    ],
    exports:[
        CANDIDATE_SERVICE,
        CANDIDATE_REPOSITORY
    ]
})
export class CandiateModule{}