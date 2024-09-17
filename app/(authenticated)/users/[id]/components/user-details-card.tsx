'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@/data/repositories/user.repository'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface UserDetailsProps {
	user: User
}
export default function UserDetailsCard({ user }: UserDetailsProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4">
				<CardTitle>User Details</CardTitle>

				<Link href={`/users/${user.id}/edit`}>
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
						<span className="sr-only">Edit user</span>
					</Button>
				</Link>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
					<div className="sm:col-span-1">
						<dt className="text-sm font-medium text-muted-foreground">ID</dt>
						<dd className="mt-1 text-sm text-foreground">{user.id}</dd>
					</div>
					<div className="sm:col-span-1">
						<dt className="text-sm font-medium text-muted-foreground">Name</dt>
						<dd className="mt-1 text-sm text-foreground">{user.name}</dd>
					</div>
					<div className="sm:col-span-1">
						<dt className="text-sm font-medium text-muted-foreground">Email</dt>
						<dd className="mt-1 text-sm text-foreground">{user.email}</dd>
					</div>
					<div className="sm:col-span-1">
						<dt className="text-sm font-medium text-muted-foreground">Type</dt>
						<dd className="mt-1 text-sm text-foreground">{user.type}</dd>
					</div>
					<div className="sm:col-span-1">
						<dt className="text-sm font-medium text-muted-foreground">Created At</dt>
						<dd className="mt-1 text-sm text-foreground">
							{new Date(user.createdAt!).toLocaleString()}
						</dd>
					</div>
					<div className="sm:col-span-1">
						<dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
						<dd className="mt-1 text-sm text-foreground">
							{new Date(user.updatedAt!).toLocaleString()}
						</dd>
					</div>
				</dl>
			</CardContent>
		</Card>
	)
}
