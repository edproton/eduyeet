import { Email, EmailProvider } from './interfaces'
import { NodemailerProvider } from './providers/NodemailerProvider'

class EmailService {
	private static instance: EmailService
	private provider: EmailProvider

	private constructor(provider: EmailProvider) {
		this.provider = provider
	}

	public static getInstance(provider: EmailProvider): EmailService {
		if (!EmailService.instance) {
			EmailService.instance = new EmailService(provider)
		}
		return EmailService.instance
	}

	async sendEmail(email: Email): Promise<void> {
		await this.provider.sendEmail(email)
	}
}

export const emailService = EmailService.getInstance(new NodemailerProvider())
