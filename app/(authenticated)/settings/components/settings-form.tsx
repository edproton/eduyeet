'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
// import { Check, ChevronsUpDown } from 'lucide-react'
// import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
// import {
// 	Command,
// 	CommandEmpty,
// 	CommandGroup,
// 	CommandInput,
// 	CommandItem,
// 	CommandList
// } from '@/components/ui/command'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
// import Flag from 'react-world-flags'

// const countries = [
// 	{ value: 620, label: 'Portugal' },
// 	{ value: 826, label: 'United Kingdom of Great Britain and Northern Ireland' }
// ]

interface SettingsFormProps {
	initialSettings?: {
		theme?: string
		country?: number
		email?: string
		bio?: string
		notifications?: {
			email: boolean
			push: boolean
		}
	}
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
	const { theme, setTheme } = useTheme()
	const [isDarkMode, setIsDarkMode] = useState(false)
	// const [selectedCountry, setSelectedCountry] = useState<number | undefined>(undefined)
	const [mounted, setMounted] = useState(false)
	// const [open, setOpen] = useState(false)
	// const [value, setValue] = useState<number | undefined>(undefined)
	const [email, setEmail] = useState('')
	const [bio, setBio] = useState('')
	const [notifications, setNotifications] = useState({
		email: false,
		push: false
	})

	useEffect(() => {
		setMounted(true)
		setIsDarkMode(theme === 'dark')
		// setSelectedCountry(initialSettings?.country || 620)
		// setValue(initialSettings?.country || 620)
		setEmail(initialSettings?.email || '')
		setBio(initialSettings?.bio || '')
		setNotifications(initialSettings?.notifications || { email: false, push: false })
	}, [theme, initialSettings])

	const handleThemeToggle = () => {
		setIsDarkMode(!isDarkMode)
		setTheme(isDarkMode ? 'light' : 'dark')
	}

	const handleSaveSettings = () => {
		toast({
			title: 'Settings saved',
			description: 'Your preferences have been updated.'
		})
	}

	if (!mounted) {
		return null
	}

	return (
		<main className="flex-1 p-6 overflow-y-auto">
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Profile Information</CardTitle>
						<CardDescription>Update your account details and public profile.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								placeholder="Tell us about yourself"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Preferences</CardTitle>
						<CardDescription>Manage your account settings and preferences.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="theme-toggle">Theme</Label>
								<p className="text-sm text-muted-foreground">
									{isDarkMode ? 'Dark mode is on' : 'Light mode is on'}
								</p>
							</div>
							<Switch
								id="theme-toggle"
								checked={isDarkMode}
								onCheckedChange={handleThemeToggle}
								aria-label="Toggle dark mode"
							/>
						</div>
						<Separator />
						{/* <div className="space-y-2 flex flex-col gap-2">
							<Label htmlFor="country-select">Country</Label>
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										id="country-select"
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className="w-fit justify-between"
									>
										{value ? (
											<div className="flex items-center">
												<Flag code={value.toString()} className="mr-2" width="24" />
												<span className="truncate">
													{countries.find((country) => country.value === value)?.label}
												</span>
											</div>
										) : (
											'Select country...'
										)}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start">
									<Command className="w-full">
										<CommandInput placeholder="Search country..." />
										<CommandList>
											<CommandEmpty>No country found.</CommandEmpty>
											<CommandGroup>
												{countries.map((country) => (
													<CommandItem
														key={country.value}
														value={country.label}
														onSelect={() => {
															setValue(country.value)
															setSelectedCountry(country.value)
															setOpen(false)
														}}
													>
														<div className="flex items-center">
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	value === country.value ? 'opacity-100' : 'opacity-0'
																)}
															/>
															<Flag code={country.value.toString()} className="mr-2" width="24" />
															<span>{country.label}</span>
														</div>
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div> */}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>Choose how you want to be notified.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="email-notifications">Email Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive notifications via email</p>
							</div>
							<Switch
								id="email-notifications"
								checked={notifications.email}
								onCheckedChange={(checked) =>
									setNotifications({ ...notifications, email: checked })
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="push-notifications">Push Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive push notifications</p>
							</div>
							<Switch
								id="push-notifications"
								checked={notifications.push}
								onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="mt-6">
				<Button onClick={handleSaveSettings} size="lg">
					Save All Settings
				</Button>
			</div>
		</main>
	)
}
