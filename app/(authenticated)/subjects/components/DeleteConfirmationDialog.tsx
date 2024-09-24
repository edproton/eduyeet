import React from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface DeleteConfirmationDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	itemType?: string
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	itemType
}) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the
						{itemType && ` ${itemType}`} and all of its associated data.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
