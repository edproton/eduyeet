import { JWTPayload, SignJWT, jwtVerify, decodeJwt } from 'jose'
import { JWTExpired } from 'jose/errors'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '')
const JWT_EXPIRE = '5m'

export class JWTService {
	static async sign(payload: JWTPayload): Promise<string> {
		if (!payload.jti) {
			throw new Error('Invalid token: missing jti')
		}

		return new SignJWT(payload)
			.setProtectedHeader({ alg: 'HS256' })
			.setJti(payload.jti as string)
			.setIssuedAt()
			.setExpirationTime(JWT_EXPIRE)
			.sign(JWT_SECRET)
	}

	static async verify(token: string): Promise<JWTPayload> {
		try {
			const { payload } = await jwtVerify(token, JWT_SECRET, {
				algorithms: ['HS256']
			})

			if (!payload.jti) {
				throw new Error('Invalid token: missing jti')
			}

			return payload
		} catch (error) {
			if (error instanceof JWTExpired) {
				const payload = decodeJwt(token)

				if (!payload.jti) {
					throw new Error('Invalid token: missing jti')
				}

				return payload
			}

			throw error
		}
	}
}
