export interface ApiError {
	errors: Array<{
		code: string
		description: string
	}>
}

export class ApiException extends Error {
	code: string

	constructor(code: string, message: string) {
		super(message)
		this.code = code
		this.name = 'ApiException'
	}
}
