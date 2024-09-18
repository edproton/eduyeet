import { Suspense } from 'react'
import SummaryCards from './components/summary-cards'
import UsersTable from './components/user-table'
import { getUsers } from './action'

export default async function UsersPage() {
	const { users } = await getUsers()
	return (
		<div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
				<Suspense fallback={<div>Loading summary...</div>}>
					<SummaryCards />
				</Suspense>
			</div>

			<div className="shadow rounded-lg">
				<UsersTable data={users} />
			</div>
		</div>
	)
}
