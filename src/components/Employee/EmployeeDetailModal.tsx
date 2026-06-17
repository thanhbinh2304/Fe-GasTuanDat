'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Employee,
  Position,
  Ward,
  Area,
  getPositions,
  getWards,
  getAreas,
  updateEmployee,
  deleteEmployee,
  UpdateEmployeePayload,
  getEmployeeById,
} from '@/services/employeeService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './EmployeeDetailModal.module.css';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onSave: (emp: Employee) => void;
  onDelete: (id: any) => void;
}

export default function EmployeeDetailModal({
  employee,
  onClose,
  onSave,
  onDelete,
}: EmployeeDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();

  const [positions, setPositions] = useState<Position[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state - chức danh lưu positionId
  const [employeeName, setEmployeeName] = useState(employee.employeeName);
  const [phone, setPhone] = useState(employee.phoneNumber);
  const [positionId, setPositionId] = useState('');
  const [email, setEmail] = useState(employee.email || '');
  const [notes, setNotes] = useState(employee.notes || '');
  const [area, setArea] = useState('');
  const [ward, setWard] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoadingPositions(true);
      try {
        const [posRes, wardsRes, areasRes, empDetail] = await Promise.all([
          getPositions(),
          getWards(),
          getAreas(),
          getEmployeeById(employee.id),
        ]);
        setPositions(posRes);
        setWards(wardsRes);
        setAreas(areasRes);

        // Update employee state from fresh data
        setEmployeeName(empDetail.employeeName);
        setPhone(empDetail.phoneNumber);
        setEmail(empDetail.email || '');
        setNotes(empDetail.notes || '');

        // Match job title
        const matched = posRes.find((p) => p.positionName === empDetail.jobTitle);
        setPositionId(matched?.positionId ?? (posRes[0]?.positionId ?? ''));

        // Match area and ward
        if (empDetail.area) setArea(empDetail.area);
        else if (areasRes.length > 0) setArea(areasRes[0].areaId);

        if (empDetail.ward) setWard(empDetail.ward);
        else if (wardsRes.length > 0) setWard(wardsRes[0].wardId);

      } catch {
        showToast('Thao tác không thành công', 'error');
      } finally {
        setLoadingPositions(false);
      }
    };
    if (employee?.id) {
      fetchData();
    }
  }, [employee.id, showToast]);

  const handleUpdate = async () => {
    if (!employeeName.trim() || !email.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    if (!positionId) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: UpdateEmployeePayload = {
        fullName: employeeName,
        positionId,
        phoneNumber: phone,
        email: email.trim() || undefined,
        note: notes,
        wardId: ward || undefined,
      };

      const updated = await updateEmployee(String(employee.id), payload);
      onSave(updated);
      showToast('Thao tác thành công', 'success');
      onClose();
    } catch (err: any) {
      showToast('Thao tác không thành công', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa nhân viên',
      'Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác.',
      async () => {
        try {
          await deleteEmployee(String(employee.id));
          onDelete(employee.id);
          showToast('Thao tác thành công', 'success');
        } catch (err: any) {
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container} style={{ maxWidth: '800px' }}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết nhân viên</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
            <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr' }}>
              <div className={styles.leftCol}>
                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Mã nhân viên</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={employee.code}
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
                      value={positionId}
                      onChange={(e) => setPositionId(e.target.value)}
                      disabled={loadingPositions}
                    >
                      {loadingPositions ? (
                        <option value="">Đang tải...</option>
                      ) : (
                        positions.map((p) => (
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
                      onChange={(e) => setArea(e.target.value)}
                      disabled={loadingPositions}
                    >
                      {loadingPositions ? (
                        <option value="">Đang tải...</option>
                      ) : (
                        areas.map((a) => (
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
                      disabled={loadingPositions}
                    >
                      {loadingPositions ? (
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
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDeleteClick}>
            Xóa
          </button>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Bỏ qua
            </button>
            <button className={styles.saveBtn} onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className={styles.spinner} /> : 'Cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
