import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as PdfParse from 'pdf-parse';
import { IAtsService } from './interfaces/ats.service.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AtsSortingService implements IAtsService {
  constructor(private readonly configService: ConfigService) {}

  async parsePdfFromUrl(url: string): Promise<string> {
    const baseUrl = this.configService.get<string>('CLOUDINARY_BASEURL');
    const completeUrl = baseUrl + url;
    console.log(completeUrl);

    const response = await axios.get(completeUrl, {
      responseType: 'arraybuffer',
    });

    if (!response.data) {
      throw new Error('Failed to fetch PDF data');
    }

    const pdfBuffer = Buffer.from(response.data);
    const data = await PdfParse(pdfBuffer);

    return data.text || '';
  }
}
