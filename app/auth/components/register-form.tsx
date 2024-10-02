import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomFlagsSelect } from '@/components/ui/flag-select'
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
import { CheckCircle, Loader2 } from 'lucide-react'
import { PersonType } from '@/api/types'
import { authApi } from '@/api/auth'

const registerSchema = z.object({
	name: z.string().min(2, 'Your name should be at least 2 characters'),
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(8, 'Your password should be at least 8 characters'),
	type: z.nativeEnum(PersonType),
	countryCode: z.string().min(1, 'Please let us know where you live')
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
			type: PersonType.Tutor,
			countryCode: ''
		}
	})

	const registerMutation = useMutation({
		mutationFn: (data: RegisterFormValues) => {
			console.log(data)
			return authApi.register({
				name: data.name,
				email: data.email,
				password: data.password,
				type: data.type,
				countryCode: data.countryCode
			})
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Oops! Something went wrong',
				description: error.message
			})
		},
		onSuccess: () => {
			setRegistrationSuccess(true)
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
							Welcome to Our Community!
						</AlertDialogTitle>
						<AlertDialogDescription>
							We&apos;re thrilled to have you on board! We&apos;ve sent a confirmation email to your
							inbox. Please verify your email address to start your journey with us.
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
								<FormLabel>What&apos;s your name?</FormLabel>
								<FormControl>
									<Input placeholder="Enter your name" {...field} />
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
								<FormLabel>What&apos;s your email address?</FormLabel>
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
								<FormLabel>Create a password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Your secret password" {...field} />
								</FormControl>
								<FormMessage />
								<p id="password-requirements" className="text-sm text-muted-foreground">
									Make it strong! At least 8 characters long.
								</p>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="countryCode"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Where are you joining us from?</FormLabel>
								<FormControl>
									<CustomFlagsSelect value={field.value} onChange={field.onChange} />
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
								<FormLabel>I am here to...</FormLabel>
								<Select
									onValueChange={(value) => field.onChange(Number(value) as PersonType)}
									defaultValue={field.value.toString()}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={PersonType.Tutor.toString()}>
											Share my knowledge (Tutor)
										</SelectItem>
										<SelectItem value={PersonType.Student.toString()}>
											Expand my horizons (Student)
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={registerMutation.isPending}>
						{registerMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Joining the community...
							</>
						) : (
							"Let's Get Started!"
						)}
					</Button>
				</form>
			</Form>
		</>
	)
}
