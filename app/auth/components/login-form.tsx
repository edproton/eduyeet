// LoginForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { CheckCircle } from 'lucide-react'
import { api } from '@/app/api'

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters')
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
	const { toast } = useToast()
	const router = useRouter()
	const [loginSuccess, setLoginSuccess] = React.useState(false)

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
			// Store the token securely
			localStorage.setItem('accessToken', data.token)

			// Set the token for API calls
			api.setAuthToken(data.token)

			toast({
				title: 'Success',
				description: 'Login successful'
			})
			setLoginSuccess(true)
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error.message
			})
		}
	})

	const onSubmit = (data: LoginFormValues) => {
		loginMutation.mutate(data)
	}

	const handleDialogClose = () => {
		setLoginSuccess(false)
		// Redirect to dashboard or home page after successful login
		router.push('/home')
	}

	return (
		<>
			<AlertDialog open={loginSuccess} onOpenChange={handleDialogClose}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center">
							<CheckCircle className="h-6 w-6 text-green-500 mr-2" />
							Login Successful!
						</AlertDialogTitle>
						<AlertDialogDescription>
							You have successfully logged in. You will be redirected to your dashboard.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={handleDialogClose}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="your.email@example.com" {...field} />
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
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="********" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={loginMutation.isPending}>
						{loginMutation.isPending ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</Form>
		</>
	)
}
