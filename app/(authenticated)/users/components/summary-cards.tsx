// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Users, Activity } from 'lucide-react'
// import { getSummaryData } from '../action'

// export default async function SummaryCards() {
// 	const dashboardData = await getSummaryData()

// 	return (
// 		<>
// 			<Card>
// 				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 					<CardTitle className="text-sm font-medium">Total Users</CardTitle>
// 					<Users className="h-4 w-4 text-muted-foreground" />
// 				</CardHeader>
// 				<CardContent>
// 					<div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
// 					<p className="text-xs text-muted-foreground">Registered users</p>
// 				</CardContent>
// 			</Card>
// 			<Card>
// 				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 					<CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
// 					<Activity className="h-4 w-4 text-muted-foreground" />
// 				</CardHeader>
// 				<CardContent>
// 					<div className="text-2xl font-bold">{dashboardData.activeSessions}</div>
// 					<p className="text-xs text-muted-foreground">Current active sessions</p>
// 				</CardContent>
// 			</Card>
// 		</>
// 	)
// }
