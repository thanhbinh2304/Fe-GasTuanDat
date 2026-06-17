import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import { Area, Ward, getAreas, getWards } from '@/services/productFilterService';
import styles from './FilterItemModal.module.css';

export type FilterItemType = 'category' | 'branch' | 'priceBook' | 'attribute';
export type FilterItemMode = 'create' | 'edit';

interface FilterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { code: string; name: string; wardId?: string }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  type: FilterItemType;
  mode: FilterItemMode;
  initialData?: { id?: string; code: string; name: string; wardId?: string } | null;
}

const TYPE_CONFIG = {
  category: {
    titleCreate: 'Thêm nhóm hàng hóa',
    titleEdit: 'Cập nhật nhóm hàng hóa',
    codeLabel: 'Mã nhóm hàng hóa',
    nameLabel: 'Tên nhóm hàng hóa',
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
  const [areas, setAreas] = useState<Area[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedWardId, setSelectedWardId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        if (mode === 'edit' && initialData) {
          setCode(initialData.code);
          setName(initialData.name);
        } else {
          setCode('');
          setName('');
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    if (isOpen && type === 'branch') {
      const loadWardsAndAreas = async () => {
        try {
          const [areaList, wardList] = await Promise.all([getAreas(), getWards()]);
          setAreas(areaList);
          setWards(wardList);

          if (mode === 'edit' && initialData?.wardId) {
            setSelectedWardId(initialData.wardId);
            const foundWard = wardList.find(w => w.wardId === initialData.wardId);
            if (foundWard?.area) {
              setSelectedAreaId(foundWard.area.areaId);
            }
          } else {
            setSelectedAreaId('');
            setSelectedWardId('');
          }
        } catch (err) {
          console.error('Error loading areas and wards:', err);
        }
      };
      void loadWardsAndAreas();
    }
  }, [isOpen, type, mode, initialData]);

  if (!isOpen) return null;

  const config = TYPE_CONFIG[type];

  const filteredWards = selectedAreaId
    ? wards.filter((w) => w.area?.areaId === selectedAreaId)
    : wards;

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Thao tác không thành công', 'error');
      return;
    }
    try {
      await Promise.resolve(onSave({
        code,
        name,
        wardId: type === 'branch' ? selectedWardId || undefined : undefined
      }));
      showToast('Thao tác thành công', 'success');
      onClose();
    } catch {
      showToast('Thao tác không thành công', 'error');
    }
  };

  const handleDeleteClick = async () => {
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
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {config.codeLabel}
            </label>
            <input
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Tự động"
              disabled
            />
          </div>
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
          {type === 'branch' && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Khu vực <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={selectedAreaId}
                  onChange={(e) => {
                    setSelectedAreaId(e.target.value);
                    setSelectedWardId('');
                  }}
                >
                  <option value="">Chọn khu vực...</option>
                  {areas.map((a) => (
                    <option key={a.areaId} value={a.areaId}>
                      {a.areaName}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phường/xã <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={selectedWardId}
                  onChange={(e) => setSelectedWardId(e.target.value)}
                >
                  <option value="">Chọn phường/xã...</option>
                  {filteredWards.map((w) => (
                    <option key={w.wardId} value={w.wardId}>
                      {w.wardName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
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
