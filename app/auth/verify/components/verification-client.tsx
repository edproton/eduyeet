'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface VerificationClientProps {
	verificationResult: {
		success: boolean
		message: string
	}
}

export default function VerificationClient({ verificationResult }: VerificationClientProps) {
	const router = useRouter()
	const [countdown, setCountdown] = useState(3)

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					router.push('/login')
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [router])

	return (
		<Card className="max-w-md w-full">
			<CardHeader>
				<CardTitle className="text-3xl font-semibold">
					{verificationResult.success ? 'Verification Successful!' : 'Verification Failed'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-xl mb-6">{verificationResult.message}</p>
				<p className="text-lg mb-6">
					Redirecting to login page in <span className="font-bold">{countdown}</span> seconds...
				</p>
			</CardContent>
			<CardFooter>
				<Button onClick={() => router.push('/login')} className="w-full">
					Go to Login Page
				</Button>
			</CardFooter>
		</Card>
	)
}
