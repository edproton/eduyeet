import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const token = localStorage.getItem('accessToken')
		if (!token) {
			router.push('/auth')
		} else {
			setIsAuthenticated(true)
		}
	}, [router])

	return isAuthenticated
}
