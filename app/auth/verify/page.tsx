// import VerificationClient from './components/verification-client'

export default async function VerificationPage({
	searchParams
}: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	const userId = searchParams.id ? parseInt(searchParams.id as string, 10) : 0
	const code = searchParams.code as string

	return (
		<div>
			<h1 className="text-2xl font-semibold mb-4">Verify Email</h1>
			<div>
				To be implemented {userId} {code}
			</div>
		</div>
	)

	// const verificationResult = await verifyEmail(userId, code)

	// return (
	// 	<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4">
	// 		<div className="text-center">
	// 			<h1 className="text-5xl font-bold mb-8">Eduyeet</h1>
	// 			{/* <VerificationClient verificationResult={verificationResult} /> */}
	// 		</div>
	// 		<footer className="mt-8 text-sm opacity-75">
	// 			© {new Date().getFullYear()} Eduyeet. All rights reserved.
	// 		</footer>
	// 	</div>
	// )
}
