'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Employee, Position, Ward, Area, getPositions, getWards, getAreas, createEmployee } from '@/services/employeeService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './EmployeeDetailModal.module.css';

interface AddEmployeeModalProps {
  onClose: () => void;
  onSave: (emp: Employee) => void;
}

export default function AddEmployeeModal({ onClose, onSave }: AddEmployeeModalProps) {
  const { showToast } = useToastConfirm();
  const [activeTab, setActiveTab] = useState<'info'>('info');

  const [positions, setPositions] = useState<Position[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [employeeName, setEmployeeName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [ward, setWard] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posRes, wardsRes, areasRes] = await Promise.all([
          getPositions(),
          getWards(),
          getAreas(),
        ]);
        setPositions(posRes);
        setWards(wardsRes);
        setAreas(areasRes);

        if (posRes.length > 0) setJobTitle(posRes[0].positionId);
        if (areasRes.length > 0) setArea(areasRes[0].areaId);
        if (wardsRes.length > 0) setWard(wardsRes[0].wardId);
      } catch (err) {
        showToast('Thao tác không thành công', 'error');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [showToast]);


  const handleSave = async () => {
    if (!employeeName.trim() || !email.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    if (!jobTitle) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const newEmp = await createEmployee({
        fullName: employeeName,
        positionId: jobTitle,
        phoneNumber: phone,
        email: email,
        note: notes,
        wardId: ward || undefined,
      });
      onSave(newEmp);
      showToast('Thao tác thành công', 'success');
      onClose();
    } catch (err: any) {
      showToast('Thao tác không thành công', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container} style={{ maxWidth: '800px' }}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới nhân viên</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Thông tin
          </button>
        </div>

        <div className={styles.body}>
          {activeTab === 'info' && (
            <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr' }}>
              <div className={styles.leftCol}>
                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Mã nhân viên</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Mã tự động"
                      value=""
                      disabled
                      style={{ backgroundColor: '#f5f5f5', color: '#888' }}
                    />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Tên nhân viên <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                    <input
                      type="text"
                      className={styles.input}
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Chức danh</label>
                    <select
                      className={styles.select}
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      disabled={loadingData}
                    >
                      {loadingData ? (
                        <option value="">Đang tải...</option>
                      ) : (
                        positions.map(p => (
                          <option key={p.positionId} value={p.positionId}>
                            {p.positionName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Số điện thoại</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <input
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Ghi chú</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Khu vực</label>
                    <select
                      className={styles.select}
                      value={area}
                      onChange={(e) => {
                        setArea(e.target.value);
                        const filteredWards = wards.filter(w => w.areaId === e.target.value);
                        if (filteredWards.length > 0) {
                          setWard(filteredWards[0].wardId);
                        } else {
                          setWard('');
                        }
                      }}
                      disabled={loadingData}
                    >
                      {loadingData ? (
                        <option value="">Đang tải...</option>
                      ) : (
                        areas.map(a => (
                          <option key={a.areaId} value={a.areaId}>
                            {a.areaName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Phường/xã</label>
                    <select
                      className={styles.select}
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      disabled={loadingData || !area}
                    >
                      {loadingData ? (
                        <option value="">Đang tải...</option>
                      ) : (
                        wards.filter(w => w.areaId === area).map(w => (
                          <option key={w.wardId} value={w.wardId}>
                            {w.wardName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Bỏ qua
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className={styles.spinner} /> : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
