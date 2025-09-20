import '../src/frontend/styles/globals.css';
import ConditionalHeader from '../src/frontend/components/composite/ConditionalHeader';

export const metadata = {
	title: 'Wingman AI',
	description: 'AI-powered flight search and deal scoring'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<ConditionalHeader />
				{children}
			</body>
		</html>
	);
}


