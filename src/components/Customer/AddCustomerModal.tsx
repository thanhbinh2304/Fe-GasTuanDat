'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './CustomerDetailModal.module.css';
import { getWards, getAreas, Ward, Area } from '@/services/employeeService';
import { getCustomerGroups, CustomerGroup } from '@/services/gasBookService';
import { createCustomer, Customer } from '@/services/customerService';

interface AddCustomerModalProps {
  onClose: () => void;
  onSave: (newBook: Customer) => void;
}

export default function AddCustomerModal({ onClose, onSave }: AddCustomerModalProps) {
  const { showToast } = useToastConfirm();
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    code: '',
    customerName: '',
    customerGroup: 'Khách lẻ',
    points: 0,
    phone: '',
    email: '',
    address: '',
    area: '',
    areaId: '',
    ward: '',
    wardId: '',
    notes: '',
    debt: 0,
    customerGroupId: ''
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);

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
      const newBook = await createCustomer({
        fullName: formData.customerName,
        email: formData.email?.trim() || undefined,
        phoneNumber: formData.phone,
        note: formData.notes,
        wardId: formData.wardId || undefined,
        address: formData.address?.trim() || undefined,
        customerGroupId: formData.customerGroupId || undefined,
      });

      onSave(newBook);
      showToast('Thao tác thành công', 'success');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Thao tác không thành công', 'error');
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới khách hàng</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className={styles.field}>
              <label className={styles.label}>Mã khách hàng</label>
              <input
                type="text"
                name="code"
                className={styles.input}
                value={formData.code}
                disabled={true}
                placeholder="Mã tạo tự động"
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
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
                value={formData.customerGroupId || ''}
                onChange={handleChange}
              >
                <option value="">Chọn nhóm khách hàng</option>
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
              <label className={styles.label}>Số nợ</label>
              <input
                type="text"
                className={styles.input}
                value={new Intl.NumberFormat('vi-VN').format(formData.debt || 0)}
                disabled={true}
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: (formData.debt || 0) > 0 ? 'red' : 'inherit', fontWeight: 'bold' }}
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
                className={styles.select}
                value={formData.areaId || ''}
                onChange={(e) => {
                  const newAreaId = e.target.value;
                  const selectedArea = areas.find(a => a.areaId === newAreaId);
                  setFormData(prev => ({
                    ...prev,
                    areaId: newAreaId,
                    area: selectedArea ? selectedArea.areaName : '',
                    wardId: '',
                    ward: ''
                  }));
                }}
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
                className={styles.select}
                value={formData.wardId || ''}
                onChange={(e) => {
                  const newWardId = e.target.value;
                  const selectedWard = wards.find(w => w.wardId === newWardId);
                  setFormData(prev => ({
                    ...prev,
                    wardId: newWardId,
                    ward: selectedWard ? selectedWard.wardName : ''
                  }));
                }}
              >
                <option value="">Chọn phường/xã...</option>
                {wards
                  .filter(w => !formData.areaId || w.areaId === formData.areaId)
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
            <button className={styles.saveBtn} onClick={handleSaveClick}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
