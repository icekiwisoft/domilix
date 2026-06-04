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

  buildNewsletterHtml(content: string, unsubscribeUrl?: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'https://domilix.com';
    const year = new Date().getFullYear();
    const link = unsubscribeUrl || `${frontendUrl}/newsletter/unsubscribe`;
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Domilix</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#E8921A,#f97316);padding:32px 40px;text-align:center;">
              <img src="${frontendUrl}/logo.png" alt="Domilix" width="120" height="auto" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;font-size:15px;line-height:1.7;color:#374151;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">
                &copy; ${year} Domilix. Tous droits reserves.
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                Cet email a ete envoye depuis Domilix. Si vous ne souhaitez plus recevoir nos communications, <a href="${link}" style="color:#E8921A;text-decoration:underline;">desabonnez-vous</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
