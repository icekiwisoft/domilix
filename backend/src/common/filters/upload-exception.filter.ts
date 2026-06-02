import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(MulterError, Error)
export class UploadExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        message: 'Fichier trop volumineux.',
        code: error.code,
      });
    }

    if (error.message === 'Request aborted') {
      return response.status(499).json({
        message: 'Upload interrompu avant la fin du transfert.',
        code: 'REQUEST_ABORTED',
      });
    }

    throw error;
  }
}
