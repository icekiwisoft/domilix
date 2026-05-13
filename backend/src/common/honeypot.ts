import { BadRequestException, Logger } from '@nestjs/common';

const logger = new Logger('Security');

export function assertHoneypotClear(value: unknown, context = 'honeypot') {
  if (typeof value === 'string' && value.trim()) {
    logger.warn(`${context}: honeypot field was filled`);
    throw new BadRequestException('Invalid submission.');
  }
}
