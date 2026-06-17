'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit, Save } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './GasBookDetailModal.module.css';
import { getWards, getAreas, Ward, Area } from '@/services/employeeService';
import { getCustomerGroups, CustomerGroup, updateGasBook, getGasBookHistory, getGasBookDetailedHistory, GasBookHistory, GasBookDetailedHistory, deleteGasBook, GasBook } from '@/services/gasBookService';

interface GasBookDetailModalProps {
  gasBook: GasBook;
  onClose: () => void;
  onSave: (updated: GasBook) => void;
  onDelete: (id: string | number) => void;
}

export default function GasBookDetailModal({
  gasBook,
  onClose,
  onSave,
  onDelete,
}: GasBookDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'detailed_history'>('info');
  const [formData, setFormData] = useState<GasBook>(gasBook);


  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [history, setHistory] = useState<GasBookHistory[]>([]);
  const [detailedHistory, setDetailedHistory] = useState<GasBookDetailedHistory[]>([]);

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
    if (activeTab === 'history') {
      getGasBookHistory(String(gasBook.id)).then(res => setHistory(res.data)).catch(console.error);
    } else if (activeTab === 'detailed_history') {
      getGasBookDetailedHistory(String(gasBook.id)).then(res => setDetailedHistory(res.data)).catch(console.error);
    }
  }, [activeTab, gasBook.id]);

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
    if (!formData.code.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    try {
      await updateGasBook(String(gasBook.id), {
        gasBookCode: formData.code?.trim() || undefined,
        fullName: formData.customerName,
        phoneNumber: formData.phone,
        email: formData.email,
        note: formData.notes,
        wardId: formData.ward || undefined,
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
      'Xóa sổ gas',
      `Bạn có chắc chắn muốn xóa sổ gas ${gasBook.code} không?`,
      async () => {
        try {
          await deleteGasBook(String(gasBook.id));
          onDelete(gasBook.id);
          showToast('Thao tác thành công', 'success');
          onClose();
        } catch (error) {
          console.error('Failed to delete gas book', error);
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };



  const detailedHistoryRowSpans = React.useMemo(() => {
    const spans: { [key: number]: number } = {};
    let i = 0;
    while (i < detailedHistory.length) {
      let count = 1;
      for (let j = i + 1; j < detailedHistory.length; j++) {
        if (
          detailedHistory[j].doc === detailedHistory[i].doc &&
          detailedHistory[j].time === detailedHistory[i].time &&
          detailedHistory[j].note === detailedHistory[i].note
        ) {
          count++;
          spans[j] = 0;
        } else {
          break;
        }
      }
      spans[i] = count;
      i += count;
    }
    return spans;
  }, []);

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết sổ gas</h2>
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
          <button
            className={`${styles.tab} ${activeTab === 'detailed_history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('detailed_history')}
          >
            Lịch sử chi tiết
          </button>
        </div>

        {activeTab === 'info' && (
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
                  name="area"
                  className={styles.select}
                  value={formData.area || ''}
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
                  value={formData.ward || ''}
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
        )}

        {activeTab === 'history' && (
          <div className={styles.body} style={{ padding: 0 }}>
            <div className={styles.stockCardContainer}>
              <div className={styles.stockTableWrapper}>
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
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td><a href="#" className={styles.link}>{item.doc}</a></td>
                        <td>{item.time}</td>
                        <td style={{ color: item.value > 0 ? 'inherit' : 'var(--danger-color)' }}>
                          {new Intl.NumberFormat('vi-VN').format(item.value)}
                        </td>
                        <td>{new Intl.NumberFormat('vi-VN').format(item.debt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.pagination}>
                <div className={styles.paginationControls}>
                  <button disabled>Trước</button>
                  <button disabled>Sau</button>
                </div>
                <span>Hiển thị 1 - {history.length} trên tổng {history.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detailed_history' && (
          <div className={styles.body} style={{ padding: 0 }}>
            <div className={styles.stockCardContainer}>
              <div className={styles.stockTableWrapper}>
                <table className={styles.stockTable}>
                  <thead>
                    <tr>
                      <th>Chứng từ</th>
                      <th>Thời gian</th>
                      <th>Tên hàng hóa</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedHistory.map((item, index) => {
                      const rowSpan = detailedHistoryRowSpans[index];
                      if (rowSpan === 0) {
                        return (
                          <tr key={item.id}>
                            <td>{item.productName}</td>
                            <td>{item.quantity}</td>
                            <td>{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                            <td>{new Intl.NumberFormat('vi-VN').format(item.total)}</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={item.id}>
                          <td rowSpan={rowSpan} style={{ verticalAlign: 'top' }}><a href="#" className={styles.link}>{item.doc}</a></td>
                          <td rowSpan={rowSpan} style={{ verticalAlign: 'top' }}>{item.time}</td>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                          <td>{new Intl.NumberFormat('vi-VN').format(item.total)}</td>
                          <td rowSpan={rowSpan} style={{ verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{item.note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className={styles.pagination}>
                <div className={styles.paginationControls}>
                  <button disabled>Trước</button>
                  <button disabled>Sau</button>
                </div>
                <span>Hiển thị 1 - {detailedHistory.length} trên tổng {detailedHistory.length}</span>
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
