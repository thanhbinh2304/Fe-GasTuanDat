'use client';
import React, { useState } from 'react';
import { X, Trash2, Save, Plus } from 'lucide-react';
import { Promotion, updatePromotion, deletePromotion } from '@/services/promotionService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import ProductSearchInput from '@/components/StockTransfer/ProductSearchInput';
import { Product } from '@/services/productService';
import styles from './PromotionDetailModal.module.css';

interface PromotionDetailModalProps {
  promotion: Promotion;
  onClose: () => void;
  onSave?: (updatedPromo: Promotion) => void;
  onDelete?: (promoId: string) => void;
  readOnly?: boolean;
}

export default function PromotionDetailModal({
  promotion,
  onClose,
  onSave,
  onDelete,
  readOnly = false,
}: PromotionDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();

  const [code, setCode] = useState(promotion.code);
  const [name, setName] = useState(promotion.name);
  const [startDate, setStartDate] = useState(promotion.startDate);
  const [endDate, setEndDate] = useState(promotion.endDate);
  const [minOrderValue, setMinOrderValue] = useState<number>(promotion.minOrderValue);
  const [discountValue, setDiscountValue] = useState<number>(promotion.discountValue);
  const [notes, setNotes] = useState(promotion.notes);

  const [items, setItems] = useState<{ id: string | number; name: string; quantity: number }[]>(
    (promotion.giftItems || []).map((i: any) => ({
      ...i,
      quantity: i.quantity ?? i.qty ?? 1
    }))
  );

  const handleSelectProduct = (product: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, quantity: 1 }];
    });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        promotionCode: code.trim() || undefined,
        promotionName: name,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minOrderValue,
        discountValue,
        note: notes,
        giftItems: items.map((i) => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
        })),
      };

      const updatedPromo = await updatePromotion(promotion.id, payload);
      onSave?.(updatedPromo);
      showToast('Thao tác thành công', 'success');
    } catch (e) {
      showToast('Thao tác không thành công', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa chương trình khuyến mại',
      'Bạn có chắc chắn muốn xóa chương trình này không ? Hành động này không thể hoàn tác.',
      async () => {
        try {
          await deletePromotion(promotion.id);
          onDelete?.(promotion.id);
          showToast('Thao tác thành công', 'success');
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
          <h2 className={styles.headerTitle}>Chi tiết khuyến mại</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
            <div className={styles.infoGrid}>
              <div className={styles.leftCol}>
                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Mã khuyến mại</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Tên khuyến mại <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                    <input
                      type="text"
                      className={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Ngày bắt đầu <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                    <input
                      type="date"
                      className={styles.input}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Ngày kết thúc <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                    <input
                      type="date"
                      className={styles.input}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Giá trị tối thiểu</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={minOrderValue === 0 ? '' : minOrderValue.toLocaleString('vi-VN')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setMinOrderValue(Number(rawValue));
                      }}
                    />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Giá trị giảm giá</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={discountValue === 0 ? '' : discountValue.toLocaleString('vi-VN')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setDiscountValue(Number(rawValue));
                      }}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Ghi chú</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.rightCol}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>Hàng hóa tặng</div>
                    <div className={styles.cardSub}>Danh sách mặt hàng được tặng kèm</div>
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
                          min="1"
                          className={styles.cardInput}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const newItems = items.map(i => i.id === item.id ? { ...i, quantity: val < 1 ? 1 : val } : i);
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
          <button className={styles.deleteBtn} onClick={handleDeleteClick} disabled={readOnly} style={{ opacity: readOnly ? 0.5 : 1, cursor: readOnly ? 'not-allowed' : 'pointer' }}>
            Xóa
          </button>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={readOnly} style={{ opacity: readOnly ? 0.5 : 1, cursor: readOnly ? 'not-allowed' : 'pointer' }}>
              Bỏ qua
            </button>
            <button className={styles.saveBtn} onClick={handleUpdate} disabled={readOnly || isSaving} style={{ opacity: readOnly || isSaving ? 0.5 : 1, cursor: readOnly || isSaving ? 'not-allowed' : 'pointer' }}>
              {isSaving ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
