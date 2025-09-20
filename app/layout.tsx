import '../src/frontend/styles/globals.css';
import ConditionalHeader from '../src/frontend/components/composite/ConditionalHeader';
import { LoadingProvider } from '../src/frontend/contexts/LoadingContext';
import GlobalLoadingScreen from '../src/frontend/components/ui/GlobalLoadingScreen';

export const metadata = {
	title: 'Wingman AI',
	description: 'AI-powered flight search and deal scoring'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<LoadingProvider>
					<ConditionalHeader />
					<GlobalLoadingScreen />
					{children}
				</LoadingProvider>
			</body>
		</html>
	);
}


