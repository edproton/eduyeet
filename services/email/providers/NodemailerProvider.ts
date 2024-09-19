import nodemailer from 'nodemailer'
import { Email, EmailProvider } from '../interfaces'
export class NodemailerProvider implements EmailProvider {
	private transporter: nodemailer.Transporter

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: Number(process.env.EMAIL_PORT),
			secure: false,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS
			}
		} as nodemailer.TransportOptions)
	}

	async sendEmail(email: Email): Promise<void> {
		await this.transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email.to,
			subject: email.subject,
			html: email.body
		})
	}
}
