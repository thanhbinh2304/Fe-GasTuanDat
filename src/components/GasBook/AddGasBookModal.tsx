'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './GasBookDetailModal.module.css';
import { getWards, getAreas, Ward, Area } from '@/services/employeeService';
import { getCustomerGroups, CustomerGroup, createGasBook, GasBook } from '@/services/gasBookService';

interface AddGasBookModalProps {
  onClose: () => void;
  onSave: (newBook: GasBook) => void;
}

export default function AddGasBookModal({ onClose, onSave }: AddGasBookModalProps) {
  const { showToast } = useToastConfirm();
  const [isSaving, setIsSaving] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [formData, setFormData] = useState<Omit<GasBook, 'id'>>({
    code: '',
    customerName: '',
    customerGroup: '',
    customerGroupId: '',
    points: 0,
    phone: '',
    email: '',
    address: '',
    area: '',
    ward: '',
    notes: '',
    debt: 0
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [fetchedAreas, fetchedWards, fetchedGroups] = await Promise.all([
          getAreas(),
          getWards(),
          getCustomerGroups()
        ]);
        setAreas(fetchedAreas);
        setWards(fetchedWards);
        setCustomerGroups(fetchedGroups);

        if (fetchedGroups.length > 0) {
          setFormData(prev => ({
            ...prev,
            customerGroupId: fetchedGroups[0].id,
            customerGroup: fetchedGroups[0].name
          }));
        }
      } catch (error) {
        console.error('Failed to fetch options', error);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'customerGroupId') {
      const selectedGroup = customerGroups.find(g => g.id === value);
      setFormData(prev => ({
        ...prev,
        customerGroupId: value,
        customerGroup: selectedGroup ? selectedGroup.name : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveClick = async () => {
    if (!formData.customerName.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const newBook = await createGasBook({
        gasBookCode: formData.code?.trim() || undefined,
        fullName: formData.customerName,
        phoneNumber: formData.phone,
        email: formData.email,
        note: formData.notes,
        wardId: formData.ward || undefined,
        address: formData.address?.trim() || undefined,
        customerGroupId: formData.customerGroupId || undefined,
      });

      onSave(newBook);
      showToast('Thao tác thành công', 'success');
    } catch (error) {
      console.error('Failed to create gas book', error);
      showToast('Thao tác không thành công', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới sổ gas</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className={styles.field}>
              <label className={styles.label}>Mã sổ gas <span className={styles.required} style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="code"
                className={styles.input}
                value={formData.code}
                onChange={handleChange}
                placeholder="Mã tự động"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tên khách hàng <span className={styles.required} style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="customerName"
                className={styles.input}
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Nhập tên khách hàng"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nhóm khách hàng</label>
              <select
                name="customerGroupId"
                className={styles.select}
                value={formData.customerGroupId}
                onChange={handleChange}
              >
                {customerGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điểm</label>
              <input
                type="number"
                name="points"
                className={styles.input}
                value={formData.points}
                disabled={true}
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điện thoại</label>
              <input
                type="text"
                name="phone"
                className={styles.input}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email"
              />
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Ghi chú</label>
              <textarea
                name="notes"
                className={styles.textarea}
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Nhập ghi chú"
              />
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Địa chỉ</label>
              <input
                type="text"
                name="address"
                className={styles.input}
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Khu vực</label>
              <select
                name="area"
                className={styles.select}
                value={formData.area}
                onChange={handleChange}
              >
                <option value="">Chọn khu vực...</option>
                {areas.map(area => (
                  <option key={area.areaId} value={area.areaId}>{area.areaName}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phường/xã</label>
              <select
                name="ward"
                className={styles.select}
                value={formData.ward}
                onChange={handleChange}
              >
                <option value="">Chọn phường/xã...</option>
                {wards
                  .filter(ward => !formData.area || ward.areaId === formData.area)
                  .map(ward => (
                    <option key={ward.wardId} value={ward.wardId}>{ward.wardName}</option>
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
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
