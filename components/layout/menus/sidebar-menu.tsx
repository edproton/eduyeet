'use client'

import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { footerItems, menuItems } from './types'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SidebarMenu() {
	const pathname = usePathname()

	const isActive = (href: string) => pathname.includes(href)

	return (
		<TooltipProvider>
			<nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
				<Link
					href="#"
					className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
				>
					<GraduationCap className="h-4 w-4 transition-all group-hover:scale-110" />
					<span className="sr-only">EduYeet</span>
				</Link>
				{menuItems.map((item) => (
					<Tooltip key={item.name}>
						<TooltipTrigger asChild>
							<Link
								href={item.href}
								className={cn(
									'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
									isActive(item.href)
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:text-foreground'
								)}
							>
								<item.icon className="h-5 w-5" />
								<span className="sr-only">{item.name}</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">{item.name}</TooltipContent>
					</Tooltip>
				))}
			</nav>

			<nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
				{footerItems.map((item) => (
					<Tooltip key={item.name}>
						<TooltipTrigger asChild>
							<Link
								href={item.href}
								className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
							>
								<item.icon className="h-5 w-5" />
								<span className="sr-only">{item.name}</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">{item.name}</TooltipContent>
					</Tooltip>
				))}
			</nav>
		</TooltipProvider>
	)
}
