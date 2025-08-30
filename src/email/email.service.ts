import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';
import { populatedjobResDto } from '../jobs/dtos/populated.jobs.dto';

@Injectable()
export class EmailService {
  private _frontendUrl: string;
  private _senderEmail: string;
  private _transporter: Mail;
  private readonly _logger = new Logger(EmailService.name);

  constructor(private readonly _confiService: ConfigService) {
    this._frontendUrl = this._confiService.get<string>('FRONTEND_URL') ?? '';
    this._senderEmail =
      this._confiService.get<string>('EMAIL_USER') ?? 'fobverseweb@gmail.com';

    this._transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this._confiService.get<string>('EMAIL_USER'),
        pass: this._confiService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    from?: string,
  ): Promise<void> {
    const mailOptions = {
      from: from || `"FobVerse" <${this._senderEmail}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    try {
      await this._transporter.sendMail(mailOptions);
      this._logger.log(`Verification email sent to ${to}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this._logger.error(
          `Failed to send verification email to ${to}: ${error.message}`,
          error.stack,
        );
      }
      throw new Error(
        'Could not send verification email. Please try again later.',
      );
    }
  }

  async sendVerificationEmail(
    to: string,
    verificationjwt: string,
  ): Promise<void> {
    const verificationLink = `${this._frontendUrl}/email/verification?token=${verificationjwt}`;
    const subject = 'Verify Your Email Address for FobVerse';
    const htmlContent = `
            <div style="background-color: #f3f4f6; padding: 20px; font-family: Arial, Helvetica, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #7B3FE4;">
                            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Fobverse</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 20px; text-align: center;">
                            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">Verify Your Email Address</h2>
                            <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
                                Hello,
                            </p>
                            <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
                                Thank you for registering with Fobverse. Please click the button below to verify your email address:
                            </p>
                            <p style="margin-bottom: 20px;">
                                <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #7B3FE4; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 500;">
                                    Verify Email
                                </a>
                            </p>
                            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                                If the button doesn't work, copy and paste this link into your browser:
                                <br>
                                <a href="${verificationLink}" style="color: #a78bfa; text-decoration: underline; word-break: break-all;">${verificationLink}</a>
                            </p>
                            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                                This link will expire in 24 hours.
                            </p>
                            <p style="color: #6b7280; font-size: 14px;">
                                If you did not register for a Fobverse account, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #f3f4f6;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                © 2025 Fobverse. All rights reserved.
                            </p>
                            <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                                <a href="https://fobverse.com" style="color: #a78bfa; text-decoration: none;">Visit our website</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
        `;

    await this.sendEmail(to, subject, htmlContent);
  }

  async sendForgotPasswordEmail(to: string, token: string): Promise<void> {
    const resetLink = `${this._frontendUrl}/forgotpassword/newpassword?token=${token}`;
    const subject = 'Verify Your Email Address for FobVerse';
    const htmlContent = `<div style="background-color: #f3f4f6; padding: 20px; font-family: Arial, Helvetica, sans-serif;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
              <tr>
                  <td style="padding: 20px; text-align: center; background-color: #7B3FE4;">
                      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Fobverse</h1>
                  </td>
              </tr>
              <tr>
                  <td style="padding: 40px 20px; text-align: center;">
                      <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">Reset Your Password</h2>
                      <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
                          Hello,
                      </p>
                      <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
                          You requested to reset your password for your Fobverse account. Please click the button below to set a new password:
                      </p>
                      <p style="margin-bottom: 20px;">
                          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #7B3FE4; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 500;">
                              Reset Password
                          </a>
                      </p>
                      <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                          If the button doesn't work, copy and paste this link into your browser:
                          <br>
                          <a href="${resetLink}" style="color: #a78bfa; text-decoration: underline; word-break: break-all;">${resetLink}</a>
                      </p>
                      <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                          This link will expire in 24 hours.
                      </p>
                      <p style="color: #6b7280; font-size: 14px;">
                          If you did not request a password reset, please ignore this email or contact support if you have concerns.
                      </p>
                  </td>
              </tr>
              <tr>
                  <td style="padding: 20px; text-align: center; background-color: #f3f4f6;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0;">
                          © 2025 Fobverse. All rights reserved.
                      </p>
                      <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                          <a href="https://fobverse.com" style="color: #a78bfa; text-decoration: none;">Visit our website</a>
                      </p>
                  </td>
              </tr>
          </table>
      </div>`;

    await this.sendEmail(to, subject, htmlContent);
  }

  async sendApplicationSubmitedEmail(
    to: string,
    jobDetails: populatedjobResDto,
  ): Promise<void> {
    const subject = `Application Received for ${jobDetails.jobDetails.title} at ${jobDetails.profile[0]?.name}`;
    const htmlContent = `
        <div style="background-color: #f3f4f6; padding: 20px; font-family: Arial, Helvetica, sans-serif;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
                <tr>
                    <td style="padding: 20px; text-align: center; background-color: #7B3FE4;">
                        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Fobverse</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px 20px; text-align: center;">
                        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">Application Successfully Submitted!</h2>
                        <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
                            Hello,
                        </p>
                        <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
                            This is to confirm that your application for the following position has been successfully submitted.
                        </p>
                        <div style="text-align: left; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Job Details</h3>
                            <p style="margin: 0; font-size: 16px;"><strong>Position:</strong> ${jobDetails.jobDetails.title}</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Company:</strong> ${jobDetails.profile[0]?.name}</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Location(s):</strong> ${jobDetails.jobDetails.location.join(', ')}</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Job Type:</strong> ${jobDetails.jobDetails.jobType}</p>
                        </div>
                        <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
                            The hiring team will review your application and will contact you if your qualifications meet their requirements.
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">
                            Thank you for using Fobverse to find your next career opportunity.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; text-align: center; background-color: #f3f4f6;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            © 2025 Fobverse. All rights reserved.
                        </p>
                        <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                            <a href="https://fobverse.com" style="color: #a78bfa; text-decoration: none;">Visit our website</a>
                        </p>
                    </td>
                </tr>
            </table>
        </div>
    `;

    await this.sendEmail(to, subject, htmlContent);
  }
}
