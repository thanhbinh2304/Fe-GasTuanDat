'use client';
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import styles from '../Employee/EmployeeDetailModal.module.css';

interface PaymentModalProps {
  defaultPersonName?: string;
  defaultAmount?: number;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function PaymentModal({ defaultPersonName = '', defaultAmount = 0, onClose, onSave }: PaymentModalProps) {
  const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  const [formData, setFormData] = useState({
    code: `SQ${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    time: new Date().toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    personName: defaultPersonName,
    method: 'Tiền mặt',
    amount: defaultAmount,
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container} style={{ maxWidth: '600px' }}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết phiếu thu/chi</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body} style={{ padding: '20px' }}>
          <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.leftCol}>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã phiếu</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Thời gian</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Người nộp/nhận</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Hình thức</label>
                  <select
                    className={styles.select}
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Giá trị</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className={styles.input}
                    style={{
                      color: '#1890ff',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      padding: '12px',
                    }}
                    value={formatCurrency(formData.amount)}
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\D/g, ''));
                      setFormData({ ...formData, amount: val });
                    }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#1890ff', fontWeight: 'bold', fontSize: '18px' }}>
                    đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer} style={{ justifyContent: 'flex-end', padding: '16px 20px', borderTop: '1px solid #e0e0e0', display: 'flex' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '6px 20px',
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                color: '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Bỏ qua
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '6px 24px',
                backgroundColor: 'var(--primary-color)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Tạo phiếu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
