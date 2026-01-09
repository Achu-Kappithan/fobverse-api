import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';
import { populatedjobResDto } from '../jobs/dtos/populated.jobs.dto';
import { ScheduleResponseDto } from '../interview/dtos/interview.responce.dto';

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

  async SendInterviewEmail(
    to: string,
    data: ScheduleResponseDto,
    type: 'Scheduled' | 'Rescheduled',
  ): Promise<void> {
    const subject =
      type === 'Scheduled'
        ? `Your ${data.stage} Interview Has Been Scheduled`
        : `Your ${data.stage} Interview Has Been Rescheduled`;

    const greetingMessage =
      type === 'Scheduled'
        ? `We are pleased to inform you that your <strong>${data.stage}</strong> interview has been scheduled.`
        : `Your <strong>${data.stage}</strong> interview has been <strong>rescheduled</strong>. Please find your updated details below.`;

    const meetingSection = data.meetingLink
      ? `
      <p style="margin: 10px 0; font-size: 16px;">
        <strong>Meeting Link:</strong> 
        <a href="${data.meetingLink}" style="color: #7B3FE4; text-decoration: underline;">
          Join Meeting
        </a>
      </p>
    `
      : `
      <p style="margin: 10px 0; font-size: 16px;">
        <strong>Meeting Mode:</strong> Offline / In-person
      </p>
    `;

    const htmlContent = `
    <div style="background-color: #f3f4f6; padding: 20px; font-family: Arial, Helvetica, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" 
        width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
        
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #7B3FE4;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Fobverse</h1>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">
              ${type === 'Scheduled' ? 'Your Interview Is Scheduled!' : 'Your Interview Has Been Rescheduled!'}
            </h2>

            <p style="color: #6b7280; font-size: 16px; margin: 0 0 20px;">Hello,</p>

            <p style="color: #6b7280; font-size: 16px; margin: 0 0 20px;">
              ${greetingMessage}
            </p>

            <div style="text-align: left; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Interview Details</h3>

              <p style="margin: 10px 0; font-size: 16px;">
                <strong>Stage:</strong> ${data.stage}
              </p>

              <p style="margin: 10px 0; font-size: 16px;">
                <strong>Date:</strong> ${data.scheduledDate}
              </p>

              <p style="margin: 10px 0; font-size: 16px;">
                <strong>Time:</strong> ${data.scheduledTime}
              </p>

              ${meetingSection}
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              ${
                type === 'Scheduled'
                  ? 'We wish you the best for your interview. Please ensure that you join on time.'
                  : 'Please make sure to attend the interview at the new schedule provided above.'
              }
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f3f4f6;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2025 Fobverse. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </div>
  `;

    await this.sendEmail(to, subject, htmlContent);
  }

  async SendInterviewCancelledEmail(
    to: string,
    data: ScheduleResponseDto,
  ): Promise<void> {
    const subject = `Update on Your ${data.stage} Interview Status`;

    const htmlContent = `
    <div style="background-color: #f3f4f6; padding: 20px; font-family: Arial, Helvetica, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" 
        width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
        
        <!-- Header -->
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #7B3FE4;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Fobverse</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #dc2626; font-size: 20px; margin-bottom: 20px;">
              Interview Cancelled & Application Update
            </h2>

            <p style="color: #6b7280; font-size: 16px; margin-bottom: 15px;">
              Hello,
            </p>

            <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
              We regret to inform you that your 
              <strong>${data.stage}</strong> interview scheduled on 
              <strong>${data.scheduledDate}</strong> at 
              <strong>${data.scheduledTime}</strong> has been 
              <span style="color: #dc2626; font-weight: bold;">cancelled</span>.
            </p>

            <div style="text-align: left; padding: 20px; border: 1px solid #f3f4f6; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Interview Details</h3>

              <p style="margin: 10px 0; font-size: 16px;">
                <strong>Stage:</strong> ${data.stage}
              </p>

              <p style="margin: 10px 0; font-size: 16px;">
                <strong>Date:</strong> ${data.scheduledDate}
              </p>

              <p style="margin: 10px 0; font-size: 16px;">
                <strong>Time:</strong> ${data.scheduledTime}
              </p>
            </div>

            <p style="color: #6b7280; font-size: 15px; margin-bottom: 15px;">
              After careful consideration, we regret to inform you that you were not selected to move forward in the hiring process at this time.
            </p>

            <p style="color: #6b7280; font-size: 15px; margin-bottom: 20px;">
              We truly appreciate the time and effort you put into your application and interest in joining Fobverse. 
              We encourage you to apply again in the future if another opportunity aligns with your skills and experience.
            </p>

            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              Thank you once again for your interest, and we wish you all the best in your career ahead.
            </p>

            <p style="color: #1f2937; font-size: 15px; font-weight: bold;">
              – The Fobverse Team
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f3f4f6;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2025 Fobverse. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </div>
  `;

    await this.sendEmail(to, subject, htmlContent);
  }
}
