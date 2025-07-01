import React from 'react';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

// Types
interface EmailConfig {
  host: string;
  user: string;
  password: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const password = process.env.EMAIL_PASSWORD;

    if (!host || !user || !password) {
      console.warn('⚠️ [EmailService] Email configuration incomplete. EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD must be set.');
      return;
    }

    this.config = { host, user, password };
    this.createTransporter();
  }

  private createTransporter() {
    if (!this.config) return;

    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: this.config.user,
          pass: this.config.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('✅ [EmailService] Email transporter created successfully');
    } catch (error) {
      console.error('❌ [EmailService] Failed to create email transporter:', error);
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error('❌ [EmailService] Email service not configured properly');
      return false;
    }

    try {
      console.log(`📧 [EmailService] Sending email to: ${options.to}`);
      
      const mailOptions = {
        from: `"Balance App" <${this.config.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EmailService] Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ [EmailService] Failed to send email:', error);
      return false;
    }
  }

  async renderAndSendEmail(
    emailJsx: React.ReactElement,
    options: Omit<SendEmailOptions, 'html'>
  ): Promise<boolean> {
    try {
      console.log(`🎨 [EmailService] Rendering email component for: ${options.to}`);
      
      // Render the React component to HTML
      const html = await render(emailJsx);
      
      return await this.sendEmail({
        ...options,
        html,
      });
    } catch (error) {
      console.error('❌ [EmailService] Failed to render and send email:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ [EmailService] No transporter available for verification');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ [EmailService] Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ [EmailService] Email connection verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService; 