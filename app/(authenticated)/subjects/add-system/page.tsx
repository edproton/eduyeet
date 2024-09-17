'use client'

import { useRouter } from 'next/navigation'
import {
	useForm,
	useFieldArray,
	useFormState,
	Control,
	UseFormRegister,
	FieldErrors
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { addSystem } from './actions/add-system'

const QualificationSchema = z.object({
	name: z.string().min(1, 'Qualification name is required')
})

const SubjectSchema = z.object({
	name: z.string().min(1, 'Subject name is required'),
	qualifications: z.array(QualificationSchema).min(1, 'At least one qualification is required')
})

const SystemSchema = z.object({
	name: z.string().min(1, 'System name is required'),
	subjects: z.array(SubjectSchema).min(1, 'At least one subject is required')
})

type FormValues = z.infer<typeof SystemSchema>

export default function AddSystemPage() {
	const router = useRouter()
	const { toast } = useToast()

	const {
		register,
		control,
		handleSubmit,
		formState: { errors }
	} = useForm<FormValues>({
		resolver: zodResolver(SystemSchema),
		defaultValues: {
			name: '',
			subjects: [{ name: '', qualifications: [{ name: '' }] }]
		}
	})

	const {
		fields: subjectFields,
		append: appendSubject,
		remove: removeSubject
	} = useFieldArray({
		control,
		name: 'subjects'
	})

	const { isSubmitting } = useFormState({
		control
	})

	const onSubmit = async (data: FormValues) => {
		const result = await addSystem(data)
		if (result.success) {
			toast({
				title: 'Success',
				description: result.message
			})
			router.push('/subjects')
		} else {
			toast({
				title: 'Error',
				description: 'Failed to add system. Please check your inputs.',
				variant: 'destructive'
			})
		}
	}

	return (
		<div className="container mx-auto p-4">
			<Link href="/subjects">
				<Button variant="ghost" className="mb-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
				</Button>
			</Link>
			<Card>
				<CardHeader>
					<CardTitle>Add New System</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						<div className="space-y-2">
							<Label htmlFor="name">System Name</Label>
							<Input id="name" {...register('name')} placeholder="Enter system name" />
							{errors.name && <p className="text-red-500">{errors.name.message}</p>}
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Subjects</h3>
							{subjectFields.map((field, subjectIndex) => (
								<div key={field.id} className="space-y-4 p-4 border rounded">
									<div className="flex items-center space-x-2">
										<Input
											{...register(`subjects.${subjectIndex}.name`)}
											placeholder={`Enter subject ${subjectIndex + 1} name`}
										/>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											onClick={() => removeSubject(subjectIndex)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									{errors.subjects?.[subjectIndex]?.name && (
										<p className="text-red-500">{errors.subjects[subjectIndex]?.name?.message}</p>
									)}

									<QualificationFields
										control={control}
										subjectIndex={subjectIndex}
										register={register}
										errors={errors}
									/>
								</div>
							))}
							<Button
								type="button"
								onClick={() => appendSubject({ name: '', qualifications: [{ name: '' }] })}
							>
								<Plus className="mr-2 h-4 w-4" /> Add Subject
							</Button>
							{errors.subjects && <p className="text-red-500">{errors.subjects.message}</p>}
						</div>

						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting...
								</>
							) : (
								'Submit'
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}

interface QualificationFieldsProps {
	control: Control<FormValues>
	subjectIndex: number
	register: UseFormRegister<FormValues>
	errors: FieldErrors<FormValues>
}

function QualificationFields({
	control,
	subjectIndex,
	register,
	errors
}: QualificationFieldsProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: `subjects.${subjectIndex}.qualifications` as const
	})

	return (
		<div className="space-y-4">
			<h4 className="font-medium">Qualifications</h4>
			{fields.map((field, qualIndex) => (
				<div key={field.id} className="space-y-2">
					<div className="flex items-center space-x-2">
						<Input
							{...register(`subjects.${subjectIndex}.qualifications.${qualIndex}.name` as const)}
							placeholder={`Qualification ${qualIndex + 1} name`}
						/>
						<Button
							type="button"
							variant="destructive"
							size="icon"
							onClick={() => remove(qualIndex)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
					{errors.subjects?.[subjectIndex]?.qualifications?.[qualIndex]?.name && (
						<p className="text-red-500">
							{errors.subjects[subjectIndex]?.qualifications?.[qualIndex]?.name?.message}
						</p>
					)}
				</div>
			))}
			{errors.subjects?.[subjectIndex]?.qualifications?.message && (
				<p className="text-red-500">{errors.subjects[subjectIndex]?.qualifications?.message}</p>
			)}
			<Button type="button" onClick={() => append({ name: '' })}>
				<Plus className="mr-2 h-4 w-4" /> Add Qualification
			</Button>
		</div>
	)
}
