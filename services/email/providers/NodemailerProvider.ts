import nodemailer from 'nodemailer'
import { Email, EmailProvider } from '../interfaces'
import env from '@/env'
export class NodemailerProvider implements EmailProvider {
	private transporter: nodemailer.Transporter

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: env.EMAIL_HOST,
			port: env.EMAIL_PORT,
			secure: env.EMAIL_SECURE,
			auth: {
				user: env.EMAIL_USER,
				pass: env.EMAIL_PASS
			}
		})
	}

	async sendEmail(email: Email): Promise<void> {
		await this.transporter.sendMail({
			from: env.EMAIL_USER,
			to: email.to,
			subject: email.subject,
			html: email.body
		})
	}
}
