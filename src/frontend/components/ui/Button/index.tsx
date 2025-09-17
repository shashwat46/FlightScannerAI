import React from 'react';
import styles from './styles.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, variant = 'primary', children, ...rest }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[`button--${variant}`]}`} {...rest}>
      {label || children}
    </button>
  );
}


