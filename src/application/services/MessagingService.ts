import { singleton } from 'tsyringe';
import { Config } from '../../config/config';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { AlertChannel } from '../../domain/enums';

// Mock Twilio client for demonstration
interface TwilioClient {
  messages: {
    create: (options: any) => Promise<any>;
  };
}

// Mock SendGrid for demonstration
interface SendGridMail {
  send: (msg: any) => Promise<any>;
}

@singleton()
export class MessagingService {
  private twilioClient: TwilioClient | null = null;
  private sendGridMail: SendGridMail | null = null;

  constructor(private readonly logger: LoggerService) {
    this.initializeClients();
  }

  private initializeClients(): void {
    try {
      // Initialize Twilio if credentials are provided
      if (Config.messaging.twilio.accountSid && Config.messaging.twilio.authToken) {
        // const twilio = require('twilio');
        // this.twilioClient = twilio(
        //   Config.messaging.twilio.accountSid,
        //   Config.messaging.twilio.authToken
        // );
        this.logger.info('Twilio client initialized');
      }

      // Initialize SendGrid if API key is provided
      if (Config.messaging.sendGrid.apiKey) {
        // const sgMail = require('@sendgrid/mail');
        // sgMail.setApiKey(Config.messaging.sendGrid.apiKey);
        // this.sendGridMail = sgMail;
        this.logger.info('SendGrid client initialized');
      }
    } catch (error) {
      this.logger.error('Failed to initialize messaging clients', error);
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      if (!this.twilioClient) {
        this.logger.warn('Twilio not configured, simulating SMS send');
        this.logger.info(`[SMS SIMULATION] To: ${phoneNumber}, Message: ${message}`);
        return;
      }

      await this.twilioClient.messages.create({
        body: message,
        from: Config.messaging.twilio.phoneNumber,
        to: phoneNumber,
      });

      this.logger.info('SMS sent successfully', { phoneNumber });
    } catch (error) {
      this.logger.error('Failed to send SMS', error);
      throw error;
    }
  }

  async sendEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      if (!this.sendGridMail) {
        this.logger.warn('SendGrid not configured, simulating email send');
        this.logger.info(`[EMAIL SIMULATION] To: ${email}, Subject: ${subject}, Message: ${message}`);
        return;
      }

      const msg = {
        to: email,
        from: Config.messaging.sendGrid.fromEmail,
        subject,
        text: message,
        html: `<p>${message}</p>`,
      };

      await this.sendGridMail.send(msg);
      this.logger.info('Email sent successfully', { email });
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  async sendAlert(channel: AlertChannel, recipient: string, message: string): Promise<void> {
    switch (channel) {
      case AlertChannel.SMS:
        await this.sendSMS(recipient, message);
        break;
      case AlertChannel.EMAIL:
        await this.sendEmail(recipient, 'Disaster Risk Alert', message);
        break;
      default:
        this.logger.warn(`Unknown alert channel: ${channel}`);
    }
  }
}
