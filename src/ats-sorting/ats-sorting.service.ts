import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as PdfParse from 'pdf-parse';
import * as stopword from 'stopword';
import { IAtsService } from './interfaces/ats.service.interface';
import { ConfigService } from '@nestjs/config';
import { ResponseJobsDto } from '../jobs/dtos/responce.job.dto';
import * as nlp from 'compromise';

@Injectable()
export class AtsSortingService implements IAtsService {
  constructor(private readonly configService: ConfigService) {}

  async parsePdfFormUrl(url: string): Promise<string> {
    const baseUrl = this.configService.get<string>('CLOUDINARY_BASEURL');
    const completeUrl = baseUrl + url;
    console.log(completeUrl);

    const response = await axios.get(completeUrl, {
      responseType: 'arraybuffer',
    });

    if (!response.data) {
      throw new Error('Failed to fetch PDF data');
    }

    const pdfBuffer = Buffer.from(response.data as ArrayBuffer);
    const data = await PdfParse(pdfBuffer);

    return data.text || '';
  }

  calculateScore(jobDetails: ResponseJobsDto, resumeText: string): number {
    if (!jobDetails || !resumeText) {
      return 0;
    }
    return this.calculateFinalScore(jobDetails, resumeText);
  }

  normalizeText(text: string): string[] {
    const processedText = nlp(text.toLowerCase());
    const outArray = processedText.terms().out('array');
    return stopword.removeStopwords(outArray);
  }

  private calculateKeywordScore(
    jobDetails: ResponseJobsDto,
    resumeText: string,
  ): number {
    const weights = {
      responsibility: 1.2,
      skills: 2.0,
      location: 0.5,
    };

    let totalPossibleScore = 0;
    let achievedScore = 0;
    const resumeWords = new Set(this.normalizeText(resumeText));
    console.log(resumeWords);

    if (jobDetails.skills) {
      const skillKeywords = new Set(
        jobDetails.skills.map((skill) => skill.toLowerCase()),
      );
      totalPossibleScore += skillKeywords.size * weights.skills;
      for (const keyword of skillKeywords) {
        if (resumeWords.has(keyword)) {
          achievedScore += weights.skills;
        }
      }
    }

    if (jobDetails.responsibility) {
      const responsibilityKeywords = new Set(
        this.normalizeText(jobDetails.responsibility),
      );
      totalPossibleScore +=
        responsibilityKeywords.size * weights.responsibility;
      for (const keyword of responsibilityKeywords) {
        if (resumeWords.has(keyword)) {
          achievedScore += weights.responsibility;
        }
      }
    }

    if (jobDetails.location) {
      const locationKeywords = new Set(
        jobDetails.location.map((loc) => loc.toLowerCase()),
      );
      totalPossibleScore += locationKeywords.size * weights.location;
      for (const keyword of locationKeywords) {
        if (resumeWords.has(keyword)) {
          achievedScore += weights.location;
        }
      }
    }

    console.log('totoal possible score', totalPossibleScore);
    console.log('totoal achived score', achievedScore);

    return totalPossibleScore > 0 ? achievedScore / totalPossibleScore : 0;
  }

  private calculateExperienceScore(
    jobDetails: ResponseJobsDto,
    resumeText: string,
  ): number {
    const jobYearsMatch = jobDetails.description?.match(
      /(\d+)\+? years? of experience/i,
    );
    if (!jobYearsMatch) {
      return 1.0;
    }

    const requiredYears = parseInt(jobYearsMatch[1], 10);

    const experienceRegex = /(\d{4})\s*-\s*(\d{4}|present|current)/gi;
    let totalExperienceYears = 0;
    let match: RegExpExecArray | null;

    while ((match = experienceRegex.exec(resumeText)) !== null) {
      const startYear = parseInt(match[1], 10);
      const endYear =
        match[2].toLowerCase() === 'present' ||
        match[2].toLowerCase() === 'current'
          ? new Date().getFullYear()
          : parseInt(match[2], 10);
      totalExperienceYears += endYear - startYear;
    }

    const yearsPhraseMatch = resumeText.match(/(\d+)\s*years?\s*experience/i);
    if (yearsPhraseMatch) {
      const yearsFromPhrase = parseInt(yearsPhraseMatch[1], 10);
      totalExperienceYears = Math.max(totalExperienceYears, yearsFromPhrase);
    }

    if (totalExperienceYears >= requiredYears) {
      return 1.0;
    } else {
      return totalExperienceYears / requiredYears;
    }
  }

  private calculateFinalScore(
    jobDetails: ResponseJobsDto,
    resumeText: string,
  ): number {
    console.log(`jobdetails: => ${JSON.stringify(jobDetails)}`);
    console.log(`parsed resume: => ${resumeText}`);
    const keywordScore = this.calculateKeywordScore(jobDetails, resumeText);
    console.log(keywordScore);
    const experienceScore = this.calculateExperienceScore(
      jobDetails,
      resumeText,
    );

    const finalScore = keywordScore * 0.7 + experienceScore * 0.3;

    return parseFloat((finalScore * 100).toFixed(2));
  }
}
