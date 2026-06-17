'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './SupplierDetailModal.module.css';
import { Supplier, updateSupplier, deleteSupplier, getSupplierById } from '@/services/supplierService';
import { getWards, getAreas, Ward, Area } from '@/services/employeeService';

interface SupplierDetailModalProps {
  supplier: Supplier;
  onClose: () => void;
  onSave: (updated: Supplier) => void;
  onDelete: (id: string | number) => void;
}

export default function SupplierDetailModal({
  supplier,
  onClose,
  onSave,
  onDelete,
}: SupplierDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [isSaving, setIsSaving] = useState(false);

  const [supplierName, setSupplierName] = useState(supplier.supplierName);
  const [phone, setPhone] = useState(supplier.phone);
  const [email, setEmail] = useState(supplier.email || '');
  const [notes, setNotes] = useState(supplier.notes || '');
  const [address, setAddress] = useState(supplier.address || '');
  const [area, setArea] = useState('');
  const [ward, setWard] = useState(supplier.wardId || '');

  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingOptions(true);
      try {
        const [areasRes, wardsRes, detail] = await Promise.all([
          getAreas(),
          getWards(),
          getSupplierById(String(supplier.id)),
        ]);
        setAreas(areasRes);
        setWards(wardsRes);

        setSupplierName(detail.supplierName);
        setPhone(detail.phone);
        setEmail(detail.email || '');
        setNotes(detail.notes || '');
        setAddress(detail.address || '');

        if (detail.wardId) {
          setWard(detail.wardId);
          const matchedWard = wardsRes.find(w => w.wardId === detail.wardId);
          if (matchedWard) setArea(matchedWard.areaId);
        }
      } catch {
        showToast('Thao tác không thành công', 'error');
      } finally {
        setLoadingOptions(false);
      }
    };
    if (supplier?.id) fetchData();
  }, [supplier.id, showToast]);

  const handleSaveClick = async () => {
    if (!supplierName.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateSupplier(String(supplier.id), {
        fullName: supplierName,
        phoneNumber: phone,
        email: email.trim() || undefined,
        note: notes,
        wardId: ward || undefined,
        address: address.trim() || undefined,
      });
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
      'Xóa nhà cung cấp',
      `Bạn có chắc chắn muốn xóa nhà cung cấp ${supplier.code} không?`,
      async () => {
        try {
          await deleteSupplier(String(supplier.id));
          onDelete(supplier.id);
          showToast('Thao tác thành công', 'success');
          onClose();
        } catch (err: any) {
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết nhà cung cấp</h2>
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
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Lịch sử
          </button>
        </div>

        {activeTab === 'info' ? (
          <div className={styles.body}>
            <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={styles.field}>
                <label className={styles.label}>Mã nhà cung cấp</label>
                <input
                  type="text"
                  className={styles.input}
                  value={supplier.code}
                  disabled
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tên nhà cung cấp <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Số điện thoại</label>
                <input
                  type="text"
                  className={styles.input}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>Ghi chú</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>Số nợ</label>
                <input
                  type="text"
                  className={styles.input}
                  value={new Intl.NumberFormat('vi-VN').format(supplier.debt || 0)}
                  disabled={true}
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: (supplier.debt || 0) > 0 ? 'red' : 'inherit', fontWeight: 'bold' }}
                />
              </div>

              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>Địa chỉ</label>
                <input
                  type="text"
                  className={styles.input}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Khu vực</label>
                <select
                  className={styles.select}
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  disabled={loadingOptions}
                >
                  <option value="">Chọn khu vực...</option>
                  {areas.map(a => (
                    <option key={a.areaId} value={a.areaId}>{a.areaName}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Phường/xã</label>
                <select
                  className={styles.select}
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  disabled={loadingOptions}
                >
                  <option value="">Chọn phường/xã...</option>
                  {wards
                    .filter(w => !area || w.areaId === area)
                    .map(w => (
                      <option key={w.wardId} value={w.wardId}>{w.wardName}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.body} style={{ padding: 0 }}>
            <div className={styles.stockCardContainer}>
              <div className={styles.stockTableWrapper}>
                <table className={styles.stockTable}>
                  <thead>
                    <tr>
                      <th>Chứng từ</th>
                      <th>Thời gian</th>
                      <th>Giá trị</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                        Không có lịch sử giao dịch
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDeleteClick}>
            Xóa
          </button>

          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Bỏ qua
            </button>
            <button className={styles.saveBtn} onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? <Loader2 size={16} /> : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
