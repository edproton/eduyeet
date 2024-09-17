import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { System } from '../action/get-subjects'
import { TreeItem } from './tree-item'

interface SystemsTableProps {
	systems: System[]
}

export default function SystemsTable({ systems }: SystemsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Systems Hierarchy Overview</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Tutors</TableHead>
							<TableHead>Students</TableHead>
							<TableHead>Type</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{systems.map((system, index) => (
							<TreeItem key={index} item={system} depth={0} />
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
