'use client';
import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { ExportReceipt } from '@/services/exportReceiptService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import { Product } from '@/services/productService';
import styles from './ExportReceiptDetailModal.module.css';

interface AddExportReceiptModalProps {
  onClose: () => void;
  onSave: (newOrder: ExportReceipt) => void;
}

export default function AddExportReceiptModal({
  onClose,
  onSave,
}: AddExportReceiptModalProps) {
  const { showToast } = useToastConfirm();

  const [code, setCode] = useState('');
  const [creator, setCreator] = useState('Admin');
  const [notes, setNotes] = useState('');
  const [branch, setBranch] = useState('Kho trung tâm');
  const [customerCode, setCustomerCode] = useState('NCC001');
  const [customerName, setCustomerName] = useState('Công ty TNHH Cung Cấp');
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

  const handleSave = () => {
    if (!creator.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    
    const totalAmount = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const finalAmount = totalAmount - discount;
    
    const newOrder: ExportReceipt = {
      id: Date.now(),
      code: code || `PXH00${Math.floor(Math.random() * 1000)}`,
      creator,
      notes,
      branch,
      customerCode,
      customerName,
      totalAmount,
      discount,
      finalAmount,
      paidAmount,
      createdAt: new Date().toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
    };
    
    onSave(newOrder);
    showToast('Thao tác thành công', 'success');
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới phiếu xuất hàng</h2>
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
                  <label className={styles.label}>Mã KH</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Tên KH</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Kho xuất</label>
                <select
                  className={styles.select}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="Kho trung tâm">Kho trung tâm</option>
                  <option value="Chi nhánh 1">Chi nhánh 1</option>
                  <option value="Chi nhánh 2">Chi nhánh 2</option>
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
                  <div className={styles.cardSub}>Danh sách mặt hàng đặt xuất</div>
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
