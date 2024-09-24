import { create } from 'zustand'
import * as z from 'zod'

const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	type: z.number().min(0).max(1)
})

interface RegisterState {
	form: z.infer<typeof registerSchema>
	errors: Partial<Record<keyof z.infer<typeof registerSchema>, string>>
	setForm: (form: Partial<z.infer<typeof registerSchema>>) => void
	validateForm: () => boolean
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
	form: {
		name: '',
		email: '',
		password: '',
		type: 0
	},
	errors: {},
	setForm: (newForm) => set((state) => ({ form: { ...state.form, ...newForm } })),
	validateForm: () => {
		const result = registerSchema.safeParse(get().form)
		if (result.success) {
			set({ errors: {} })
			return true
		} else {
			const errors: Partial<Record<keyof z.infer<typeof registerSchema>, string>> = {}
			result.error.issues.forEach((issue) => {
				const path = issue.path[0] as keyof z.infer<typeof registerSchema>
				errors[path] = issue.message
			})
			set({ errors })
			return false
		}
	}
}))
