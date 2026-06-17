'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit, Save } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './CustomerDetailModal.module.css';
import { getWards, getAreas, Ward, Area } from '@/services/employeeService';
import { getCustomerGroups, CustomerGroup } from '@/services/gasBookService';
import { updateCustomer, deleteCustomer, getCustomerById, getCustomerHistory, CustomerHistory, Customer } from '@/services/customerService';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onSave: (updated: Customer) => void;
  onDelete: (id: string | number) => void;
}

export default function CustomerDetailModal({
  customer,
  onClose,
  onSave,
  onDelete,
}: CustomerDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [formData, setFormData] = useState<Customer>(customer);

  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [history, setHistory] = useState<CustomerHistory[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      } catch (error) {
        console.error('Failed to fetch options', error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        const data = await getCustomerById(customer.id);
        setFormData(data);
      } catch (error) {
        console.error('Failed to fetch customer detail', error);
      }
    };
    if (customer?.id) {
      fetchCustomerDetail();
    }
  }, [customer.id]);

  useEffect(() => {
    if (activeTab === 'history' && customer?.id) {
      setHistoryLoading(true);
      getCustomerHistory(String(customer.id), { page: 1, limit: 20 })
        .then(res => {
          setHistory(res.data);
          setHistoryTotal(res.total);
        })
        .catch(console.error)
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab, customer.id]);

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
      await updateCustomer(String(customer.id), {
        fullName: formData.customerName,
        phoneNumber: formData.phone,
        email: formData.email?.trim() || undefined,
        note: formData.notes,
        wardId: formData.wardId || undefined,
        address: formData.address?.trim() || undefined,
        customerGroupId: formData.customerGroupId || undefined,
      });
      onSave(formData);
      showToast('Thao tác thành công', 'success');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Thao tác không thành công', 'error');
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa khách hàng',
      `Bạn có chắc chắn muốn xóa khách hàng ${customer.code} không?`,
      async () => {
        try {
          await deleteCustomer(String(customer.id));
          onDelete(customer.id);
          showToast('Thao tác thành công', 'success');
          onClose();
        } catch (error) {
          console.error(error);
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết khách hàng</h2>
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
                <label className={styles.label}>Mã khách hàng</label>
                <input
                  type="text"
                  name="code"
                  className={styles.input}
                  value={formData.code}
                  disabled={true}
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
        ) : (
          <div className={styles.body} style={{ padding: 0 }}>
            <div className={styles.stockCardContainer}>
              <div className={styles.stockTableWrapper}>
                {historyLoading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Đang tải lịch sử...</div>
                ) : (
                  <table className={styles.stockTable}>
                    <thead>
                      <tr>
                        <th>Chứng từ</th>
                        <th>Thời gian</th>
                        <th>Giá trị</th>
                        <th>Dư nợ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>Không có lịch sử giao dịch</td></tr>
                      ) : (
                        history.map((item) => (
                          <tr key={item.id}>
                            <td><a href="#" className={styles.link}>{item.doc}</a></td>
                            <td>{item.time}</td>
                            <td style={{ color: item.value >= 0 ? 'inherit' : 'var(--danger-color)' }}>
                              {new Intl.NumberFormat('vi-VN').format(item.value)}
                            </td>
                            <td>{new Intl.NumberFormat('vi-VN').format(item.debt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              <div className={styles.pagination}>
                <div className={styles.paginationControls}>
                  <button disabled>Trước</button>
                  <button disabled>Sau</button>
                </div>
                <span>Hiển thị {history.length} trên tổng {historyTotal}</span>
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
            <button className={styles.saveBtn} onClick={handleSaveClick}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
