'use client';
import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { ExportOrder } from '@/services/exportOrderService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './ExportOrderDetailModal.module.css';

interface ExportOrderDetailModalProps {
  order: ExportOrder;
  onClose: () => void;
  onSave: (updatedOrder: ExportOrder) => void;
  onDelete: (orderId: number | string) => void;
}

export default function ExportOrderDetailModal({
  order,
  onClose,
  onSave,
  onDelete,
}: ExportOrderDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();
  const handleUpdate = () => {
    const orderWithItems = {
      ...order,
      orderType: 'Dathang',
      items: order.details || []
    };
    localStorage.setItem('pendingOrderToProcess', JSON.stringify(orderWithItems));
    window.open('/xu-ly-xuat-hang', '_blank');
    onClose();
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa phiếu đặt hàng xuất',
      'Bạn có chắc chắn muốn xóa phiếu đặt hàng xuất này không ? Hành động này không thể hoàn tác.',
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
          <h2 className={styles.headerTitle}>Chi tiết phiếu đặt hàng xuất</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body} style={{ padding: '40px 20px', textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>
          Bạn muốn thao tác gì với thông tin phiếu đặt hàng xuất <strong>{order.code}</strong>?
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
