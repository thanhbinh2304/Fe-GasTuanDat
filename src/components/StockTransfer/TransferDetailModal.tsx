'use client';
import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Transfer, TransferDetail } from '@/services/transferService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import ProductSearchInput from './ProductSearchInput';
import { Product } from '@/services/productService';
import { getStocks, FilterItem } from '@/services/productFilterService';
import { getEmployees, Employee } from '@/services/employeeService';
import styles from './TransferDetailModal.module.css';

interface TransferDetailModalProps {
  transfer: Transfer;
  onClose: () => void;
  onSave: (updated: Transfer) => void;
  onDelete: (id: string) => void;
}

export default function TransferDetailModal({
  transfer,
  onClose,
  onSave,
  onDelete,
}: TransferDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();

  const [code, setCode] = useState(transfer.transferCode || '');
  const [creatorId, setCreatorId] = useState(transfer.employeeId || '');
  const [notes, setNotes] = useState(transfer.note || '');
  const [fromStock, setFromStock] = useState<FilterItem | null>(null);
  const [toStock, setToStock] = useState<FilterItem | null>(null);
  const [items, setItems] = useState<TransferDetail[]>(transfer.details || []);
  const [stocks, setStocks] = useState<FilterItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    void getStocks().then((data) => {
      setStocks(data);
      if (transfer.fromStockId) {
        const fs = data.find((s) => s.id === transfer.fromStockId);
        setFromStock(fs || null);
      }
      if (transfer.toStockId) {
        const ts = data.find((s) => s.id === transfer.toStockId);
        setToStock(ts || null);
      }
    }).catch(console.error);

    void getEmployees().then((res) => {
      setEmployees(res.data);
      if (!transfer.employeeId && res.data.length > 0) {
        setCreatorId(String(res.data[0].id));
      }
    }).catch(console.error);
  }, [transfer.fromStockId, transfer.toStockId]);

  const handleSelectProduct = (product: Product) => {
    const maxQty = product.stock ?? 999;
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === product.productId);
      if (exists) {
        return prev.map((i) =>
          i.productId === product.productId ? { ...i, quantity: Math.min((i.quantity || 0) + 1, maxQty) } : i
        );
      }
      return [...prev, { id: '', productId: product.productId || '', productName: product.name, quantity: 1, maxQuantity: maxQty, warehouses: product.warehouses }];
    });
  };

  const handleUpdate = () => {
    if (!fromStock || !toStock || items.length === 0) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    const selectedEmp = employees.find(e => String(e.id) === creatorId);
    onSave({
      ...transfer,
      transferCode: code,
      employeeId: creatorId,
      employeeName: selectedEmp?.employeeName || '',
      note: notes,
      fromStockName: fromStock?.name,
      fromStockId: fromStock?.id,
      toStockName: toStock?.name,
      toStockId: toStock?.id,
      details: items,
    });
    showToast('Thao tác thành công', 'success');
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa phiếu điều chuyển',
      'Bạn có chắc chắn muốn xóa không ?',
      async () => {
        try {
          if (transfer.transferId) await Promise.resolve(onDelete(transfer.transferId));
          showToast('Thao tác thành công', 'success');
        } catch (error) {
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };

  const getStockOptions = () => {
    return stocks.map((s) => ({ value: s.id, label: s.name }));
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Chi tiết điều chuyển</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid}>
            <div className={styles.leftCol}>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã điều chuyển</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={code || ''}
                    onChange={(e) => setCode(e.target.value)}
                    disabled
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Người tạo</label>
                  <select
                    className={styles.select}
                    value={creatorId}
                    onChange={(e) => setCreatorId(e.target.value)}
                    disabled
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.employeeName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Từ kho <span className={styles.required}>*</span></label>
                  <select
                    className={styles.select}
                    value={fromStock?.id || ''}
                    onChange={(e) => {
                      const stock = stocks.find((s) => s.id === e.target.value) || null;
                      setFromStock(stock);
                      if (stock) {
                        setItems(prev => prev.map(item => {
                          const w = item.warehouses?.find((wh: any) => String(wh.stockId) === String(stock.id));
                          const maxQty = w ? w.quantity : 0;
                          return { ...item, maxQuantity: maxQty, quantity: Math.min(item.quantity, maxQty) };
                        }).filter(i => i.maxQuantity && i.maxQuantity > 0));
                      } else {
                        setItems([]);
                      }
                    }}
                  >
                    <option value="">Chọn kho</option>
                    {getStockOptions().map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={toStock?.id === opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Đến kho <span className={styles.required}>*</span></label>
                  <select
                    className={styles.select}
                    value={toStock?.id || ''}
                    onChange={(e) => {
                      const stock = stocks.find((s) => s.id === e.target.value) || null;
                      setToStock(stock);
                    }}
                  >
                    <option value="">Chọn kho</option>
                    {getStockOptions().map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={fromStock?.id === opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
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
                  <div className={styles.cardTitle}>Hàng hóa điều chuyển <span className={styles.required}>*</span></div>
                  <div className={styles.cardSub}>Danh sách mặt hàng được chuyển</div>
                </div>
                <div className={styles.cardBody}>
                  <ProductSearchInput onSelect={handleSelectProduct} stockId={fromStock?.id} />

                  {items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className={styles.cardRow}>
                      <input
                        type="text"
                        className={styles.cardSelect}
                        value={item.productName || ''}
                        readOnly
                      />
                      <input
                        type="number"
                        min="1"
                        max={item.maxQuantity}
                        className={styles.cardInput}
                        value={item.quantity || ''}
                        onChange={(e) => {
                          let val = Number(e.target.value);
                          if (val < 1) val = 1;
                          if (item.maxQuantity !== undefined && val > item.maxQuantity) val = item.maxQuantity;
                          const newItems = items.map((i, j) =>
                            j === idx ? { ...i, quantity: val } : i
                          );
                          setItems(newItems);
                        }}
                        style={{ alignSelf: 'flex-start' }}
                      />

                      <button
                        className={styles.rowDeleteBtn}
                        onClick={() => setItems(items.filter((_, j) => j !== idx))}
                      >
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