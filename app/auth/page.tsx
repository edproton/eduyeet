'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Moon, Rocket, Sun } from 'lucide-react'
import { LoginForm } from './components/login-form'
import { RegisterForm } from './components/register-form'
import Image from 'next/image'

export default function AuthPage() {
	const { theme, setTheme } = useTheme()

	return (
		<div className="min-h-screen flex flex-col lg:flex-row">
			<div className="lg:w-1/2 bg-gradient-to-br from-primary to-secondary relative">
				<Image
					src="/learning.png"
					alt="EduYeet Platform"
					width={1920}
					height={1080}
					className="object-cover w-full h-64 lg:h-full opacity-50"
				/>
				<div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
					<h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-bounce text-center">
						EduYeet
					</h1>
					<p className="text-lg lg:text-xl text-center">Launch Your Learning Journey!</p>
				</div>
			</div>
			<div className="lg:w-1/2 w-full p-4 lg:p-6 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5, duration: 0.5 }}
					className="w-full max-w-md"
				>
					<Card className="w-full">
						<CardHeader className="relative">
							<div className="absolute top-2 right-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
									aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
								>
									{theme === 'light' ? (
										<Moon className="h-[1.2rem] w-[1.2rem]" />
									) : (
										<Sun className="h-[1.2rem] w-[1.2rem]" />
									)}
								</Button>
							</div>
							<CardTitle className="animate-pulse text-2xl lg:text-3xl text-center font-extrabold flex items-center justify-center mt-6">
								Join Us <Rocket className="inline-block ml-2" />
							</CardTitle>
							<CardDescription className="text-center">
								Sign up or log in to start yeeting knowledge!
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4 lg:p-6">
							<Tabs defaultValue="login" className="w-full">
								<TabsList className="grid w-full grid-cols-2 mb-4">
									<TabsTrigger
										value="login"
										className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 ease-in-out"
									>
										Login
									</TabsTrigger>
									<TabsTrigger
										value="register"
										className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 ease-in-out"
									>
										Register
									</TabsTrigger>
								</TabsList>
								<div className="mt-4">
									<TabsContent value="login">
										<LoginForm />
									</TabsContent>
									<TabsContent value="register">
										<RegisterForm />
									</TabsContent>
								</div>
							</Tabs>
						</CardContent>
						<CardFooter className="text-center text-xs lg:text-sm text-muted-foreground ">
							{
								"By joining EduYeet, you're becoming part of a community dedicated to lifelong learning. We value your privacy and commitment to growth."
							}
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		</div>
	)
}
