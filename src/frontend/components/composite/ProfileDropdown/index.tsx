'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import styles from './styles.module.css';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

export default function ProfileDropdown({ user, onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userAvatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className={styles.profileContainer} ref={dropdownRef}>
      <button onClick={toggleDropdown} className={styles.avatarButton}>
        {userAvatarUrl ? (
          <img src={userAvatarUrl} alt="User Avatar" className={styles.avatar} />
        ) : (
          <div className={styles.placeholderAvatar}>
            <span>{user.email?.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownHeader}>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
          <ul className={styles.dropdownList}>
            <li className={styles.dropdownItem}>
              <Link href="/profile" className={styles.dropdownLink}>
                Profile
              </Link>
            </li>
            <li className={styles.dropdownItem}>
              <button onClick={onSignOut} className={styles.dropdownButton}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
