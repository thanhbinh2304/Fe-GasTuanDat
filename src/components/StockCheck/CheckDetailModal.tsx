'use client';
import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Check, CheckDetail, updateCheck, deleteCheck, getCheckById } from '@/services/checkService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import { Product } from '@/services/productService';
import { getStocks, FilterItem } from '@/services/productFilterService';
import { getEmployees, Employee } from '@/services/employeeService';
import styles from './CheckDetailModal.module.css';

interface CheckDetailModalProps {
  check: Check;
  onClose: () => void;
  onSave: (updatedCheck: Check) => void;
  onDelete: (checkId: string) => void;
}

export default function CheckDetailModal({
  check,
  onClose,
  onSave,
  onDelete,
}: CheckDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();

  const [creatorId, setCreatorId] = useState(check.employeeId || '');
  const [creatorName, setCreatorName] = useState(check.employeeName || '');
  const [notes, setNotes] = useState(check.note || '');
  const [stockId, setStockId] = useState(check.stockId || '');
  
  const [stocks, setStocks] = useState<FilterItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [items, setItems] = useState<CheckDetail[]>(check.details || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStocks().then(setStocks);
    getEmployees({}).then(res => {
      setEmployees(res.data);
      // Auto-set creator from system if not already set
      if (!check.employeeId && res.data.length > 0) {
        setCreatorId(String(res.data[0].id));
        setCreatorName(res.data[0].employeeName || '');
      } else if (check.employeeId) {
        const emp = res.data.find(e => String(e.id) === check.employeeId);
        if (emp) setCreatorName(emp.employeeName || '');
      }
    });
    
    // Fetch full details if not present in the list response
    if (check.stockTakeId) {
      setLoading(true);
      getCheckById(check.stockTakeId).then(fullCheck => {
        if (fullCheck.details) {
          setItems(fullCheck.details);
        }
      }).finally(() => setLoading(false));
    }
  }, [check.stockTakeId]);

  // When stock changes, reset systemQuantity so user sees 0 and knows to re-add
  const handleStockChange = (newStockId: string) => {
    setStockId(newStockId);
    setItems(prev => prev.map(item => ({ ...item, systemQuantity: 0 })));
  };

  const handleSelectProduct = (product: Product) => {
    // Get qty for selected warehouse, allow all products regardless of stock
    const selectedStock = stocks.find(s => s.id === stockId);
    const warehouse = selectedStock
      ? product.warehouses?.find(w => w.stockId === stockId)
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

  const handleUpdate = async () => {
    if (!stockId || items.length === 0) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    try {
      const selectedStock = stocks.find(s => s.id === stockId);

      const updatedCheck: Check = {
        ...check,
        employeeId: creatorId,
        employeeName: creatorName,
        note: notes,
        stockId: stockId,
        stockName: selectedStock?.name,
        details: items,
      };
      const res = await updateCheck(check.stockTakeId as string, updatedCheck);
      onSave(res);
      showToast('Thao tác thành công', 'success');
    } catch (e: any) {
      showToast('Thao tác không thành công', 'error');
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa phiếu kiểm',
      'Bạn có chắc chắn muốn xóa phiếu kiểm này không ? Hành động này không thể hoàn tác.',
      async () => {
        if (check.stockTakeId) {
          try {
            await deleteCheck(check.stockTakeId);
            onDelete(check.stockTakeId);
            showToast('Thao tác thành công', 'success');
          } catch (e: any) {
            showToast('Thao tác không thành công', 'error');
          }
        }
      }
    );
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết phiếu kiểm</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
          ) : (
            <div className={styles.infoGrid}>
              <div className={styles.leftCol}>
                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Mã kiểm hàng</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={check.stockTakeCode}
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
                    value={stockId}
                    onChange={(e) => handleStockChange(e.target.value)}
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
                    <ProductSearchInput onSelect={handleSelectProduct} stockId={stockId} allowZeroStock={true} />
                    
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
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDeleteClick}>
            Xóa
          </button>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Bỏ qua
            </button>
            <button className={styles.saveBtn} onClick={handleUpdate}>
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
