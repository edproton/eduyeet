export function toPascalCaseWithSpaces(str: string) {
	return (
		str
			// Replace underscores, hyphens and spaces with spaces
			.replace(/[_-\s]+/g, ' ')
			// Split the string into words
			.split(' ')
			// Capitalize the first letter of each word and join with spaces
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ')
	)
}

export function removeQuotes(str: string): string {
	return str.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"')
}
