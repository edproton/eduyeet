// 'use server'

// import { VerificationService } from '@/services'
// import { z } from 'zod'

// const verificationSchema = z.object({
// 	userId: z.number().gt(0),
// 	code: z.string().uuid()
// })

// export async function verifyEmail(userId: number, code: string) {
// 	const result = verificationSchema.safeParse({ userId, code })

// 	if (!result.success) {
// 		return { success: false, message: 'Invalid verification data' }
// 	}

// 	try {
// 		await VerificationService.verifyUser(userId, code)

// 		return { success: true, message: 'Email verified successfully' }
// 	} catch (error) {
// 		console.error('Verification error:', error)
// 		return { success: false, message: 'An error occurred during verification' }
// 	}
// }
