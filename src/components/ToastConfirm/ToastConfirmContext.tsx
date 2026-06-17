'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import styles from './ToastConfirmContext.module.css';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
}

interface ToastConfirmContextType {
  showToast: (message: string, type: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const ToastConfirmContext = createContext<ToastConfirmContextType | undefined>(undefined);

export function useToastConfirm() {
  const context = useContext(ToastConfirmContext);
  if (!context) {
    throw new Error('useToastConfirm must be used within a ToastConfirmProvider');
  }
  return context;
}

export function ToastConfirmProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirm({ title, message, onConfirm });
  };

  const handleConfirmAccept = () => {
    if (confirm) {
      confirm.onConfirm();
      setConfirm(null);
    }
  };

  const handleConfirmClose = () => {
    setConfirm(null);
  };

  return (
    <ToastConfirmContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Notifications Container */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${t.type === 'success' ? styles.success : styles.error}`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={18} className={styles.successIcon} />
            ) : (
              <AlertCircle size={18} className={styles.errorIcon} />
            )}
            <span className={styles.toastText}>{t.message}</span>
            <button
              className={styles.toastCloseBtn}
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirm && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmHeader}>
              <span className={styles.confirmTitle}>{confirm.title}</span>
              <button className={styles.confirmCloseBtn} onClick={handleConfirmClose}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.confirmBody}>{confirm.message}</div>
            <div className={styles.confirmFooter}>
              <button className={styles.cancelBtn} onClick={handleConfirmClose}>
                Bỏ qua
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirmAccept}>
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastConfirmContext.Provider>
  );
}
