'use client';
import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import clsx from 'clsx';

// Định nghĩa cấu trúc menu - dễ dàng sửa sau này
const NAV_ITEMS = [
  { name: 'Tổng quan', path: '/dashboard', children: [] },
  {
    name: 'Hàng hóa',
    path: '#',
    children: [
      { name: 'Danh sách hàng hóa', path: '/danh-sach-hang-hoa' },
      { name: 'Điều chuyển hàng hóa', path: '/dieu-chuyen' },
      { name: 'Kiểm hàng hóa', path: '/kiem-hang' },
    ],
  },
  {
    name: 'Nhập hàng',
    path: '#',
    children: [
      { name: 'Đặt hàng nhập', path: '/dat-hang-nhap' },
      { name: 'Phiếu nhập hàng', path: '/phieu-nhap-hang' },
    ],
  },
  {
    name: 'Xuất hàng',
    path: '#',
    children: [
      { name: 'Đặt hàng xuất', path: '/dat-hang-xuat' },
      { name: 'Phiếu xuất hàng', path: '/phieu-xuat-hang' },
      { name: 'Khuyến mại', path: '/khuyen-mai' },
      { name: 'Phiếu nợ', path: '/phieu-no' },
    ],
  },
  {
    name: 'Đối tác',
    path: '#',
    children: [
      { name: 'Sổ gas', path: '/so-gas' },
      { name: 'Khách hàng', path: '/khach-hang' },
      { name: 'Nhà cung cấp', path: '/nha-cung-cap' },
    ],
  },
  { name: 'Nhân viên', path: '/nhan-vien', children: [] },

  {
    name: 'Báo cáo',
    path: '#',
    children: [
      { name: 'Hàng hóa', path: '/bao-cao/hang-hoa' },
      { name: 'Xuất hàng', path: '/bao-cao/xuat-hang' },
      { name: 'Nhập hàng', path: '/bao-cao/nhap-hang' },
      { name: 'Sổ gas', path: '/bao-cao/so-gas' },
      { name: 'Khách hàng', path: '/bao-cao/khach-hang' },
      { name: 'Nhà cung cấp', path: '/bao-cao/nha-cung-cap' },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [roleName, setRoleName] = useState<string>('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(payloadBase64));
        setRoleName(payload.role || '');
      }
    } catch { /* ignore */ }
  }, []);

  const isItemActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.path !== '#' && pathname === item.path) {
      return true;
    }
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => pathname === child.path);
    }
    return false;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        {NAV_ITEMS.map((item, idx) => {
          const isActive = isItemActive(item);
          const hasChildren = item.children.length > 0;
          const normalizedRole = roleName ? roleName.toLowerCase() : '';
          const isEmployee = normalizedRole.includes('nhân viên') || normalizedRole.includes('nhan vien') || normalizedRole.includes('nhan_vien');
          const isDisabled = (item.name === 'Tổng quan' || item.name === 'Báo cáo') && isEmployee;

          if (isDisabled) {
            return (
              <div key={idx} className={clsx(styles.navItem, styles.disabled)} title="Chức năng này không dành cho Nhân viên">
                <span className={styles.navLabel}>{item.name}</span>
              </div>
            );
          }

          if (hasChildren) {
            return (
              <div
                key={idx}
                className={clsx(
                  styles.navItem,
                  isActive && styles.active,
                  styles.hasDropdown
                )}
              >
                <span className={styles.navLabel}>
                  {item.name}
                </span>

                <div className={styles.dropdown}>
                  {item.children.map((child, cidx) => (
                    <Link
                      key={cidx}
                      href={child.path}
                      className={clsx(
                        styles.dropdownItem,
                        pathname === child.path && styles.dropdownActive
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={idx}
              href={item.path}
              className={clsx(styles.navItem, isActive && styles.active)}
            >
              <span className={styles.navLabel}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <Link href="/xu-ly-xuat-hang" target="_blank" rel="noopener noreferrer" className={styles.sellButton}>
        <ShoppingCart size={16} strokeWidth={2.5} />
        Bán hàng
      </Link>
    </nav>
  );
}
