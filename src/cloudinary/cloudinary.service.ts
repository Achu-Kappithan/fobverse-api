import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary'

@Injectable()
export class CloudinaryService {
    logger = new Logger(CloudinaryService.name)

    constructor(
        private readonly _configService:ConfigService
    ){
        cloudinary.config({
            cloud_name: this._configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this._configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this._configService.get<string>('CLOUDINARY_API_SECRET'),
            secure: true, 
        })
        this.logger.log(`[CloudinaryService]  cloudinay initialized `)
    }

    generateUploadSignature(options: {
    folder: string;
    public_id_prefix?: string; 
    tags?: string[]; 
  }): {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    publicId?: string; 
  } {
    const timestamp = Math.round(new Date().getTime() / 1000); 

    const paramsToSign: { [key: string]: any } = {
      timestamp: timestamp,
      folder: options.folder, 
    };

    let publicIdGenerated: string | undefined;
    if (options.public_id_prefix) {
        publicIdGenerated = `${options.folder}/${options.public_id_prefix}_${timestamp}`;
        paramsToSign.public_id = publicIdGenerated;
    }

    if (options.tags && options.tags.length > 0) {
      paramsToSign.tags = options.tags.join(','); 
    }

    try {
      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        this._configService.get<string>('CLOUDINARY_API_SECRET')!
      );

      this.logger.debug(`Generated signature for folder: ${options.folder}`);

      return {
        signature: signature,
        timestamp: timestamp,
        apiKey: this._configService.get<string>('CLOUDINARY_API_KEY')!,
        cloudName: this._configService.get<string>('CLOUDINARY_CLOUD_NAME')!,
        publicId: publicIdGenerated, 
      };
    } catch (error) {
      this.logger.error('Error generating Cloudinary signature:', error.message, error.stack);
      throw new InternalServerErrorException('Failed to generate upload signature');
    }
  }




    
}
