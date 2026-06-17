'use client';
import React, { useState } from 'react';
import { X, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import styles from '../Employee/EmployeeDetailModal.module.css';
import { Account } from '@/services/accountService';
import EmployeeSearchInput from '@/components/ExportProcessing/EmployeeSearchInput';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import { getRoles, Role } from '@/services/roleService';

interface AddAccountModalProps {
  accounts: Account[];
  onClose: () => void;
  onSave: (newAcc: Account) => void;
}

export default function AddAccountModal({ accounts, onClose, onSave }: AddAccountModalProps) {
  const { showToast } = useToastConfirm();
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState<Partial<Account>>({
    code: '',
    username: '',
    roleId: '',
    employeeCode: '',
    employeeName: '',
    employeeId: '',
    notes: '',
  });

  React.useEffect(() => {
    getRoles().then(data => {
      setRoles(data);
      if (data.length > 0 && !formData.roleId) {
        setFormData(prev => ({ ...prev, roleId: data[0].roleId }));
      }
    });
  }, []);

  const handleSave = () => {
    if (!formData.username?.trim() || !password.trim() || !formData.roleId || !formData.employeeId) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    const existingAcc = accounts.find(a => a.employeeId === formData.employeeId);
    if (existingAcc) {
      showToast('Nhân viên này đã được gắn với một tài khoản khác', 'error');
      return;
    }

    onSave({
      ...formData,
      password,
    } as Account);
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container} style={{ maxWidth: '600px' }}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới tài khoản</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.body} style={{ padding: '20px' }}>
          <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.leftCol}>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã tài khoản</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Tự động"
                    value={formData.code}
                    disabled
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Tên đăng nhập <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mật khẩu <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={styles.input}
                      style={{ paddingLeft: '32px', paddingRight: '32px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Vai trò <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <select
                    className={styles.select}
                    value={formData.roleId || ''}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    {roles.map(r => (
                      <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Nhân viên <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <EmployeeSearchInput
                    value={
                      formData.employeeId
                        ? ({ code: formData.employeeCode, employeeName: formData.employeeName, id: formData.employeeId } as any)
                        : null
                    }
                    onChange={(emp) => {
                      if (emp) {
                        setFormData({ ...formData, employeeCode: emp.code, employeeName: emp.employeeName, employeeId: String(emp.id) });
                      } else {
                        setFormData({ ...formData, employeeCode: '', employeeName: '', employeeId: '' });
                      }
                    }}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ghi chú</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>Bỏ qua</button>
            <button className={styles.saveBtn} onClick={handleSave}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
