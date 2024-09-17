'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { loginAction, ActionResult } from '../actions'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

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
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
	email: z.string().email({
		message: 'Please enter a valid email address.'
	}),
	password: z.string().min(8, {
		message: 'Password must be at least 8 characters.'
	}),
	remember: z.boolean().optional()
})

export function LoginForm() {
	const [actionResult, setActionResult] = useState<ActionResult>(null)
	const [isPending, setIsPending] = useState(false)
	const { toast } = useToast()
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			remember: false
		}
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsPending(true)
		const formData = new FormData()
		Object.entries(values).forEach(([key, value]) => {
			formData.append(key, value.toString())
		})
		const result = await loginAction(formData)
		setActionResult(result)
		setIsPending(false)

		toast({
			title: result?.success
		})

		router.push('/home')
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="your.email@example.com" {...field} />
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
								<PasswordInput id="password" placeholder="********" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex items-center justify-between">
					<FormField
						control={form.control}
						name="remember"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center space-x-2 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<Label
									htmlFor="remember"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Remember me
								</Label>
							</FormItem>
						)}
					/>
					<Link
						href="/forgot-password"
						className="text-sm font-medium text-primary hover:underline"
					>
						Forgot password?
					</Link>
				</div>
				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Logging in...
						</>
					) : (
						'Log in'
					)}
				</Button>
			</form>
			{actionResult?.error && <p className="mt-4 text-sm text-red-500">{actionResult.error}</p>}
			{actionResult?.success && (
				<p className="mt-4 text-sm text-green-500">{actionResult.success}</p>
			)}
		</Form>
	)
}
