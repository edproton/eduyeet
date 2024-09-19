declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DB_HOST: string
			DB_PORT: string
			DB_USERNAME: string
			DB_PASSWORD: string
			DB_NAME: string
			JWT_SECRET: string
			EMAIL_HOST: string
			EMAIL_PORT: string
			EMAIL_SECURE: string
			EMAIL_USER: string
			EMAIL_PASS: string
			EMAIL_FROM: string
		}
	}
}

export {}
