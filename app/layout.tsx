import '../src/frontend/styles/globals.css';
import { LoadingProvider } from '../src/frontend/contexts/LoadingContext';
import { AuthModalProvider } from '../src/frontend/contexts/AuthModalContext';
import GlobalLoadingScreen from '../src/frontend/components/ui/GlobalLoadingScreen';
import GlobalAuthModal from '../src/frontend/components/composite/GlobalAuthModal';

export const metadata = {
	title: 'Wingman AI',
	description: 'AI-powered flight search and deal scoring'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<AuthModalProvider>
					<LoadingProvider>
						<GlobalLoadingScreen />
						<GlobalAuthModal />
						{children}
					</LoadingProvider>
				</AuthModalProvider>
			</body>
		</html>
	);
}


