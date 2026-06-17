'use client';
import React, { useState } from 'react';
import { X, Trash2, Save, Plus } from 'lucide-react';
import { DebtReceipt, DebtItem, createDebtReceipt, updateDebtReceipt, deleteDebtReceipt } from '@/services/debtService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import CustomerSearchInput from '@/components/ExportProcessing/CustomerSearchInput';
import { Customer } from '@/services/customerService';
import { Product } from '@/services/productService';
import styles from './DebtDetailModal.module.css';

interface DebtDetailModalProps {
  debt?: DebtReceipt;
  isAddMode?: boolean;
  onClose: () => void;
  onSave?: (updatedDebt: DebtReceipt) => void;
  onDelete?: (debtId: number) => void;
}

export default function DebtDetailModal({
  debt,
  isAddMode = false,
  onClose,
  onSave,
  onDelete,
}: DebtDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();

  const [code, setCode] = useState(debt?.code || 'Mã tự động');
  const [customer, setCustomer] = useState<Customer | null>(
    debt ? { 
      id: 0, 
      code: debt.customerCode, 
      customerName: debt.customerName, 
      customerGroup: '',
      email: '',
      address: '',
      area: '',
      ward: '',
      notes: '',
      phone: '', 
      debt: 0, 
      points: 0 
    } as Customer : null
  );
  const [debtDate, setDebtDate] = useState(debt?.debtDate || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(debt?.dueDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(debt?.status || 'Chưa trả nợ');
  const [notes, setNotes] = useState(debt?.notes || '');
  const [globalPriceList, setGlobalPriceList] = useState('Giá chung');

  const [items, setItems] = useState<DebtItem[]>(debt?.items || []);

  const handleSelectProduct = (product: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.productCode === product.code);
      if (exists) {
        return prev.map((i) => (i.productCode === product.code ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { 
        id: Date.now(), 
        productId: product.id,
        productCode: product.code, 
        productName: product.name, 
        quantity: 1, 
        price: product.salePrice || 0,
        priceList: globalPriceList 
      }];
    });
  };

  const handleUpdateItem = (id: string | number, field: keyof DebtItem, value: any) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleRemoveItem = (id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!customer) {
      showToast('Vui lòng chọn khách hàng', 'error');
      return;
    }
    if (!debtDate) {
      showToast('Vui lòng chọn ngày nợ', 'error');
      return;
    }
    if (!dueDate) {
      showToast('Vui lòng chọn ngày hẹn nợ', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Vui lòng chọn ít nhất một hàng hóa nợ', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        code: code === 'Mã tự động' ? undefined : code,
        customerCode: customer.code,
        debtDate,
        dueDate,
        status: status as 'Chưa trả nợ' | 'Đã trả nợ',
        notes,
        items: items.map(i => ({
          productId: i.productId || i.id, // Support old mocked items vs new
          quantity: i.quantity,
          price: i.price,
          priceList: i.priceList
        })),
      };

      let newDebt;
      if (isAddMode) {
        newDebt = await createDebtReceipt(payload);
      } else {
        newDebt = await updateDebtReceipt(debt!.id, payload);
      }
      onSave?.(newDebt);
      showToast('Thao tác thành công', 'success');
    } catch (e) {
      showToast('Thao tác không thành công', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa phiếu nợ',
      'Bạn có chắc chắn muốn xóa phiếu nợ này không ? Hành động này không thể hoàn tác.',
      async () => {
        try {
          if (debt) {
            await deleteDebtReceipt(debt.id);
            onDelete?.(Number(debt.id));
          }
          showToast('Thao tác thành công', 'success');
          onClose();
        } catch (error) {
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>{isAddMode ? 'Thêm mới phiếu nợ' : 'Chi tiết phiếu nợ'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid}>
            <div className={styles.leftCol}>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã phiếu nợ</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    readOnly={!isAddMode}
                    style={{ backgroundColor: !isAddMode ? '#f5f5f5' : 'white' }}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Khách hàng <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <CustomerSearchInput
                    value={customer}
                    onChange={(c) => setCustomer(c)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Ngày nợ <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <input
                    type="date"
                    className={styles.input}
                    value={debtDate}
                    onChange={(e) => setDebtDate(e.target.value)}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Ngày hẹn nợ <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <input
                    type="date"
                    className={styles.input}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Trạng thái</label>
                  <select 
                    className={styles.input} 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as 'Chưa trả nợ' | 'Đã trả nợ')}
                  >
                    <option value="Chưa trả nợ">Chưa trả nợ</option>
                    <option value="Đã trả nợ">Đã trả nợ</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ghi chú</label>
                <textarea
                  className={styles.input}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Hàng hóa nợ</div>
                  <div className={styles.cardSub}>Danh sách mặt hàng nợ</div>
                </div>
                <div className={styles.cardBody}>
                  <ProductSearchInput onSelect={handleSelectProduct} />
                  
                  <div style={{ marginBottom: '8px' }}>
                    <select 
                      className={styles.cardSelect} 
                      value={globalPriceList}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGlobalPriceList(val);
                        setItems(items.map(item => ({ ...item, priceList: val })));
                      }}
                      style={{ maxWidth: '150px' }}
                    >
                      <option value="Giá chung">Giá chung</option>
                      <option value="Giá sỉ">Giá sỉ</option>
                      <option value="Giá đại lý">Giá đại lý</option>
                    </select>
                  </div>
                  
                  {items.map((item) => (
                    <div key={item.id} className={styles.cardRow} style={{ flexWrap: 'wrap', gap: '8px', padding: '12px 0' }}>
                      <input
                        type="text"
                        className={styles.cardSelect}
                        value={item.productName}
                        readOnly
                        style={{ flex: '1 1 100%' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          className={styles.cardInput}
                          value={item.quantity}
                          style={{ flex: 1 }}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleUpdateItem(item.id, 'quantity', val < 1 ? 1 : val);
                          }}
                        />
                        <input
                          type="text"
                          className={styles.cardInput}
                          value={item.price === 0 ? '' : item.price.toLocaleString('vi-VN')}
                          style={{ flex: 1 }}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            handleUpdateItem(item.id, 'price', Number(rawValue));
                          }}
                        />
                        <button className={styles.rowDeleteBtn} onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-gray)', fontSize: '13px', padding: '20px 0' }}>
                      Chưa có hàng hóa nào
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {!isAddMode ? (
            <button className={styles.deleteBtn} onClick={handleDeleteClick}>
              Xóa
            </button>
          ) : (
            <div style={{ width: '60px' }}></div>
          )}
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>Bỏ qua</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : (isAddMode ? 'Lưu' : 'Cập nhật')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
