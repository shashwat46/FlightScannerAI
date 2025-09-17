import React from 'react';
import styles from './styles.module.css';

interface AlertProps {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  body?: string;
}

export default function Alert({ tone = 'info', title, body }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[`alert--${tone}`]}`} role="status" aria-live="polite">
      {title && <div className={styles.alert__title}>{title}</div>}
      {body && <div className={styles.alert__body}>{body}</div>}
    </div>
  );
}


