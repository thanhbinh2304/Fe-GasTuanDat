'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './SupplierDetailModal.module.css';
import { Supplier, createSupplier } from '@/services/supplierService';
import { getWards, getAreas, Ward, Area } from '@/services/employeeService';

interface AddSupplierModalProps {
  onClose: () => void;
  onSave: (newSupplier: Supplier) => void;
}

export default function AddSupplierModal({ onClose, onSave }: AddSupplierModalProps) {
  const { showToast } = useToastConfirm();
  const [isSaving, setIsSaving] = useState(false);

  const [supplierName, setSupplierName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [area, setArea] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');

  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    Promise.all([getAreas(), getWards()])
      .then(([areasRes, wardsRes]) => {
        setAreas(areasRes);
        setWards(wardsRes);
      })
      .catch(console.error);
  }, []);

  const handleSaveClick = async () => {
    if (!supplierName.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const newSupplier = await createSupplier({
        fullName: supplierName,
        phoneNumber: phone,
        email: email.trim() || undefined,
        note: notes,
        wardId: ward || undefined,
        address: address.trim() || undefined,
      });
      onSave(newSupplier);
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
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới nhà cung cấp</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className={styles.field}>
              <label className={styles.label}>Mã nhà cung cấp</label>
              <input
                type="text"
                className={styles.input}
                value=""
                disabled
                placeholder="Mã tạo tự động"
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
                placeholder="Nhập tên nhà cung cấp"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điện thoại</label>
              <input
                type="text"
                className={styles.input}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Nhập email"
              />
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Ghi chú</label>
              <textarea
                className={styles.textarea}
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Nhập ghi chú"
              />
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Số nợ</label>
              <input
                type="text"
                className={styles.input}
                value="0"
                disabled={true}
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
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

        <div className={styles.footer}>
          <div className={styles.footerRight} style={{ marginLeft: 'auto' }}>
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
