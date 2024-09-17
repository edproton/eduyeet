'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

async function resetPassword(userId: number) {
	// Implement password reset logic here
	console.log(`Reset password for user ${userId}`)
}

async function sendEmail(userId: number) {
	// Implement email sending logic here
	console.log(`Send email to user ${userId}`)
}

async function sendMagicPassword(userId: number) {
	// Implement magic password sending logic here
	console.log(`Send magic password to user ${userId}`)
}

export default function EditActionsCard({ user }: { user: { id: number } }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Actions</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<Button onClick={() => resetPassword(user.id)} className="w-full" variant="outline">
					Reset Password
				</Button>
				<Button onClick={() => sendEmail(user.id)} className="w-full" variant="outline">
					Send Email
				</Button>
				<Button onClick={() => sendMagicPassword(user.id)} className="w-full" variant="outline">
					Send Magic Password
				</Button>
			</CardContent>
		</Card>
	)
}
