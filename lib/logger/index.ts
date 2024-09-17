import { ILogger } from './ILogger'
import { WinstonLogger } from './WinstonLogger'

export type { ILogger } from './ILogger'
export { LogLevel } from './LogLevel'

export const logger: ILogger = new WinstonLogger()

export { WinstonLogger }
