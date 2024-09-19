import { z } from 'zod'

const envSchema = z.object({
	APP_URL: z.string(),
	DB_HOST: z.string(),
	DB_PORT: z.string().transform(Number),
	DB_USERNAME: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	JWT_SECRET: z.string(),
	EMAIL_HOST: z.string(),
	EMAIL_PORT: z.string().transform(Number),
	EMAIL_SECURE: z.string().transform((v) => v === 'true'),
	EMAIL_USER: z.string().email(),
	EMAIL_PASS: z.string(),
	EMAIL_FROM: z.string().email()
})

const env = envSchema.parse(process.env)

export default env
