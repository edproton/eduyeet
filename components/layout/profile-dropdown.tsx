'use client'

import { useState } from 'react'
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
import Link from 'next/link'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
export default function ProfileDropdown() {
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const router = useRouter()

	const handleLogout = async () => {
		setIsLoggingOut(true)
		Cookies.remove('accessToken')

		setIsLoggingOut(false)
		router.push('/auth')
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
				<DropdownMenuItem>
					<Link href="/settings">Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>Support</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={handleLogout} disabled={isLoggingOut}>
					{isLoggingOut ? 'Logging out...' : 'Logout'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
