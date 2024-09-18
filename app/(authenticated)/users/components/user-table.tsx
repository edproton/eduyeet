'use client'

import { useState } from 'react'
import {
	createColumnHelper,
	useReactTable,
	getCoreRowModel,
	flexRender
} from '@tanstack/react-table'

const initialData = [
	{
		id: 1,
		name: 'John Doe',
		email: 'doe@gmail.com'
	},
	{
		id: 2,
		name: 'Jane Doe',
		email: 'jan@gmail.com'
	},
	{
		id: 3,
		name: 'John Smith',
		email: 'smithe@outlook.com'
	}
]

const columnHelper = createColumnHelper<(typeof initialData)[0]>()

const columns = [
	columnHelper.accessor('id', {
		cell: (info) => info.getValue(),
		footer: (info) => info.column.id
	}),
	columnHelper.accessor((row) => row.name, {
		id: 'name',
		cell: (info) => <i>{info.getValue()}</i>,
		header: () => <span>Last Name</span>,
		footer: (info) => info.column.id
	}),
	columnHelper.accessor('email', {
		cell: (info) => info.getValue(),
		footer: (info) => info.column.id
	})
]

export default function UserTable() {
	const [data, setData] = useState(initialData)

	const table = useReactTable({ data, columns, getRowModel: getCoreRowModel() })
	return (
		<table>
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.header, header.getContext())}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
						))}
					</tr>
				))}
			</tbody>
			<tfoot>
				{table.getFooterGroups().map((footerGroup) => (
					<tr key={footerGroup.id}>
						{footerGroup.headers.map((header) => (
							<th key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.footer, header.getContext())}
							</th>
						))}
					</tr>
				))}
			</tfoot>
		</table>
	)
}
