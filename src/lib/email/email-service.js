import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export class EmailService {
  constructor() {
    this.from = process.env.EMAIL_FROM || 'GenScript <noreply@genscript.ai>'
    this.replyTo = process.env.EMAIL_REPLY_TO || 'support@genscript.ai'
  }

  async sendEmail({ to, subject, html, text }) {
    if (!resend) {
      console.warn('Email service not configured. Set RESEND_API_KEY in environment.')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const { data, error } = await resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
        reply_to: this.replyTo
      })

      if (error) {
        console.error('Failed to send email:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Email service error:', error)
      return { success: false, error: error.message }
    }
  }

  async sendTeamInvitation({ email, inviterName, teamName, inviteLink, role }) {
    const subject = `You've been invited to join ${teamName} on GenScript`
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Team Invitation</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi there,
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          ${inviterName} has invited you to join <strong>${teamName}</strong> as a <strong>${role}</strong> on GenScript.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          This invitation will expire in 7 days. If you don't have a GenScript account, you'll be prompted to create one.
        </p>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} GenScript. All rights reserved.
        </p>
      </div>
    `
    
    const text = `
You've been invited to join ${teamName} on GenScript

${inviterName} has invited you to join ${teamName} as a ${role}.

Accept the invitation: ${inviteLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
    `

    return await this.sendEmail({ to: email, subject, html, text })
  }

  async sendWelcomeEmail({ email, name }) {
    const subject = 'Welcome to GenScript!'
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Welcome to GenScript! 🎉</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi ${name || 'there'},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for joining GenScript! We're excited to help you create amazing YouTube scripts with AI.
        </p>
        
        <h3 style="color: #333; margin-top: 30px;">Getting Started</h3>
        <ul style="color: #666; line-height: 1.8;">
          <li>Connect your YouTube channel to analyze your content style</li>
          <li>Train a custom voice profile to match your writing style</li>
          <li>Generate your first script with our AI tools</li>
          <li>Export in multiple formats (PDF, DOCX, Google Docs)</li>
        </ul>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Go to Dashboard
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Need help? Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs">documentation</a> or reply to this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} GenScript. All rights reserved.
        </p>
      </div>
    `
    
    const text = `
Welcome to GenScript!

Hi ${name || 'there'},

Thank you for joining GenScript! We're excited to help you create amazing YouTube scripts with AI.

Getting Started:
- Connect your YouTube channel to analyze your content style
- Train a custom voice profile to match your writing style
- Generate your first script with our AI tools
- Export in multiple formats (PDF, DOCX, Google Docs)

Go to Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Need help? Check out our documentation at ${process.env.NEXT_PUBLIC_APP_URL}/docs or reply to this email.

© ${new Date().getFullYear()} GenScript. All rights reserved.
    `

    return await this.sendEmail({ to: email, subject, html, text })
  }

  async sendPaymentFailedNotification({ email, name, reason, nextAttemptDate }) {
    const subject = 'Payment Failed - Action Required'
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #DC2626; margin-bottom: 20px;">Payment Failed</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi ${name || 'there'},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          We were unable to process your payment for your GenScript subscription.
        </p>
        
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
          <p style="color: #991B1B; margin: 0;">
            <strong>Reason:</strong> ${reason || 'Card declined'}
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Please update your payment method to avoid service interruption.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing" style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Update Payment Method
          </a>
        </div>
        
        ${nextAttemptDate ? `
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          We'll automatically retry the payment on ${new Date(nextAttemptDate).toLocaleDateString()}.
        </p>
        ` : ''}
        
        <p style="color: #666; line-height: 1.6;">
          If you have any questions, please contact our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} GenScript. All rights reserved.
        </p>
      </div>
    `
    
    const text = `
Payment Failed - Action Required

Hi ${name || 'there'},

We were unable to process your payment for your GenScript subscription.

Reason: ${reason || 'Card declined'}

Please update your payment method to avoid service interruption.

Update Payment Method: ${process.env.NEXT_PUBLIC_APP_URL}/settings/billing

${nextAttemptDate ? `We'll automatically retry the payment on ${new Date(nextAttemptDate).toLocaleDateString()}.` : ''}

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} GenScript. All rights reserved.
    `

    return await this.sendEmail({ to: email, subject, html, text })
  }

  async sendCreditLowWarning({ email, name, creditsRemaining, recommendedPackage }) {
    const subject = 'Low Credits Warning'
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #F59E0B; margin-bottom: 20px;">Low Credits Warning</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi ${name || 'there'},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          You have <strong>${creditsRemaining} credits</strong> remaining in your GenScript account.
        </p>
        
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
          <p style="color: #92400E; margin: 0;">
            This is enough for approximately ${Math.floor(creditsRemaining / 10)} more script generations.
          </p>
        </div>
        
        ${recommendedPackage ? `
        <p style="color: #666; line-height: 1.6;">
          Based on your usage, we recommend the <strong>${recommendedPackage}</strong> credit package.
        </p>
        ` : ''}
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/credits" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Purchase Credits
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Pro tip: Subscribe to a monthly plan for better value and automatic credit refills.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} GenScript. All rights reserved.
        </p>
      </div>
    `
    
    const text = `
Low Credits Warning

Hi ${name || 'there'},

You have ${creditsRemaining} credits remaining in your GenScript account.

This is enough for approximately ${Math.floor(creditsRemaining / 10)} more script generations.

${recommendedPackage ? `Based on your usage, we recommend the ${recommendedPackage} credit package.` : ''}

Purchase Credits: ${process.env.NEXT_PUBLIC_APP_URL}/credits

Pro tip: Subscribe to a monthly plan for better value and automatic credit refills.

© ${new Date().getFullYear()} GenScript. All rights reserved.
    `

    return await this.sendEmail({ to: email, subject, html, text })
  }

  async sendExportCompleted({ email, name, scriptTitle, exportFormat, downloadLink }) {
    const subject = `Your ${exportFormat} export is ready!`
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10B981; margin-bottom: 20px;">Export Completed ✅</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hi ${name || 'there'},
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Your script "<strong>${scriptTitle}</strong>" has been successfully exported to ${exportFormat} format.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${downloadLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Download ${exportFormat}
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          This download link will expire in 24 hours for security reasons.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} GenScript. All rights reserved.
        </p>
      </div>
    `
    
    const text = `
Export Completed

Hi ${name || 'there'},

Your script "${scriptTitle}" has been successfully exported to ${exportFormat} format.

Download ${exportFormat}: ${downloadLink}

This download link will expire in 24 hours for security reasons.

© ${new Date().getFullYear()} GenScript. All rights reserved.
    `

    return await this.sendEmail({ to: email, subject, html, text })
  }
}

export const emailService = new EmailService()