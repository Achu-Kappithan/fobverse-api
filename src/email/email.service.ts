import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Mail from "nodemailer/lib/mailer";
import * as nodemailer  from 'nodemailer'

@Injectable()
export class EmailService {
    private frontendUrl: string;
    private senderEmail: string;
    private transporter: Mail
    private readonly logger = new Logger(EmailService.name)

    constructor(private readonly confiService:ConfigService){
        this.frontendUrl = this.confiService.get<string>('FRONTEND_URL') ?? "",
        this.senderEmail =this.confiService.get<string>('EMAIL_USER') ?? 'fobverseweb@gmail.com'
        this.transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
                user:this.confiService.get<string>('EMAIL_USER'),
                pass:this.confiService.get<string>('EMAIL_PASSWORD')
            }

        })

        this.transporter.verify((error,sucess)=>{
            if(error){
                this.logger.error('Email transporter verification failed:', error);
            }else{
                this.logger.log('Email transporter ready for sending messages.')
            }
        })
    }

    async sendEmail (to:string, subject: string, htmlContent: string, from?:string): Promise<void>{

        const mailOptions = {
        from: from || `"FobVerse" <${this.senderEmail}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        };

        try {
            await this.transporter.sendMail(mailOptions)
            this.logger.log(`Verification email sent to ${to}`)
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${to}: ${error.message}`, error.stack)
            throw new Error('Could not send verification email. Please try again later.')
        }
    }

    async sendVerificationEmail(to:string , verificationjwt:string):Promise<void>{
        const verificationLink = `${this.frontendUrl}/email/verification?token=${verificationjwt}`;
        const subject = 'Verify Your Email Address for Your App Name';
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

        await this.sendEmail(to,subject,htmlContent)
    }
}