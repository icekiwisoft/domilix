import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { CurrentUser } from './current-user.decorator';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetLinkDto } from './dto/send-reset-link.dto';
import { UpdateAnnouncerProfileDto } from './dto/update-announcer-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';

const announcerUploadDir = path.join(process.cwd(), 'storage', 'announcers');
fs.mkdirSync(announcerUploadDir, { recursive: true });

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiOkResponse({ description: 'Authentication successful' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh an expired access token' })
  refresh(@Req() req: any) {
    const refreshToken = req.body?.refresh_token || req.headers['x-refresh-token'];
    const authorization = req.headers.authorization as string | undefined;
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    return this.authService.refresh(refreshToken || accessToken, !refreshToken && !!accessToken);
  }

  @Post('verifyPhone/:user_id')
  @ApiOperation({ summary: 'Verify phone number using code' })
  @ApiParam({ name: 'user_id', example: '1' })
  verifyPhone(@Param('user_id') userId: string, @Body() dto: VerifyPhoneDto) {
    return this.authService.verifyPhone(userId, dto.verification_code);
  }

  @Post('resendVerificationCode/:user_id')
  @ApiOperation({ summary: 'Resend phone verification code' })
  @ApiParam({ name: 'user_id', example: '1' })
  resendVerificationCode(@Param('user_id') userId: string) {
    return this.authService.resendVerificationCode(userId);
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
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: announcerUploadDir,
        filename: (_req, file, callback) => {
          callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  updateAnnouncerProfilePut(
    @CurrentUser() user: any,
    @Body() dto: UpdateAnnouncerProfileDto,
    @UploadedFile() avatar?: any,
  ) {
    return this.authService.updateAnnouncerProfile(
      user,
      dto,
      avatar ? `/storage/announcers/${avatar.filename}` : undefined,
    );
  }

  @UseGuards(AuthGuard)
  @Post('announcer-profile')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Fallback POST endpoint for announcer profile update' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        company_name: { type: 'string' },
        bio: { type: 'string' },
        professional_phone: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: announcerUploadDir,
        filename: (_req, file, callback) => {
          callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  updateAnnouncerProfilePost(
    @CurrentUser() user: any,
    @Body() dto: UpdateAnnouncerProfileDto,
    @UploadedFile() avatar?: any,
  ) {
    return this.authService.updateAnnouncerProfile(
      user,
      dto,
      avatar ? `/storage/announcers/${avatar.filename}` : undefined,
    );
  }

  @Post('sendEmail')
  @ApiOperation({ summary: 'Send password reset code by email' })
  sendEmail(@Body() dto: SendResetLinkDto) {
    return this.authService.sendResetLinkEmail(dto);
  }

  @Post('resetPassword')
  @ApiOperation({ summary: 'Reset password using verification code' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(AuthGuard)
  @Post('changePassword')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user, dto);
  }
}
