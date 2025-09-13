export interface IAtsService {
  parsePdfFromUrl(url: string): Promise<string>;
}

export const ATS_SERVICE = 'ATS_SERVICE';
