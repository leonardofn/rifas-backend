import { env } from '@config/env';
import { AppError } from '@shared/errors/app-error';
import logger from '@shared/loggers/logger';
import { StatusCodes } from 'http-status-codes';
import nodemailer, { type Transporter } from 'nodemailer';

export class EmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      auth:
        env.smtpUser && env.smtpPassword
          ? { user: env.smtpUser, pass: env.smtpPassword }
          : undefined
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const subject = 'Redefinição de senha';
    const html = `
      <p>Você solicitou a redefinição da sua senha.</p>
      <p>Use o token abaixo para criar uma nova senha. Ele expira em <strong>15 minutos</strong>.</p>
      <p><code>${resetToken}</code></p>
      <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: env.smtpFrom,
        to,
        subject,
        html
      });
    } catch (error) {
      logger.logError(
        `Falha ao enviar e-mail de redefinição de senha para ${to}: ${String(error)}`
      );
      throw new AppError(
        'Não foi possível enviar o e-mail de redefinição. Tente novamente mais tarde.',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
