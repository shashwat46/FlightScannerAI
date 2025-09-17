import Link from 'next/link';
import styles from './styles.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 12 }}>
        <Link href="/" className={styles.brand}>FlightScannerAI</Link>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/from/LAX/anywhere" className={styles.link}>Anywhere</Link>
          <Link href="/learn/flight-deals" className={styles.link}>Learn</Link>
        </nav>
      </div>
    </header>
  );
}


