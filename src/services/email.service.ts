import { env } from '@config/env';
import { AppError } from '@shared/errors/app-error';
import logger from '@shared/loggers/logger';
import { StatusCodes } from 'http-status-codes';
import nodemailer, { type Transporter } from 'nodemailer';

export class EmailService {
  /**
   * Cria um transporter de teste usando o Ethereal
   */
  private async createTestTransporter(): Promise<Transporter> {
    // Gera uma conta de teste temporária no Ethereal
    const testAccount = await nodemailer.createTestAccount();

    // Cria o objeto transporter do Nodemailer
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    return transporter;
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const subject = 'Redefinição de Senha';
    const html = `
      <div style="margin:0;padding:24px;background-color:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:24px;background:#111827;color:#ffffff;">
                    <h1 style="margin:0;font-size:20px;line-height:1.3;">Redefinição de senha</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                      Você solicitou a redefinição da sua senha.
                    </p>
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                      Use o token abaixo para criar uma nova senha. Ele expira em <strong>15 minutos</strong>.
                    </p>
                    <div style="margin:16px 0 20px 0;padding:14px 16px;background:#f9fafb;border:1px dashed #9ca3af;border-radius:8px;">
                      <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">
                        Token de redefinição
                      </p>
                      <code style="display:block;word-break:break-all;font-size:14px;line-height:1.5;color:#111827;">${resetToken}</code>
                    </div>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                      Se você não solicitou a redefinição, ignore este e-mail.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">
                      Este é um e-mail automático. Não responda esta mensagem.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    try {
      const transporter = await this.createTestTransporter();
      const info = await transporter.sendMail({
        from: `"Email de Teste" <${env.smtpFrom}>`,
        to,
        subject,
        html
      });

      logger.logInfo('------------------------------------');
      logger.logSuccess('📧 E-mail enviado com sucesso!');
      logger.logInfo(`Message ID: ${info.messageId}`);

      // Imprime um link direto para visualizar o e-mail no navegador
      logger.logInfo(`🔗 URL para visualizar o e-mail: ${nodemailer.getTestMessageUrl(info)}`);
      logger.logInfo('------------------------------------');
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
