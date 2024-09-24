// RegisterForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
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

const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	type: z.enum(['0', '1'])
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
	const { toast } = useToast()
	const [registrationSuccess, setRegistrationSuccess] = React.useState(false)

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			type: '0'
		}
	})

	const registerMutation = useMutation({
		mutationFn: (data: RegisterFormValues) =>
			api.register({
				...data,
				type: parseInt(data.type)
			}),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Registration successful'
			})
			form.reset()
			setRegistrationSuccess(true)
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error.message
			})
		}
	})

	const onSubmit = (data: RegisterFormValues) => {
		registerMutation.mutate(data)
	}

	const handleDialogClose = () => {
		setRegistrationSuccess(false)
	}

	return (
		<>
			<AlertDialog open={registrationSuccess} onOpenChange={handleDialogClose}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center">
							<CheckCircle className="h-6 w-6 text-green-500 mr-2" />
							Registration Successful!
						</AlertDialogTitle>
						<AlertDialogDescription>
							Thank you for registering. Please check your email to confirm your account. You will
							need to verify your email address before you can log in.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={handleDialogClose}>Got it, thanks!</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Your name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>User Type</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select user type" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="0">Student</SelectItem>
										<SelectItem value="1">Teacher</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={registerMutation.isPending}>
						{registerMutation.isPending ? 'Registering...' : 'Register'}
					</Button>
				</form>
			</Form>
		</>
	)
}
