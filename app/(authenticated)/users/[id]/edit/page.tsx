// import { db } from '@/data/db'
// import { eq } from 'drizzle-orm'
// import EditUser from './components/form'
// import { ArrowLeft } from 'lucide-react'
// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import EditActionsCard from './components/edit-actions-card'
// import { users } from '@/data/schemas'

export default async function EditUserPage({ params }: { params: { id: string } }) {
	return <div>User {params.id} not found</div>

	// return (
	// 	<>
	// 		<Link href={`/users/${user.id}`}>
	// 			<Button variant="ghost" className="mb-4">
	// 				<ArrowLeft className="mr-2 h-4 w-4" /> Back to User Details
	// 			</Button>
	// 		</Link>

	// 		<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
	// 			<div className="md:col-span-4">
	// 				<EditUser user={user} />
	// 			</div>
	// 			<div className="md:col-span-1">
	// 				<EditActionsCard user={user} />
	// 			</div>
	// 		</div>
	// 	</>
	// )
}
