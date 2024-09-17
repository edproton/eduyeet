'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import { logout } from './actions'
import { useToast } from '@/hooks/use-toast'

export default function ProfileDropdown() {
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const { toast } = useToast()
	const router = useRouter()

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			const result = await logout()
			if (result.success) {
				router.push('/auth') // Redirect to auth page on successful logout
			} else if (result.error) {
				toast({
					variant: 'destructive',
					title: 'Logout Failed',
					description: result.error
				})
			}
		} catch (error) {
			console.error('Logout error:', error)
			toast({
				variant: 'destructive',
				title: 'Logout Failed',
				description: 'An unexpected error occurred. Please try again.'
			})
		} finally {
			setIsLoggingOut(false)
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="overflow-hidden rounded-full">
					<Image
						src="/profile.jpeg"
						width={36}
						height={36}
						alt="Avatar"
						className="overflow-hidden rounded-full"
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Settings</DropdownMenuItem>
				<DropdownMenuItem>Support</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={handleLogout} disabled={isLoggingOut}>
					{isLoggingOut ? 'Logging out...' : 'Logout'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
