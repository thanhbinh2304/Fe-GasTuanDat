'use client';
import React from 'react';
import { X } from 'lucide-react';
import { CashBookEntry } from '@/services/cashBookService';
import styles from './CashBookDetailModal.module.css';

interface CashBookDetailModalProps {
  cashBook: CashBookEntry;
  onClose: () => void;
}

export default function CashBookDetailModal({
  cashBook,
  onClose,
}: CashBookDetailModalProps) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.container} style={{ maxWidth: '600px' }}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết phiếu thu/chi</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className={styles.row}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label}>Mã phiếu</label>
                <div className={styles.readOnlyValue}>{cashBook.code}</div>
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label}>Thời gian</label>
                <div className={styles.readOnlyValue}>{cashBook.createdAt}</div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label}>Người nộp/nhận</label>
                <div className={styles.readOnlyValue}>{cashBook.personName}</div>
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label}>Hình thức</label>
                <div className={styles.readOnlyValue}>{cashBook.paymentMethod}</div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label}>Giá trị</label>
                <div className={styles.readOnlyValue} style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {new Intl.NumberFormat('vi-VN').format(cashBook.value)} đ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
