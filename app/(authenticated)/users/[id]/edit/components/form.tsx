// 'use client'

// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
// 	Form,
// 	FormControl,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormMessage
// } from '@/components/ui/form'
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue
// } from '@/components/ui/select'
// import { updateUser } from '../action'
// import { toast } from '@/hooks/use-toast'
// import { useRouter } from 'next/navigation'
// import { UserType } from '@/repositories'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'

// const userSchema = z.object({
// 	name: z.string().min(1, 'Name is required'),
// 	email: z.string().email('Invalid email address'),
// 	type: z.enum(['student', 'tutor'])
// })

// type UserFormData = z.infer<typeof userSchema>

// interface EditUserProps {
// 	user: {
// 		id: number
// 		name: string
// 		email: string
// 		type: UserType
// 	}
// }

// export default function EditUser({ user }: EditUserProps) {
// 	const router = useRouter()
// 	const [isSubmitting, setIsSubmitting] = useState(false)

// 	const form = useForm<UserFormData>({
// 		resolver: zodResolver(userSchema),
// 		defaultValues: {
// 			name: user.name,
// 			email: user.email,
// 			type: user.type
// 		}
// 	})

// 	async function onSubmit(data: UserFormData) {
// 		setIsSubmitting(true)
// 		const result = await updateUser(user.id, data)
// 		setIsSubmitting(false)

// 		if (result.success) {
// 			toast({
// 				title: 'User updated',
// 				description: 'The user has been successfully updated.'
// 			})

// 			router.push(`/users/${user.id}`)
// 		} else {
// 			toast({
// 				title: 'Error',
// 				description: result.error || 'Failed to update user. Please try again.',
// 				variant: 'destructive'
// 			})
// 		}
// 	}

// 	return (
// 		<Card>
// 			<CardHeader>Edit User</CardHeader>
// 			<CardContent>
// 				<Form {...form}>
// 					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
// 						<FormField
// 							control={form.control}
// 							name="name"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel>Name</FormLabel>
// 									<FormControl>
// 										<Input {...field} />
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 						<FormField
// 							control={form.control}
// 							name="email"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel>Email</FormLabel>
// 									<FormControl>
// 										<Input {...field} type="email" />
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 						<FormField
// 							control={form.control}
// 							name="type"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel>User Type</FormLabel>
// 									<Select onValueChange={field.onChange} defaultValue={field.value}>
// 										<FormControl>
// 											<SelectTrigger>
// 												<SelectValue placeholder="Select user type" />
// 											</SelectTrigger>
// 										</FormControl>
// 										<SelectContent>
// 											<SelectItem value="student">Student</SelectItem>
// 											<SelectItem value="tutor">Tutor</SelectItem>
// 										</SelectContent>
// 									</Select>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 						<Button type="submit" disabled={isSubmitting}>
// 							{isSubmitting ? 'Updating...' : 'Update User'}
// 						</Button>
// 					</form>
// 				</Form>
// 			</CardContent>
// 		</Card>
// 	)
// }
