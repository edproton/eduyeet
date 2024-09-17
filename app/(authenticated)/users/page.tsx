import { getUsers } from './action'
import SummaryCards from './components/summary-cards'
import UserTable from './components/user-table'

export default function UsersPage() {
	return (
		<div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
				<SummaryCards />
			</div>

			<div className="shadow rounded-lg">
				<div className="p-6">
					<h2 className="text-xl font-semibold mb-4">User List</h2>
					<UserTableWrapper />
				</div>
			</div>
		</div>
	)
}

async function UserTableWrapper() {
	const initialData = await getUsers(1, 10)

	return <UserTable initialData={initialData} />
}
