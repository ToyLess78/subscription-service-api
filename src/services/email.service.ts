import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

/**
 * Email template data interface
 */
export interface EmailTemplateData {
  confirmationUrl: string;
  unsubscribeUrl: string;
  city: string;
  frequency: string;
  baseUrl?: string;
  currentWeather?: string;
  temperature?: string;
  feedbackUrl?: string;
}

/**
 * Email service for sending emails
 */
export class EmailService {
  private resend: Resend | null;
  private fromEmail: string;
  private baseUrl: string;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };

  constructor(
    apiKey: string,
    fromEmail: string,
    baseUrl: string,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
  ) {
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = fromEmail;
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  /**
   * Send a confirmation email
   * @param to Recipient email
   * @param token Confirmation token
   * @param city City name
   * @param frequency Subscription frequency
   */
  async sendConfirmationEmail(
    to: string,
    token: string,
    city: string,
    frequency: string,
  ): Promise<void> {
    try {
      const confirmationUrl = `${this.baseUrl}/confirmation.html?token=${token}`;
      const unsubscribeUrl = `${this.baseUrl}/unsubscribed.html?token=${token}`;

      const templateData: EmailTemplateData = {
        confirmationUrl,
        unsubscribeUrl,
        city,
        frequency,
      };

      const html = await this.renderTemplateFromFile(
        "confirmation.html",
        templateData,
      );

      this.logger.info(`Sending confirmation email to ${to}`);

      // If Resend API key is not provided, just log the email content
      if (!this.resend) {
        this.logger.info(
          `[MOCK EMAIL] To: ${to}, Subject: Confirm your weather subscription for ${city}`,
        );
        this.logger.info(`[MOCK EMAIL] Confirmation URL: ${confirmationUrl}`);
        this.logger.info(`[MOCK EMAIL] Unsubscribe URL: ${unsubscribeUrl}`);
        return;
      }

      // Send email using Resend
      try {
        const response = await this.resend.emails.send({
          from: this.fromEmail,
          to,
          subject: `Confirm your weather subscription for ${city}`,
          html,
        });

        // Check if response is successful
        if (response && "id" in response) {
          this.logger.info(
            `Confirmation email sent to ${to}, ID: ${response.id}`,
          );
        } else {
          throw new Error("Failed to send email: No ID returned");
        }
      } catch (sendError) {
        // Handle Resend API errors
        const errorMessage =
          sendError instanceof Error ? sendError.message : String(sendError);
        throw new Error(`Resend API error: ${errorMessage}`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send confirmation email to ${to}`, err);

      // Log the error but don't throw, to allow the subscription to be created even if email fails
      this.logger.info(`Continuing despite email error: ${err.message}`);
    }
  }

  /**
   * Send a welcome email after subscription confirmation
   * @param to Recipient email
   * @param token Unsubscribe token
   * @param city City name
   * @param frequency Subscription frequency
   * @param currentWeather Current weather description
   * @param temperature Current temperature
   */
  async sendWelcomeEmail(
    to: string,
    token: string,
    city: string,
    frequency: string,
    currentWeather = "Sunny",
    temperature = "22",
  ): Promise<void> {
    try {
      const unsubscribeUrl = `${this.baseUrl}/unsubscribed.html?token=${token}`;

      const templateData: EmailTemplateData = {
        confirmationUrl: "", // Not used in welcome email
        unsubscribeUrl,
        city,
        frequency,
        baseUrl: this.baseUrl,
        currentWeather,
        temperature,
      };

      const html = await this.renderTemplateFromFile(
        "welcome.html",
        templateData,
      );

      this.logger.info(`Sending welcome email to ${to}`);

      // If Resend API key is not provided, just log the email content
      if (!this.resend) {
        this.logger.info(
          `[MOCK EMAIL] To: ${to}, Subject: Welcome to Weather Updates for ${city}`,
        );
        this.logger.info(`[MOCK EMAIL] Unsubscribe URL: ${unsubscribeUrl}`);
        return;
      }

      // Send email using Resend
      try {
        const response = await this.resend.emails.send({
          from: this.fromEmail,
          to,
          subject: `Welcome to Weather Updates for ${city}`,
          html,
        });

        // Check if response is successful
        if (response && "id" in response) {
          this.logger.info(`Welcome email sent to ${to}, ID: ${response.id}`);
        } else {
          throw new Error("Failed to send email: No ID returned");
        }
      } catch (sendError) {
        // Handle Resend API errors
        const errorMessage =
          sendError instanceof Error ? sendError.message : String(sendError);
        throw new Error(`Resend API error: ${errorMessage}`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send welcome email to ${to}`, err);
    }
  }

  /**
   * Send an unsubscribe confirmation email
   * @param to Recipient email
   * @param city City name
   */
  async sendUnsubscribeConfirmationEmail(
    to: string,
    city: string,
  ): Promise<void> {
    try {
      const baseUrl = this.baseUrl;
      const feedbackUrl = `${this.baseUrl}/feedback?email=${encodeURIComponent(to)}`;

      const templateData: EmailTemplateData = {
        confirmationUrl: "", // Not used in unsubscribe email
        unsubscribeUrl: "", // Not used in unsubscribe email
        city,
        frequency: "", // Not used in unsubscribe email
        baseUrl,
        feedbackUrl,
      };

      const html = await this.renderTemplateFromFile(
        "unsubscribe.html",
        templateData,
      );

      this.logger.info(`Sending unsubscribe confirmation email to ${to}`);

      // If Resend API key is not provided, just log the email content
      if (!this.resend) {
        this.logger.info(
          `[MOCK EMAIL] To: ${to}, Subject: You've been unsubscribed from weather updates for ${city}`,
        );
        return;
      }

      // Send email using Resend
      try {
        const response = await this.resend.emails.send({
          from: this.fromEmail,
          to,
          subject: `You've been unsubscribed from weather updates for ${city}`,
          html,
        });

        // Check if response is successful
        if (response && "id" in response) {
          this.logger.info(
            `Unsubscribe confirmation email sent to ${to}, ID: ${response.id}`,
          );
        } else {
          throw new Error("Failed to send email: No ID returned");
        }
      } catch (sendError) {
        // Handle Resend API errors
        const errorMessage =
          sendError instanceof Error ? sendError.message : String(sendError);
        throw new Error(`Resend API error: ${errorMessage}`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to send unsubscribe confirmation email to ${to}`,
        err,
      );
    }
  }

  /**
   * Render an email template from a file
   * @param templateName Template name
   * @param data Template data
   * @returns Rendered template as HTML string
   */
  private async renderTemplateFromFile(
    templateName: string,
    data: EmailTemplateData,
  ): Promise<string> {
    try {
      // Get the absolute path to the template file
      const templatePath = path.join(
        process.cwd(),
        "public",
        "email-templates",
        templateName,
      );

      // Read the template file
      const template = await readFile(templatePath, "utf8");

      // Replace placeholders with data
      return this.renderTemplate(template, data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to render email template ${templateName}`, err);

      // Fall back to the hardcoded template
      return this.renderDefaultTemplate(data);
    }
  }

  /**
   * Render a template by replacing placeholders with data
   * @param template Template string
   * @param data Template data
   * @returns Rendered template string
   */
  private renderTemplate(template: string, data: EmailTemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return (data[key as keyof EmailTemplateData] as string) || "";
    });
  }

  /**
   * Render a default template in case the file template fails
   * @param data Template data
   * @returns Default template as HTML string
   */
  private renderDefaultTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weather Subscription</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .button { display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px; }
          .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weather Subscription</h1>
          </div>
          <p>City: <strong>${data.city}</strong></p>
          <p>Frequency: <strong>${data.frequency}</strong></p>
          ${data.confirmationUrl ? `<p><a href="${data.confirmationUrl}" class="button">Confirm Subscription</a></p>` : ""}
          ${data.unsubscribeUrl ? `<p>If you did not request this subscription, <a href="${data.unsubscribeUrl}">unsubscribe here</a>.</p>` : ""}
          <div class="footer">
            <p>This email was sent by the Weather Subscription Service.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
