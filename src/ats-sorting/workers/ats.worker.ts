import { parentPort } from 'worker_threads';
import axios from 'axios';
import * as PdfParse from 'pdf-parse';
import * as stopword from 'stopword';
import * as nlp from 'compromise';
import type {
  AtsWorkerInput,
  AtsWorkerOutput,
} from '../interfaces/ats.service.interface';

if (!parentPort) {
  throw new Error('ats.worker.ts must run as a Worker thread.');
}

async function parsePdfFromUrl(
  url: string,
  cloudinaryBaseUrl: string,
): Promise<string> {
  const completeUrl = url.startsWith('http') ? url : `${cloudinaryBaseUrl}${url}`;

  const response = await axios.get<ArrayBuffer>(completeUrl, {
    responseType: 'arraybuffer',
    timeout: 15_000,
  });

  if (!response.data) {
    throw new Error('Empty response body when downloading PDF');
  }

  const pdfBuffer = Buffer.from(response.data);
  const parsed = await PdfParse(pdfBuffer);
  return parsed.text ?? '';
}

function normaliseText(text: string): Set<string> {
  const processed = nlp(text.toLowerCase());
  const terms = processed.terms().out('array');
  const withoutStopWords = stopword.removeStopwords(terms);
  return new Set(withoutStopWords);
}

function calculateKeywordScore(
  jobDetails: AtsWorkerInput['jobDetails'],
  resumeWords: Set<string>,
): number {
  const weights = { skills: 2.0, responsibility: 1.2, location: 0.5 };
  let totalPossible = 0;
  let achieved = 0;

  if (jobDetails.skills?.length) {
    const skillSet = new Set(jobDetails.skills.map((s) => s.toLowerCase()));
    totalPossible += skillSet.size * weights.skills;
    for (const skill of skillSet) {
      if (resumeWords.has(skill)) achieved += weights.skills;
    }
  }

  if (jobDetails.responsibility) {
    const respWords = normaliseText(jobDetails.responsibility);
    totalPossible += respWords.size * weights.responsibility;
    for (const word of respWords) {
      if (resumeWords.has(word)) achieved += weights.responsibility;
    }
  }

  if (jobDetails.location?.length) {
    const locSet = new Set(jobDetails.location.map((l) => l.toLowerCase()));
    totalPossible += locSet.size * weights.location;
    for (const loc of locSet) {
      if (resumeWords.has(loc)) achieved += weights.location;
    }
  }

  return totalPossible > 0 ? achieved / totalPossible : 0;
}

function calculateExperienceScore(
  description: string,
  resumeText: string,
): number {
  const jobYearsMatch = description?.match(/(\d+)\+? years? of experience/i);
  if (!jobYearsMatch) return 1.0;

  const requiredYears = parseInt(jobYearsMatch[1], 10);
  const rangeRegex = /(\d{4})\s*-\s*(\d{4}|present|current)/gi;
  let totalYears = 0;
  let match: RegExpExecArray | null;

  while ((match = rangeRegex.exec(resumeText)) !== null) {
    const start = parseInt(match[1], 10);
    const end =
      match[2].toLowerCase() === 'present' ||
      match[2].toLowerCase() === 'current'
        ? new Date().getFullYear()
        : parseInt(match[2], 10);
    totalYears += end - start;
  }

  const phraseMatch = resumeText.match(/(\d+)\s*years?\s*experience/i);
  if (phraseMatch) {
    totalYears = Math.max(totalYears, parseInt(phraseMatch[1], 10));
  }

  return totalYears >= requiredYears ? 1.0 : totalYears / requiredYears;
}

function calculateFinalScore(
  jobDetails: AtsWorkerInput['jobDetails'],
  resumeText: string,
): number {
  const resumeWords = normaliseText(resumeText);
  const keywordScore = calculateKeywordScore(jobDetails, resumeWords);
  const experienceScore = calculateExperienceScore(
    jobDetails.description ?? '',
    resumeText,
  );
  const raw = keywordScore * 0.7 + experienceScore * 0.3;
  return parseFloat((raw * 100).toFixed(2));
}

parentPort.on('message', (input: AtsWorkerInput) => {
  const { applicationId, resumeUrl, cloudinaryBaseUrl, jobDetails } = input;

  void (async () => {
    try {
      const resumeText = await parsePdfFromUrl(resumeUrl, cloudinaryBaseUrl);
      const atsScore = calculateFinalScore(jobDetails, resumeText);

      const result: AtsWorkerOutput = {
        success: true,
        applicationId,
        atsScore: isNaN(atsScore) ? 0 : Math.round(atsScore),
      };

      parentPort!.postMessage(result);
    } catch (err: unknown) {
      const result: AtsWorkerOutput = {
        success: false,
        applicationId,
        error: err instanceof Error ? err.message : 'Unknown worker error',
      };

      parentPort!.postMessage(result);
    }
  })();
});
