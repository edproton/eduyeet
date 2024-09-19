'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Sun, Moon, Book, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<div className="min-h-screen flex flex-col">
			<header className="p-4 flex justify-between items-center">
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-3xl font-bold"
				>
					Eduyeet
				</motion.h1>
				<Button
					variant="outline"
					size="icon"
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				>
					{theme === 'dark' ? (
						<Sun className="h-[1.2rem] w-[1.2rem]" />
					) : (
						<Moon className="h-[1.2rem] w-[1.2rem]" />
					)}
				</Button>
			</header>

			<main className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden">
				<motion.h2
					className="text-4xl md:text-6xl font-bold text-center mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					Learn Anything, Anytime
				</motion.h2>

				<motion.p
					className="text-xl text-center mb-8 max-w-2xl relative"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<span className="relative inline-block">
						{'Expert Tutoring, Anytime, Anywhere'.split('').map((char, index) => (
							<motion.span
								key={index}
								className="inline-block"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.6 + index * 0.05 }}
							>
								<span className="relative">
									<span className="absolute inset-0 blur-sm bg-primary/30 animate-pulse"></span>
									<span className="relative z-10">{char}</span>
								</span>
							</motion.span>
						))}
					</span>
				</motion.p>

				<div className="flex flex-wrap justify-center gap-4 mb-12">
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.6 }}
					>
						<Button className="text-lg px-6 py-3">
							<Book className="mr-2 h-5 w-5" /> Explore Subjects
						</Button>
					</motion.div>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.8 }}
					>
						<Button variant="outline" className="text-lg px-6 py-3">
							<Calendar className="mr-2 h-5 w-5" /> Book a Session
						</Button>
					</motion.div>
				</div>

				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1, staggerChildren: 0.2 }}
				>
					{['Mathematics', 'Science', 'Languages', 'History', 'Arts', 'Technology'].map(
						(subject, index) => (
							<motion.div
								key={subject}
								className="bg-card text-card-foreground p-6 rounded-lg shadow-lg"
								whileHover={{ scale: 1.05, rotate: 2 }}
								initial={{ opacity: 0, y: 20, scale: 0.8 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{
									delay: 1 + index * 0.1,
									type: 'spring',
									stiffness: 260,
									damping: 20
								}}
							>
								<motion.h3
									className="text-xl font-semibold mb-2"
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 1.2 + index * 0.1 }}
								>
									{subject}
								</motion.h3>
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 1.4 + index * 0.1 }}
								>
									Discover the wonders of {subject.toLowerCase()} with our expert tutors.
								</motion.p>
							</motion.div>
						)
					)}
				</motion.div>
			</main>

			<footer className="p-4 text-center">
				<p>&copy; 2024 Eduyeet. All rights reserved.</p>
			</footer>
		</div>
	)
}
