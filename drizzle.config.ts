import 'dotenv/config' // make sure to install dotenv package
import { Config, defineConfig } from 'drizzle-kit'

console.log(process.env)
export default defineConfig({
	dialect: 'postgresql',
	out: './drizzle',
	schema: './data/schema.ts',
	dbCredentials: {
		host: process.env.DB_HOST!,
		port: Number(process.env.DB_PORT!),
		user: process.env.DB_USERNAME!,
		password: process.env.DB_PASSWORD!,
		database: process.env.DB_NAME!,
		ssl: false
	},
	// Print all statements
	verbose: true,
	// Always ask for confirmation
	strict: true
}) satisfies Config
