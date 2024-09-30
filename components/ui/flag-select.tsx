'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Flag from 'react-world-flags'

const countries = [
	{ code: '826', name: 'United Kingdom' },
	{ code: '784', name: 'United Arab Emirates' },
	{ code: '156', name: 'China' },
	{ code: '620', name: 'Portugal' }
]

interface CustomFlagsSelectProps {
	value: string
	onChange: (value: string) => void
}

export function CustomFlagsSelect({ value, onChange }: CustomFlagsSelectProps) {
	const [open, setOpen] = React.useState(false)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{value ? (
						<>
							<Flag code={value} className="mr-2 h-4 w-6" />
							{countries.find((country) => country.code === value)?.name}
						</>
					) : (
						'Select country'
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
				<Command className="w-full">
					<CommandInput placeholder="Search country..." />
					<CommandEmpty>No country found.</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{countries.map((country) => (
								<CommandItem
									key={country.code}
									onSelect={() => {
										onChange(country.code === value ? '' : country.code)
										setOpen(false)
									}}
								>
									<Flag code={country.code} className="mr-2 h-4 w-6" />
									{country.name}
									<Check
										className={cn(
											'ml-auto h-4 w-4',
											value === country.code ? 'opacity-100' : 'opacity-0'
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
