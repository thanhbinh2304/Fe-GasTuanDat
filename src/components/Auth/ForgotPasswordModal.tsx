import React, { useState } from 'react';
import styles from './ForgotPasswordModal.module.css';
import { forgotPassword } from '../../services/authService';

interface Props {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: Props) {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setMessage('Vui lòng nhập tên đăng nhập!');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      const res = await forgotPassword(username);
      setMessage(res.message || 'Đã gửi thông tin vào email của bạn.');
      setIsError(false);
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
          <span className={styles.title}>Quên mật khẩu</span>
        </div>

        <div className={styles.body}>
          {message && (
            <div style={{ color: isError ? 'red' : 'green', fontSize: '13px', marginBottom: '10px' }}>
              {message}
            </div>
          )}
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Nhập tên đăng nhập" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>Quay lại</button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Lấy mật khẩu'}
          </button>
        </div>
      </div>
    </div>
  );
}
