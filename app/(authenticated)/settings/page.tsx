import SettingsForm from './components/settings-form'

export default async function SettingsPage() {
	// In a real application, you would fetch the user's current settings here
	// For this example, we'll use mock data
	const currentSettings = {
		theme: 'light',
		country: 620
	}

	return <SettingsForm initialSettings={currentSettings} />
}
