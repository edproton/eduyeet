'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	ColumnDef,
	flexRender,
	SortingState,
	PaginationState,
	VisibilityState
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Search,
	Settings,
	Users
} from 'lucide-react'
import { User } from '@/repositories'

const columns: ColumnDef<User>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="hover:bg-transparent"
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		}
	},
	{
		accessorKey: 'email',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="hover:bg-transparent"
				>
					Email
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		}
	},
	{
		accessorKey: 'type',
		header: 'User Type',
		cell: ({ row }) => (
			<span
				className={`${row.original.type === 'student' ? 'text-blue-600' : 'text-green-600'} dark:text-green-400`}
			>
				{row.original.type}
			</span>
		)
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className="text-right">
				<Link href={`/users/${row.original.id}`} passHref>
					<Button variant="secondary" size="sm" className="w-[60px]">
						View
					</Button>
				</Link>
			</div>
		)
	}
]

export default function UserTable({ data }: { data: User[] }) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [userTypeFilter, setUserTypeFilter] = useState<string>('all')
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5
	})
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		email: false
	})

	const filteredData = useMemo(() => {
		return data.filter((user) => userTypeFilter === 'all' || user.type === userTypeFilter)
	}, [data, userTypeFilter])

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setColumnVisibility,
		globalFilterFn: (row, columnId, filterValue) => {
			const value = row.getValue(columnId) as string
			return value.toLowerCase().includes((filterValue as string).toLowerCase())
		},
		state: {
			sorting,
			globalFilter,
			pagination,
			columnVisibility
		}
	})

	const currentPage = table.getState().pagination.pageIndex + 1
	const totalPages = table.getPageCount()

	return (
		<Card>
			<CardHeader>
				<CardTitle>User List</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-col gap-4 md:flex-row md:items-center">
							<div className="relative">
								<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Filter users..."
									value={globalFilter}
									onChange={(e) => setGlobalFilter(e.target.value)}
									className="pl-8 w-full md:w-[300px]"
								/>
							</div>
							<Select value={userTypeFilter} onValueChange={(value) => setUserTypeFilter(value)}>
								<SelectTrigger className="w-full md:w-[140px]">
									<Users className="mr-2 h-4 w-4" />
									<SelectValue placeholder="All Types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="student">Student</SelectItem>
									<SelectItem value="tutor">Tutor</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<Select
								value={table.getState().pagination.pageSize.toString()}
								onValueChange={(value) => {
									table.setPageSize(Number(value))
								}}
							>
								<SelectTrigger className="w-[100px]">
									<SelectValue placeholder="5 rows" />
								</SelectTrigger>
								<SelectContent>
									{[5, 10, 50].map((pageSize) => (
										<SelectItem key={pageSize} value={pageSize.toString()}>
											{pageSize} rows
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="icon">
										<Settings className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{table
										.getAllColumns()
										.filter((column) => column.getCanHide())
										.map((column) => {
											return (
												<DropdownMenuCheckboxItem
													key={column.id}
													className="capitalize"
													checked={column.getIsVisible()}
													onCheckedChange={(value) => column.toggleVisibility(!!value)}
												>
													{column.id}
												</DropdownMenuCheckboxItem>
											)
										})}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					<div className="rounded-md border overflow-hidden">
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow key={row.id}>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={columns.length} className="h-24 text-center">
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					<div className="flex items-center justify-between py-4">
						<div className="flex-1 text-sm text-muted-foreground">
							Showing {table.getRowModel().rows.length} of {filteredData.length} users
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<ChevronsLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm font-medium">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="icon"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<ChevronsRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
