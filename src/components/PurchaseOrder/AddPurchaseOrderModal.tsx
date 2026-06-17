'use client';
import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { PurchaseOrder } from '@/services/purchaseOrderService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import { Product } from '@/services/productService';
import styles from './PurchaseOrderDetailModal.module.css';

import { FilterItem } from '@/services/productFilterService';

interface AddPurchaseOrderModalProps {
  onClose: () => void;
  onSave: (newOrder: PurchaseOrder) => void;
  stocks?: FilterItem[];
}

export default function AddPurchaseOrderModal({
  onClose,
  onSave,
  stocks = [],
}: AddPurchaseOrderModalProps) {
  const { showToast } = useToastConfirm();

  const [code, setCode] = useState('');
  const [creator, setCreator] = useState('Admin');
  const [notes, setNotes] = useState('');
  const [branch, setBranch] = useState('');
  const [supplierCode, setSupplierCode] = useState('NCC001');
  const [supplierName, setSupplierName] = useState('Công ty TNHH Cung Cấp');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const [items, setItems] = useState<{ id: string | number; name: string; qty: number; price: number }[]>([]);

  const handleSelectProduct = (product: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, qty: 1, price: product.costPrice }];
    });
  };

  const handleSave = async () => {
    if (!creator.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    
    const totalAmount = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const finalAmount = totalAmount - discount;
    
    const payload = {
      purchaseCode: code || undefined,
      totalAmount,
      discountAmount: discount,
      paidAmount,
      note: notes,
      stockId: branch || undefined,
      // creator mapped to employeeId, etc.
    };

    try {
      const { createPurchaseOrder } = await import('@/services/purchaseOrderService');
      const newOrder = await createPurchaseOrder(payload);
      onSave(newOrder);
      showToast('Thao tác thành công', 'success');
    } catch (error) {
      console.error('Lỗi khi thêm phiếu đặt hàng:', error);
      showToast('Thao tác không thành công', 'error');
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới phiếu đặt hàng nhập</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid}>
            <div className={styles.leftCol}>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã đặt hàng <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Mã tự động"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Người tạo <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <input
                    type="text"
                    className={styles.input}
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã NCC</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Tên NCC</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Kho nhập</label>
                <select
                  className={styles.select}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">-- Chọn kho --</option>
                  {stocks.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Giảm giá</label>
                <input
                  type="number"
                  className={styles.input}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Đã thanh toán</label>
                <input
                  type="number"
                  className={styles.input}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ghi chú</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Hàng hóa</div>
                  <div className={styles.cardSub}>Danh sách mặt hàng đặt nhập</div>
                </div>
                <div className={styles.cardBody}>
                  <ProductSearchInput onSelect={handleSelectProduct} />
                  
                  {items.map((item) => (
                    <div key={item.id} className={styles.cardRow}>
                      <input
                        type="text"
                        className={styles.cardSelect}
                        value={item.name}
                        readOnly
                      />
                      <input
                        type="number"
                        className={styles.cardInput}
                        value={item.qty}
                        onChange={(e) => {
                          const newItems = items.map(i => i.id === item.id ? { ...i, qty: Number(e.target.value) } : i);
                          setItems(newItems);
                        }}
                      />
                      <button className={styles.rowDeleteBtn} onClick={() => setItems(items.filter(i => i.id !== item.id))}>
                        <Trash2 size={14} />
                      </button>
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
          <div className={styles.footerRight} style={{ marginLeft: 'auto' }}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Bỏ qua
            </button>
            <button className={styles.saveBtn} onClick={handleSave}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
