'use client';
import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, Lock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import logoImg from '../../shares/Logo.png';
import ChangePasswordModal from '../Auth/ChangePasswordModal';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      {/* Logo */}
      <Link href="/dashboard" className={styles.logo}>
        <img src={logoImg.src} alt="Logo" style={{ height: '40px', width: 'auto' }} />
        <span>Showroom Gas Tuấn Đạt</span>
      </Link>

      <div className={styles.actions}>
        <div className={styles.accountProfileWrapper} ref={dropdownRef}>
          <div className={styles.accountProfile} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className={styles.avatar}>
              <User size={16} />
            </div>
            <span className={styles.accountName}>Tài khoản</span>
            <ChevronDown size={14} className={styles.icon} />
          </div>

          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <div
                className={styles.dropdownItem}
                onClick={() => {
                  router.push('/tai-khoan');
                  setIsDropdownOpen(false);
                }}
              >
                <Settings size={14} className={styles.dropdownIcon} />
                Quản lý tài khoản
              </div>
              <div
                className={styles.dropdownItem}
                onClick={() => {
                  setIsChangePasswordOpen(true);
                  setIsDropdownOpen(false);
                }}
              >
                <Lock size={14} className={styles.dropdownIcon} />
                Đổi mật khẩu
              </div>
              <div className={styles.dropdownDivider}></div>
              <div className={styles.dropdownItem} onClick={() => router.push('/')}>
                <LogOut size={14} className={styles.dropdownIcon} />
                Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>

      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
      )}
    </header>
  );
}
