'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Phone, ChevronDown, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import logoImg from '../../shares/Logo.png';
import ForgotPasswordModal from './ForgotPasswordModal';
import styles from './LoginPage.module.css';
import { loginUser } from '../../services/authService';

const normalizeToken = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.replace(/^Bearer\s+/i, '').trim();
};

const extractToken = (res: any) => {
  return normalizeToken(
    res?.token ??
    res?.accessToken ??
    res?.jwt ??
    res?.data?.token ??
    res?.data?.accessToken ??
    res?.data?.jwt
  );
};

const extractCurrentUser = (res: any) => {
  return res?.user ?? res?.data?.user ?? res?.account ?? res?.data?.account ?? null;
};

export default function LoginPage() {
  const router = useRouter();
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginUser(username, password);
      const token = extractToken(res);

      if (!token) {
        throw new Error('Không nhận được token đăng nhập hợp lệ từ máy chủ');
      }

      localStorage.setItem('token', token);

      const currentUser = extractCurrentUser(res);
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          <img src={logoImg.src} alt="Logo" style={{ height: '60px', width: 'auto' }} />
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div style={{ color: 'red', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {showPassword ? (
              <Eye size={18} className={styles.eyeIcon} onClick={() => setShowPassword(false)} />
            ) : (
              <EyeOff size={18} className={styles.eyeIcon} onClick={() => setShowPassword(true)} />
            )}
          </div>

          <div className={styles.options}>
            <a href="#" className={styles.forgotPassword} onClick={(e) => {
              e.preventDefault();
              setIsForgotOpen(true);
            }}>Quên mật khẩu?</a>
          </div>
        </form>

        <button type="button" className={styles.loginBtn} onClick={handleLogin} disabled={isLoading}>
          <LogIn size={18} />
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>

      {isForgotOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotOpen(false)} />
      )}
    </div>
  );
}
