import LearningSystemApp from './components/LearningSystemApp'

export default async function SubjectsPage() {
	return (
		<>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Learning Systems Management</h1>
			</div>

			<LearningSystemApp />
		</>
	)
}
