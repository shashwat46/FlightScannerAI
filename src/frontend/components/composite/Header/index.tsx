import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './styles.module.css';

interface HeaderProps {
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({ showBackButton = false, backUrl = "/" }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 12 }}>
        {/* Left side - Back button or spacer */}
        <div style={{ width: '120px' }}>
          {showBackButton && (
            <Link href={backUrl} className={styles.backButton}>
              <ArrowLeft size={20} strokeWidth={2.5} />
              <span>Back to results</span>
            </Link>
          )}
        </div>

        {/* Center - Logo and brand */}
        <div className={styles.brandCenter}>
          <Link href="/" className={styles.brand}>
            <img src="/logo.svg" alt="Wingman AI" className={styles.logo} />
            <span>Wingman AI</span>
          </Link>
        </div>

        {/* Right side - spacer for symmetry */}
        <div style={{ width: '120px' }}></div>
      </div>
    </header>
  );
}


