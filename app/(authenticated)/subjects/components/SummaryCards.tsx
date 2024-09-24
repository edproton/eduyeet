import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Library, BookOpen, GraduationCap } from 'lucide-react'

interface SummaryCardsProps {
	systemsCount: number
	subjectsCount: number
	qualificationsCount: number
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
	systemsCount,
	subjectsCount,
	qualificationsCount
}) => {
	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Learning Systems</CardTitle>
					<Library className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{systemsCount}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
					<BookOpen className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{subjectsCount}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Qualifications</CardTitle>
					<GraduationCap className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{qualificationsCount}</div>
				</CardContent>
			</Card>
		</>
	)
}
