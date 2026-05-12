import { BadRequestException, Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private transporter: Transporter | null = null;

  ensureConfigured() {
    if (!process.env.MAIL_HOST && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Configuration email manquante.');
    }
  }

  private getTransporter() {
    this.ensureConfigured();

    if (!process.env.MAIL_HOST) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT || 587),
        secure: process.env.MAIL_SECURE === 'true',
        auth: process.env.MAIL_USERNAME
          ? {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
            }
          : undefined,
      });
    }

    return this.transporter;
  }

  private fromAddress() {
    return `"${process.env.MAIL_FROM_NAME || 'Domilix'}" <${process.env.MAIL_FROM_ADDRESS || 'noreply@domilix.com'}>`;
  }

  async send(message: MailMessage) {
    const transporter = this.getTransporter();

    if (!transporter) {
      return;
    }

    await transporter.sendMail({
      from: this.fromAddress(),
      ...message,
    });
  }

  async sendPasswordResetLink(email: string, resetUrl: string) {
    await this.send({
      to: email,
      subject: 'Lien de reinitialisation de votre mot de passe Domilix',
      text: `Cliquez sur ce lien pour reinitialiser votre mot de passe Domilix : ${resetUrl}`,
      html: `
        <p>Vous avez demande la reinitialisation de votre mot de passe Domilix.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#f97316;color:#ffffff;text-decoration:none;font-weight:700;">Reinitialiser mon mot de passe</a></p>
        <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });
  }

  async sendEmailVerificationCode(email: string, code: string) {
    await this.send({
      to: email,
      subject: 'Code de verification de votre email Domilix',
      text: `Votre code de verification Domilix est : ${code}`,
      html: `<p>Votre code de verification Domilix est :</p><p><strong>${code}</strong></p>`,
    });
  }
}
