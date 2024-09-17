'use client'

import React, { useState } from 'react'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getUsers, User } from '../action'

const columnHelper = createColumnHelper<User>()

const columns = [
	columnHelper.accessor('id', {
		cell: (info) => info.getValue(),
		header: () => <span>ID</span>
	}),
	columnHelper.accessor('name', {
		cell: (info) => info.getValue(),
		header: () => <span>Name</span>
	}),
	columnHelper.accessor('type', {
		cell: (info) => info.getValue(),
		header: () => <span>Type</span>
	}),
	columnHelper.accessor('id', {
		id: 'actions',
		cell: (info) => (
			<Link href={`/users/${info.getValue()}`} passHref>
				<Button variant="outline" size="sm">
					View Details
				</Button>
			</Link>
		),
		header: () => <span>Actions</span>
	})
]

interface UserTableProps {
	initialData: {
		users: User[]
		totalPages: number
	}
}

export default function UserTable({ initialData }: UserTableProps) {
	const [data, setData] = useState(initialData.users)
	const [totalPages, setTotalPages] = useState(initialData.totalPages)
	const [isLoading, setIsLoading] = useState(false)

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		pageCount: totalPages,
		manualPagination: true
	})

	const fetchData = async (page: number) => {
		setIsLoading(true)
		const result = await getUsers(page, 10)
		setData(result.users)
		setTotalPages(result.totalPages)
		setIsLoading(false)
	}

	return (
		<div className="p-2">
			<div className="rounded-md border border-border">
				<table className="w-full">
					<thead className="bg-muted/50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-border bg-background">
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="mt-4 flex items-center justify-between">
				<Button
					onClick={() => fetchData(table.getState().pagination.pageIndex)}
					disabled={!table.getCanPreviousPage() || isLoading}
				>
					Previous
				</Button>
				<span className="text-sm text-muted-foreground">
					Page {table.getState().pagination.pageIndex + 1} of {totalPages}
				</span>
				<Button
					onClick={() => fetchData(table.getState().pagination.pageIndex + 2)}
					disabled={!table.getCanNextPage() || isLoading}
				>
					Next
				</Button>
			</div>
			{isLoading && <div className="mt-4 text-center">Loading...</div>}
		</div>
	)
}
