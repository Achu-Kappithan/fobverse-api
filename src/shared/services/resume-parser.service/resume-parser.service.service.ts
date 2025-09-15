import { Injectable } from '@nestjs/common';
import axios from 'axios';
import PdfParse from 'pdf-parse';

@Injectable()
export class ResumeParserServiceService {
  async parsePdfFromUrl(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    if (!response.data) {
      throw new Error('Failed to fetch PDF data');
    }

    const pdfBuffer = Buffer.from(response.data);
    const data = await PdfParse(pdfBuffer);

    return data.text || '';
  }
}
