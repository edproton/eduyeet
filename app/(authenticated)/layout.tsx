'use client'

import NavigationMenu from '@/components/layout/menus/navigation-menu'
import SidebarMenu from '@/components/layout/menus/sidebar-menu'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface AuthLayoutProps {
	children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<QueryClientProvider client={new QueryClient()}>
			<div className="flex min-h-screen w-full flex-col bg-muted/40">
				<aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
					<SidebarMenu />
				</aside>
				<div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
					<header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
						<NavigationMenu />
					</header>
					<main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
				</div>
			</div>
		</QueryClientProvider>
	)
}
