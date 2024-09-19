export interface Email {
	to: string
	subject: string
	body: string
}

export interface EmailProvider {
	sendEmail(email: Email): Promise<void>
}
