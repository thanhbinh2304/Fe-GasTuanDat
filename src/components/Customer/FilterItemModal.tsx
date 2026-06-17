import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './FilterItemModal.module.css';

export type FilterItemType = 'category' | 'branch' | 'priceBook' | 'attribute' | 'jobTitle';
export type FilterItemMode = 'create' | 'edit';

interface FilterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { code: string; name: string }) => void;
  onDelete?: () => void;
  type: FilterItemType;
  mode: FilterItemMode;
  initialData?: { code: string; name: string } | null;
}

const TYPE_CONFIG = {
  category: {
    titleCreate: 'Thêm nhóm khách hàng',
    titleEdit: 'Cập nhật nhóm khách hàng',
    codeLabel: 'Mã nhóm khách hàng',
    nameLabel: 'Tên nhóm khách hàng',
  },
  branch: {
    titleCreate: 'Thêm kho',
    titleEdit: 'Cập nhật kho',
    codeLabel: 'Mã kho',
    nameLabel: 'Tên kho',
  },
  priceBook: {
    titleCreate: 'Thêm bảng giá',
    titleEdit: 'Cập nhật bảng giá',
    codeLabel: 'Mã bảng giá',
    nameLabel: 'Tên bảng giá',
  },
  attribute: {
    titleCreate: 'Thêm thuộc tính',
    titleEdit: 'Cập nhật thuộc tính',
    codeLabel: 'Mã thuộc tính',
    nameLabel: 'Tên thuộc tính',
  },
  jobTitle: {
    titleCreate: 'Thêm chức danh',
    titleEdit: 'Cập nhật chức danh',
    codeLabel: 'Mã chức danh',
    nameLabel: 'Tên chức danh',
  },
};

export default function FilterItemModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  type,
  mode,
  initialData,
}: FilterItemModalProps) {
  const { showToast, showConfirm } = useToastConfirm();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setCode(initialData.code);
        setName(initialData.name);
      } else {
        setCode('');
        setName('');
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const config = TYPE_CONFIG[type];

  const handleSave = () => {
    if (!name.trim() || (type !== 'category' && type !== 'jobTitle' && !code.trim())) {
      showToast('Thao tác không thành công', 'error');
      return; // Bắt buộc cả mã và tên (trừ nhóm khách hàng, chức danh không cần mã)
    }
    try {
      onSave({ code, name });
      showToast('Thao tác thành công', 'success');
      onClose();
    } catch (e) {
      showToast('Thao tác không thành công', 'error');
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa thông tin',
      'Bạn có chắc chắn muốn xóa không ? Hành động này sẽ ảnh hưởng đến các dữ liệu liên quan',
      async () => {
        try {
          if (onDelete) await Promise.resolve(onDelete());
          showToast('Thao tác thành công', 'success');
          onClose();
        } catch (error) {
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{mode === 'create' ? config.titleCreate : config.titleEdit}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {type !== 'category' && type !== 'jobTitle' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {config.codeLabel} <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã"
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {config.nameLabel} <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên"
              autoFocus
            />
          </div>
        </div>

        <div className={styles.footer}>
          {mode === 'edit' ? (
            <>
              <button className={styles.btnDanger} onClick={handleDeleteClick}>
                Xóa
              </button>
              <div className={styles.footerRight}>
                <button className={styles.btnCancel} onClick={onClose}>
                  Bỏ qua
                </button>
                <button className={styles.btnSave} onClick={handleSave}>
                  Cập nhật
                </button>
              </div>
            </>
          ) : (
            <div className={styles.footerRightOnly}>
              <button className={styles.btnCancel} onClick={onClose}>
                Bỏ qua
              </button>
              <button className={styles.btnSave} onClick={handleSave}>
                Lưu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
