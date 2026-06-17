'use client';
import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Check, CheckDetail, createCheck } from '@/services/checkService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import { Product } from '@/services/productService';
import { getStocks, FilterItem } from '@/services/productFilterService';
import { getEmployees, Employee } from '@/services/employeeService';
import styles from './CheckDetailModal.module.css';

interface AddCheckModalProps {
  onClose: () => void;
  onSave: (newCheck: Check) => void;
}

export default function AddCheckModal({
  onClose,
  onSave,
}: AddCheckModalProps) {
  const { showToast } = useToastConfirm();

  const [code, setCode] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [notes, setNotes] = useState('');
  
  const [stock, setStock] = useState<FilterItem | null>(null);
  
  const [stocks, setStocks] = useState<FilterItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [items, setItems] = useState<CheckDetail[]>([]);

  useEffect(() => {
    getStocks().then(data => setStocks(data));
    getEmployees({}).then(res => {
      setEmployees(res.data);
      // Auto-set the first employee as creator
      if (res.data.length > 0) {
        setCreatorId(String(res.data[0].id));
        setCreatorName(res.data[0].employeeName || '');
      }
    });
  }, []);

  // When stock changes, update systemQuantity for all existing items
  const handleStockChange = (newStock: FilterItem | null) => {
    setStock(newStock);
    // Re-compute stock quantities from the product's warehouses per the new stockId
    setItems(prev => prev.map(item => {
      // systemQuantity will be refreshed when user re-adds the product,
      // but we reset to 0 if stock changes so user is aware
      return { ...item, systemQuantity: 0 };
    }));
  };

  const handleSelectProduct = (product: Product) => {
    // Get stock qty for the selected warehouse
    const warehouse = stock
      ? product.warehouses?.find(w => w.stockId === stock.id)
      : undefined;
    const sysQty = warehouse ? warehouse.quantity : (product.stock ?? 0);

    setItems((prev) => {
      const exists = prev.find((i) => i.productId === product.productId);
      if (exists) {
        return prev.map((i) => (i.productId === product.productId ? { ...i, actualQuantity: i.actualQuantity + 1 } : i));
      }
      return [...prev, { id: '', productId: product.productId || '', productName: product.name, systemQuantity: sysQty, actualQuantity: sysQty }];
    });
  };

  const handleSave = async () => {
    if (!stock || items.length === 0) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    
    const newCheck: Check = {
      stockTakeCode: code,
      employeeId: creatorId,
      employeeName: creatorName,
      note: notes,
      stockTakeDate: new Date().toISOString(),
      stockId: stock?.id,
      stockName: stock?.name,
      details: items,
    };
    
    try {
      const res = await createCheck(newCheck);
      onSave(res);
      showToast('Thao tác thành công', 'success');
    } catch (err: any) {
      showToast('Thao tác không thành công', 'error');
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới phiếu kiểm</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid}>
            <div className={styles.leftCol}>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã kiểm hàng</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Mã tự động"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Người tạo</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={creatorName}
                    disabled
                    placeholder="Tự động"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Kho kiểm <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                <select
                  className={styles.select}
                  value={stock?.id || ''}
                  onChange={(e) => {
                    const s = stocks.find((opt) => opt.id === e.target.value) || null;
                    handleStockChange(s);
                  }}
                >
                  <option value="">Chọn kho</option>
                  {stocks.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ghi chú</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Hàng hóa kiểm <span style={{ color: 'var(--danger-color)' }}>*</span></div>
                  <div className={styles.cardSub}>Danh sách mặt hàng được kiểm tra</div>
                </div>
                <div className={styles.cardBody}>
                  {/* Allow all products, but show stock qty per the selected kho kiểm */}
                  <ProductSearchInput onSelect={handleSelectProduct} stockId={stock?.id} allowZeroStock={true} />
                  
                  {items.map((item) => (
                    <div key={item.productId} className={styles.cardRow}>
                      <input
                        type="text"
                        className={styles.cardSelect}
                        value={item.productName}
                        readOnly
                      />
                      <input
                        type="number"
                        className={styles.cardInput}
                        value={item.systemQuantity}
                        readOnly
                        title="Tồn kho hệ thống (theo kho kiểm)"
                        style={{ backgroundColor: '#f5f5f5', color: '#888' }}
                      />
                      <input
                        type="number"
                        min="0"
                        className={styles.cardInput}
                        value={item.actualQuantity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setItems(items.map(i => i.productId === item.productId ? { ...i, actualQuantity: val < 0 ? 0 : val } : i));
                        }}
                        title="Tồn kho thực tế"
                      />
                      <button className={styles.rowDeleteBtn} onClick={() => setItems(items.filter(i => i.productId !== item.productId))}>
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
