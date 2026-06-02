import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UploadExceptionFilter } from '../common/filters/upload-exception.filter';
import { UploadsService } from './uploads.service';
import type { UploadType } from './uploads.service';

@ApiTags('Uploads')
@UseGuards(AuthGuard)
@UseFilters(UploadExceptionFilter)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload one file to object storage' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['type', 'file'],
      properties: {
        type: {
          type: 'string',
          enum: ['media', 'avatar', 'presentation-image'],
        },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: any,
    @Body('type') type: UploadType,
    @UploadedFile() file?: any,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni.');
    return this.uploadsService.upload(user, type, file);
  }
}
