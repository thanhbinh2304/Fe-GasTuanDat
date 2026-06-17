'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from '@/components/GasBook/FilterItemModal.module.css';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import { createPosition } from '@/services/employeeService';

interface AddJobTitleModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function AddJobTitleModal({ onClose, onSave }: AddJobTitleModalProps) {
  const [name, setName] = useState('');
  const { showToast } = useToastConfirm();

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    try {
      await createPosition({ positionName: name });
      showToast('Thao tác thành công', 'success');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating position:', error);
      showToast('Thao tác không thành công', 'error');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Thêm chức danh</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên chức danh <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên chức danh"
              autoFocus
            />
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerRightOnly}>
            <button className={styles.btnCancel} onClick={onClose}>
              Bỏ qua
            </button>
            <button className={styles.btnSave} onClick={handleSave}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
