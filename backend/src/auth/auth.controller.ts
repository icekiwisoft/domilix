import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import { validateUploadedFile } from '../common/media/validate-upload';
import { CurrentUser } from './current-user.decorator';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { FirebaseAuthDto } from './dto/firebase-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetLinkDto } from './dto/send-reset-link.dto';
import { UpdateAnnouncerProfileDto } from './dto/update-announcer-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly objectStorage: ObjectStorageService,
  ) {}

  private async uploadOptionalProfileFile(
    file: any | undefined,
    folder: string,
    existingUrl?: string,
  ) {
    if (existingUrl) return existingUrl;
    if (!file) return undefined;

    try {
      await validateUploadedFile(file, {
        allowImages: true,
        allowVideos: false,
        maxSize: 10 * 1024 * 1024,
        context: `auth.${folder}`,
      });
      return (await this.objectStorage.uploadFile(file, folder)).url;
    } catch {
      throw new InternalServerErrorException(
        'Impossible d uploader le fichier.',
      );
    }
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiOkResponse({ description: 'Authentication successful' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('firebase')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate a user with Firebase Auth' })
  @ApiOkResponse({ description: 'Authentication successful' })
  firebaseLogin(@Body() dto: FirebaseAuthDto) {
    return this.authService.firebaseLogin(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh an expired access token' })
  refresh(@Req() req: any) {
    const refreshToken =
      req.body?.refresh_token || req.headers['x-refresh-token'];
    const authorization = req.headers.authorization as string | undefined;
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    return this.authService.refresh(
      refreshToken || accessToken,
      !refreshToken && !!accessToken,
    );
  }

  @Post('verifyPhone/:user_id')
  @ApiOperation({ summary: 'Verify phone number using code' })
  @ApiParam({ name: 'user_id', example: '1' })
  verifyPhone(@Param('user_id') userId: string, @Body() dto: VerifyPhoneDto) {
    return this.authService.verifyPhone(userId, dto.verification_code);
  }

  @Post('resendVerificationCode/:user_id')
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  @ApiOperation({ summary: 'Resend phone verification code' })
  @ApiParam({ name: 'user_id', example: '1' })
  resendVerificationCode(@Param('user_id') userId: string) {
    return this.authService.resendVerificationCode(userId);
  }

  @UseGuards(AuthGuard)
  @Post('sendEmailVerification')
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email verification code to current user' })
  sendEmailVerification(@CurrentUser() user: any) {
    return this.authService.sendEmailVerification(user);
  }

  @UseGuards(AuthGuard)
  @Post('verifyEmail')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify current user email using code' })
  verifyEmail(@CurrentUser() user: any, @Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(user, dto.verification_code);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  async logout(@Req() req: any, @Res() res: any) {
    await this.authService.logout(
      req.authToken,
      req.body?.refresh_token || req.headers['x-refresh-token'],
    );
    return res.status(203).send();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated profile' })
  me(@CurrentUser() user: any) {
    return this.authService.profile(user);
  }

  @UseGuards(AuthGuard)
  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current authenticated profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user, dto);
  }

  @UseGuards(AuthGuard)
  @Put('announcer-profile')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update announcer profile with optional avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string' },
        bio: { type: 'string' },
        professional_phone: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
        presentation: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'presentation', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  async updateAnnouncerProfilePut(
    @CurrentUser() user: any,
    @Body() dto: UpdateAnnouncerProfileDto,
    @UploadedFiles() files?: { avatar?: any[]; presentation?: any[] },
  ) {
    const avatar = files?.avatar?.[0];
    const presentation = files?.presentation?.[0];
    return this.authService.updateAnnouncerProfile(
      user,
      dto,
      await this.uploadOptionalProfileFile(
        avatar,
        'announcers',
        (dto as any).avatar_url,
      ),
      await this.uploadOptionalProfileFile(
        presentation,
        'announcers',
        (dto as any).presentation_url,
      ),
    );
  }

  @UseGuards(AuthGuard)
  @Post('announcer-profile')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Fallback POST endpoint for announcer profile update',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string' },
        bio: { type: 'string' },
        professional_phone: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
        presentation: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'presentation', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  async updateAnnouncerProfilePost(
    @CurrentUser() user: any,
    @Body() dto: UpdateAnnouncerProfileDto,
    @UploadedFiles() files?: { avatar?: any[]; presentation?: any[] },
  ) {
    const avatar = files?.avatar?.[0];
    const presentation = files?.presentation?.[0];
    return this.authService.updateAnnouncerProfile(
      user,
      dto,
      await this.uploadOptionalProfileFile(
        avatar,
        'announcers',
        (dto as any).avatar_url,
      ),
      await this.uploadOptionalProfileFile(
        presentation,
        'announcers',
        (dto as any).presentation_url,
      ),
    );
  }

  @Post('sendEmail')
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  @ApiOperation({ summary: 'Send password reset code by email' })
  sendEmail(@Body() dto: SendResetLinkDto) {
    return this.authService.sendResetLinkEmail(dto);
  }

  @Post('resetPassword')
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  @ApiOperation({ summary: 'Reset password using verification code' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current authenticated account' })
  deleteAccount(@CurrentUser() user: any, @Body() dto: DeleteAccountDto) {
    return this.authService.deleteAccount(user, dto);
  }

  @UseGuards(AuthGuard)
  @Post('changePassword')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user, dto);
  }
}
