import { Resend } from "resend"

/**
 * Email template data interface
 */
export interface EmailTemplateData {
  confirmationUrl: string
  unsubscribeUrl: string
  city: string
  frequency: string
}

/**
 * Email service for sending emails
 */
export class EmailService {
  private resend: Resend | null
  private fromEmail: string
  private baseUrl: string
  private logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void }

  constructor(
    apiKey: string,
    fromEmail: string,
    baseUrl: string,
    logger: { info: (msg: string) => void; error: (msg: string, err?: Error) => void },
  ) {
    this.resend = apiKey ? new Resend(apiKey) : null
    this.fromEmail = fromEmail
    this.baseUrl = baseUrl
    this.logger = logger
  }

  /**
   * Send a confirmation email
   * @param to Recipient email
   * @param token Confirmation token
   * @param city City name
   * @param frequency Subscription frequency
   */
  async sendConfirmationEmail(to: string, token: string, city: string, frequency: string): Promise<void> {
    try {
      const confirmationUrl = `${this.baseUrl}/api/v1/confirm/${token}`
      const unsubscribeUrl = `${this.baseUrl}/api/v1/unsubscribe/${token}`

      const templateData: EmailTemplateData = {
        confirmationUrl,
        unsubscribeUrl,
        city,
        frequency,
      }

      const html = this.renderConfirmationTemplate(templateData)

      this.logger.info(`Sending confirmation email to ${to}`)

      // If Resend API key is not provided, just log the email content
      if (!this.resend) {
        this.logger.info(`[MOCK EMAIL] To: ${to}, Subject: Confirm your weather subscription for ${city}`)
        this.logger.info(`[MOCK EMAIL] Confirmation URL: ${confirmationUrl}`)
        this.logger.info(`[MOCK EMAIL] Unsubscribe URL: ${unsubscribeUrl}`)
        return
      }

      // Send email using Resend
      try {
        const response = await this.resend.emails.send({
          from: this.fromEmail,
          to,
          subject: `Confirm your weather subscription for ${city}`,
          html,
        })

        // Check if response is successful
        if (response && "id" in response) {
          this.logger.info(`Confirmation email sent to ${to}, ID: ${response.id}`)
        } else {
          throw new Error("Failed to send email: No ID returned")
        }
      } catch (sendError) {
        // Handle Resend API errors
        const errorMessage = sendError instanceof Error ? sendError.message : String(sendError)
        throw new Error(`Resend API error: ${errorMessage}`)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.logger.error(`Failed to send confirmation email to ${to}`, err)

      // Log the error but don't throw, to allow the subscription to be created even if email fails
      this.logger.info(`Continuing despite email error: ${err.message}`)
    }
  }

  /**
   * Render the confirmation email template
   * @param data Template data
   * @returns HTML content
   */
  private renderConfirmationTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Your Weather Subscription</title>
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
            <h1>Confirm Your Weather Subscription</h1>
          </div>
          <p>Thank you for subscribing to weather updates for <strong>${data.city}</strong>.</p>
          <p>You will receive <strong>${data.frequency}</strong> weather updates once your subscription is confirmed.</p>
          <p>Please click the button below to confirm your subscription:</p>
          <p style="text-align: center;">
            <a href="${data.confirmationUrl}" class="button">Confirm Subscription</a>
          </p>
          <p>If you did not request this subscription, you can safely ignore this email or <a href="${data.unsubscribeUrl}">unsubscribe here</a>.</p>
          <div class="footer">
            <p>This email was sent by the Weather Subscription Service.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
