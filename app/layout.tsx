import '../src/frontend/styles/globals.css';
import Header from '../src/frontend/components/composite/Header';
export const metadata = {
	title: 'FlightScannerAI',
	description: 'Flight search and scoring demo'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Header />
				{children}
			</body>
		</html>
	);
}


