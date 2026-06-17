'use client';
import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { PurchaseOrder } from '@/services/purchaseOrderService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './PurchaseOrderDetailModal.module.css';

interface PurchaseOrderDetailModalProps {
  order: PurchaseOrder;
  onClose: () => void;
  onSave: (updatedOrder: PurchaseOrder) => void;
  onDelete: (orderId: string | number) => void;
}

export default function PurchaseOrderDetailModal({
  order,
  onClose,
  onSave,
  onDelete,
}: PurchaseOrderDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const { getPurchaseDetailsByOrderId } = await import('@/services/purchaseOrderService');
      const details = await getPurchaseDetailsByOrderId(order.id as string);
      
      const mappedItems = details.map(d => ({
        id: d.productId,
        code: d.productCode,
        name: d.productName,
        qty: d.quantity,
        price: d.purchasePrice,
        total: d.total,
        stock: 0,
        unit: d.unit || 'Cái'
      }));

      const orderWithItems = {
        ...order,
        orderType: 'Dathang',
        items: mappedItems
      };
      
      localStorage.setItem('pendingOrderToProcess', JSON.stringify(orderWithItems));
      window.open('/xu-ly-nhap-hang', '_blank');
      onClose();
    } catch (error) {
      console.error('Error fetching details:', error);
      showToast('Thao tác không thành công', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa phiếu đặt hàng',
      'Bạn có chắc chắn muốn xóa phiếu đặt hàng này không ? Hành động này không thể hoàn tác.',
      async () => {
        try {
          await Promise.resolve(onDelete(order.id));
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
          <h2 className={styles.headerTitle}>Chi tiết phiếu đặt hàng nhập</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body} style={{ padding: '40px 20px', textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>
          Bạn muốn thao tác gì với thông tin phiếu đặt hàng nhập <strong>{order.purchaseCode}</strong>?
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
              Mở phiếu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
