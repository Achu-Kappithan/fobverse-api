import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { AuthGuard } from '@nestjs/passport';
import { SignatureRequestDto } from './dtos/signatureRequestDto';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly _cloudinaryService: CloudinaryService) {}

  @Post('sign-upload')
  @UseGuards(AuthGuard('access_token'))
  signUpload(@Body() body: SignatureRequestDto) {
    return this._cloudinaryService.generateUploadSignature({
      folder: body.folder,
      public_id_prefix: body.publicIdPrefix,
      tags: body.tags,
    });
  }
}
