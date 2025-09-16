export const metadata = {
	title: 'FlightScannerAI',
	description: 'Flight search and scoring demo'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}


