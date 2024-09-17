import { ILogger } from './ILogger'
import { LogLevel } from './LogLevel'
import winston from 'winston'

export class WinstonLogger implements ILogger {
	private logger: winston.Logger

	constructor() {
		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize({ all: true }),
						winston.format.simple()
					)
				})
			]
		})

		// Add file transports in non-development environments
		if (process.env.NODE_ENV !== 'development') {
			this.logger.add(
				new winston.transports.File({
					filename: 'logs/error.log',
					level: 'error'
				})
			)
			this.logger.add(new winston.transports.File({ filename: 'logs/combined.log' }))
		}
	}

	private log(level: LogLevel, message: string, ...meta: unknown[]) {
		this.logger.log(level, message, ...meta)
	}

	debug(message: string, ...meta: unknown[]): void {
		this.log(LogLevel.DEBUG, message, ...meta)
	}

	info(message: string, ...meta: unknown[]): void {
		this.log(LogLevel.INFO, message, ...meta)
	}

	warn(message: string, ...meta: unknown[]): void {
		this.log(LogLevel.WARN, message, ...meta)
	}

	error(message: string, ...meta: unknown[]): void {
		this.log(LogLevel.ERROR, message, ...meta)
	}
}
