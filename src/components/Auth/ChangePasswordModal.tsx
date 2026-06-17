'use client';
import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import styles from './ChangePasswordModal.module.css';
import { changePassword } from '../../services/authService';

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      setMessage('Vui lòng nhập đầy đủ thông tin!');
      setIsError(true);
      return;
    }
    if (newPass !== confirmPass) {
      setMessage('Mật khẩu nhập lại không khớp!');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await changePassword(currentPass, newPass);
      setMessage(res.message || 'Đổi mật khẩu thành công!');
      setIsError(false);

      // Tự động đóng modal sau 2 giây khi thành công
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setMessage(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Đổi mật khẩu</span>
          <div className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </div>
        </div>

        <div className={styles.body}>
          {message && (
            <div style={{ color: isError ? 'red' : 'green', fontSize: '13px', textAlign: 'center', marginBottom: '4px' }}>
              {message}
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu hiện tại</label>
            <div className={styles.inputWrapper}>
              <input
                type={showCurrent ? "text" : "password"}
                className={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
              />
              {showCurrent ? (
                <Eye size={16} className={styles.eyeIcon} onClick={() => setShowCurrent(false)} />
              ) : (
                <EyeOff size={16} className={styles.eyeIcon} onClick={() => setShowCurrent(true)} />
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu mới</label>
            <div className={styles.inputWrapper}>
              <input
                type={showNew ? "text" : "password"}
                className={styles.input}
                placeholder="Nhập mật khẩu mới"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              {showNew ? (
                <Eye size={16} className={styles.eyeIcon} onClick={() => setShowNew(false)} />
              ) : (
                <EyeOff size={16} className={styles.eyeIcon} onClick={() => setShowNew(true)} />
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nhập lại mật khẩu</label>
            <div className={styles.inputWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                className={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              {showConfirm ? (
                <Eye size={16} className={styles.eyeIcon} onClick={() => setShowConfirm(false)} />
              ) : (
                <EyeOff size={16} className={styles.eyeIcon} onClick={() => setShowConfirm(true)} />
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>Hủy</button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
