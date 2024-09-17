'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { revokeSession } from '../actions'
import { toast } from '@/hooks/use-toast'

const revokeSchema = z.object({
	reason: z
		.string()
		.min(5, 'Reason must be at least 5 characters long')
		.max(200, 'Reason must not exceed 200 characters')
})

type RevokeFormData = z.infer<typeof revokeSchema>

interface RevokeSessionFormProps {
	sessionId: string
	onRevoked: () => void
}

export function RevokeSessionForm({ sessionId, onRevoked }: RevokeSessionFormProps) {
	const [isOpen, setIsOpen] = useState(false)
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm<RevokeFormData>({
		resolver: zodResolver(revokeSchema)
	})

	const onSubmit = async (data: RevokeFormData) => {
		const result = await revokeSession(sessionId, data.reason)

		if (result.success) {
			toast({
				title: 'Session Revoked',
				description: 'The session has been successfully revoked.'
			})
			setIsOpen(false)
			reset()
			onRevoked()
			return
		}

		toast({
			title: 'Error',
			description: 'Failed to revoke the session. Please try again.',
			variant: 'destructive'
		})
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="sm">
					Revoke
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Revoke Session</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<Label htmlFor="reason">Revocation Reason</Label>
						<Input id="reason" {...register('reason')} placeholder="Enter reason for revoking" />
						{errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>}
					</div>
					<Button type="submit">Revoke Session</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default function SessionActions({ sessionId }: { sessionId: string }) {
	const handleRevoked = () => {
		// You might want to refresh the sessions list or update the UI here
		console.log('Session revoked:', sessionId)
	}

	return <RevokeSessionForm sessionId={sessionId} onRevoked={handleRevoked} />
}
