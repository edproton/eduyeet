import { Client } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DATABASE } =
	process.env

async function createDatabaseIfNotExists() {
	// Connect to the default 'postgres' database first
	const client = new Client({
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		host: POSTGRES_HOST,
		port: Number(POSTGRES_PORT),
		database: 'postgres' // Connect to the default database
	})

	try {
		await client.connect()

		// Check if the database exists
		const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [
			POSTGRES_DATABASE
		])

		if (res.rows.length === 0) {
			// Database doesn't exist, so create it
			await client.query(`CREATE DATABASE ${POSTGRES_DATABASE}`)
			console.log(`Database ${POSTGRES_DATABASE} created successfully.`)
		} else {
			console.log(`Database ${POSTGRES_DATABASE} already exists.`)
		}
	} catch (error) {
		console.error('Error creating database:', error)
	} finally {
		await client.end()
	}
}

createDatabaseIfNotExists()
