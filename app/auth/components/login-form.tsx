'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { api } from '@/app/api'

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(8, 'Your password should be at least 8 characters')
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
	const { toast } = useToast()
	const router = useRouter()

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const loginMutation = useMutation({
		mutationFn: api.login,
		onSuccess: (data) => {
			localStorage.setItem('accessToken', data.token)
			api.setAuthToken(data.token)

			toast({
				variant: 'success',
				title: 'Welcome back!',
				description: "It's great to see you again! We're taking you to your personalized dashboard."
			})

			router.push('/home')
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Oops! Something went wrong',
				description: error.message
			})
		}
	})

	const onSubmit = (data: LoginFormValues) => {
		loginMutation.mutate(data)
	}

	return (
		<div className="w-full max-w-md mx-auto space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{"What's your email address?"}</FormLabel>
								<FormControl>
									<Input type="email" placeholder="you@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Enter your password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Your secret password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={loginMutation.isPending}>
						{loginMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Logging you in...
							</>
						) : (
							"Let's Go!"
						)}
					</Button>
				</form>
			</Form>
		</div>
	)
}
