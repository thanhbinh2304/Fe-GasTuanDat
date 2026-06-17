'use client';
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product } from '@/services/productService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './ProductDetailModal.module.css'; // Shared CSS

import { FilterItem } from '@/services/productFilterService';

interface AddProductModalProps {
  onClose: () => void;
  onSave: (newProduct: Product) => void;
  existingProducts?: Product[];
  categories?: FilterItem[];
  stocks?: FilterItem[];
  priceBooks?: FilterItem[];
  attributes?: FilterItem[];
}

const getNextCode = (catName: string, existingList: Product[] = []) => {
  if (!catName) return '';
  const prefix = catName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (char) => (char === 'đ' ? 'd' : 'D'))
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  let maxNum = 0;
  existingList.forEach((p) => {
    if (p.code && p.code.startsWith(prefix)) {
      const numPart = p.code.slice(prefix.length);
      if (/^\d+$/.test(numPart)) {
        maxNum = Math.max(maxNum, parseInt(numPart, 10));
      }
    }
  });
  const nextNum = maxNum + 1;
  const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  return `${prefix}${numStr}`;
};

export default function AddProductModal({
  onClose,
  onSave,
  existingProducts = [],
  categories = [],
  stocks = [],
  priceBooks = [],
  attributes = [],
}: AddProductModalProps) {
  const { showToast } = useToastConfirm();

  // Dynamic dropdown lists from props or fallback to standard values
  const categoryOptions = categories.length > 0
    ? categories.map(c => c.name).filter(name => name !== 'Tất cả')
    : ['Bình gas', 'Bếp gas', 'Bếp từ', 'Phụ kiện gas', 'Máy làm sữa hạt', 'Máy xay sinh tố', 'Nồi chiên không dầu', 'Nồi áp suất'];

  const warehouseOptions = stocks.length > 0
    ? stocks.map(s => s.name)
    : ['Kho phụ', 'Kho chính', 'Kho trung chuyển'];

  const priceTierOptions = priceBooks.length > 0
    ? priceBooks.map(pb => pb.name)
    : ['Giá bán lẻ', 'Giá bán buôn', 'Giá đại lý'];

  const attributeOptions = attributes.length > 0
    ? attributes.map(a => a.name)
    : ['Màu sắc', 'Dung tích', 'Kích thước', 'Chất liệu'];

  // Left column states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(''); 
  const [unit, setUnit] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);

  // Right column states
  const [warehouses, setWarehouses] = useState<Array<{ id: string | number; name: string; quantity: number }>>([]);
  const [priceTiers, setPriceTiers] = useState<Array<{ id: string | number; name: string; price: number }>>([]);
  const [attributesList, setAttributesList] = useState<Array<{ id: string | number; name: string; value: string }>>([]);

  // Handle warehouse changes
  const handleWarehouseNameChange = (id: string | number, val: string) => {
    setWarehouses(warehouses.map((w) => (w.id === id ? { ...w, name: val } : w)));
  };
  const handleWarehouseQtyChange = (id: string | number, val: number) => {
    setWarehouses(warehouses.map((w) => (w.id === id ? { ...w, quantity: val } : w)));
  };
  const addWarehouse = () => {
    const selectedNames = warehouses.map((w) => w.name);
    const unselected = warehouseOptions.find((opt) => !selectedNames.includes(opt));
    if (unselected) {
      const nextId = warehouses.length > 0 ? Math.max(...warehouses.map((w) => Number(w.id))) + 1 : 1;
      setWarehouses([...warehouses, { id: nextId, name: unselected, quantity: 0 }]);
    }
  };
  const deleteWarehouse = (id: string | number) => {
    setWarehouses(warehouses.filter((w) => w.id !== id));
  };

  // Handle price changes
  const handlePriceNameChange = (id: string | number, val: string) => {
    setPriceTiers(priceTiers.map((p) => (p.id === id ? { ...p, name: val } : p)));
  };
  const handlePriceValChange = (id: string | number, val: number) => {
    setPriceTiers(priceTiers.map((p) => (p.id === id ? { ...p, price: val } : p)));
  };
  const addPriceTier = () => {
    const selectedNames = priceTiers.map((p) => p.name);
    const unselected = priceTierOptions.find((opt) => !selectedNames.includes(opt));
    if (unselected) {
      const nextId = priceTiers.length > 0 ? Math.max(...priceTiers.map((p) => Number(p.id))) + 1 : 1;
      setPriceTiers([...priceTiers, { id: nextId, name: unselected, price: 0 }]);
    }
  };
  const deletePriceTier = (id: string | number) => {
    setPriceTiers(priceTiers.filter((p) => p.id !== id));
  };

  // Handle attribute changes
  const handleAttrNameChange = (id: string | number, val: string) => {
    setAttributesList(attributesList.map((a) => (a.id === id ? { ...a, name: val } : a)));
  };
  const handleAttrValChange = (id: string | number, val: string) => {
    setAttributesList(attributesList.map((a) => (a.id === id ? { ...a, value: val } : a)));
  };
  const addAttribute = () => {
    const selectedNames = attributesList.map((a) => a.name);
    const unselected = attributeOptions.find((opt) => !selectedNames.includes(opt));
    if (unselected) {
      const nextId = attributesList.length > 0 ? Math.max(...attributesList.map((a) => Number(a.id))) + 1 : 1;
      setAttributesList([...attributesList, { id: nextId, name: unselected, value: '' }]);
    }
  };
  const deleteAttribute = (id: string | number) => {
    setAttributesList(attributesList.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    if (!category || !name.trim() || costPrice === null || costPrice === undefined || costPrice < 0) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    try {
      const totalStock = warehouses.reduce((sum, w) => sum + w.quantity, 0);
      const salePrice = priceTiers[0]?.price ?? 0;

      const matchingCategory = categories.find((c) => c.name === category);

      const mappedWarehouses = warehouses.map((w) => {
        const matchingStock = stocks.find((s) => s.name === w.name);
        return {
          stockId: matchingStock?.id || '',
          name: w.name,
          quantity: w.quantity,
        };
      }).filter(w => w.stockId !== '');

      const mappedPriceTiers = priceTiers.map((p) => {
        const matchingPriceBook = priceBooks.find((pb) => pb.name === p.name);
        return {
          priceListId: matchingPriceBook?.id || '',
          priceListName: p.name,
          price: p.price,
        };
      }).filter(p => p.priceListId !== '');

      const mappedAttributesList = attributesList.map((a) => {
        const matchingAttr = attributes.find((attr) => attr.name === a.name);
        return {
          attributeId: matchingAttr?.id || '',
          attributeName: a.name,
          value: a.value,
        };
      }).filter(a => a.attributeId !== '');

      const newProduct: Product = {
        id: Date.now() + Math.random(),
        code: code.trim(),
        name: name.trim(),
        category,
        categoryId: matchingCategory?.id,
        unit: unit.trim() || undefined,
        costPrice,
        notes: notes.trim() || undefined,
        salePrice,
        stock: totalStock,
        customerOrder: 0,
        createdAt: new Date().toISOString(),
        warehouses: mappedWarehouses,
        priceTiers: mappedPriceTiers,
        attributesList: mappedAttributesList,
      };
      onSave(newProduct);
      showToast('Thao tác thành công', 'success');
    } catch (e) {
      showToast('Thao tác không thành công', 'error');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    if (!isCodeManuallyEdited || !code.trim()) {
      const nextCode = getNextCode(newCategory, existingProducts);
      setCode(nextCode);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    setIsCodeManuallyEdited(true);
  };

  const isWarehouseLimitReached = warehouses.length >= warehouseOptions.length;
  const isPriceLimitReached = priceTiers.length >= priceTierOptions.length;
  const isAttrLimitReached = attributesList.length >= attributeOptions.length;

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thêm mới hàng hóa</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.infoGrid}>
            {/* Left Column (Inputs) */}
            <div className={styles.leftCol}>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Mã hàng hóa</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Nhập mã hàng hóa"
                    value={code}
                    onChange={handleCodeChange}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Nhóm hàng hóa <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <select
                    className={styles.select}
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Chọn nhóm hàng hóa</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tên hàng hóa <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Nhập tên hàng hóa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Đơn vị</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Nhập đơn vị"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Giá vốn <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                  <input
                    type="text"
                    className={styles.input}
                    value={costPrice.toLocaleString('vi-VN')}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      setCostPrice(Number(rawValue));
                    }}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ghi chú</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="Nhập ghi chú"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column (Cards) */}
            <div className={styles.rightCol}>
              {/* 1. Tồn kho */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Tồn kho</div>
                  <div className={styles.cardSub}>Quản lý số lượng tồn kho theo kho bãi</div>
                </div>
                <div className={styles.cardBody}>
                  {warehouses.map((w) => {
                    const availableOptions = warehouseOptions.filter(
                      (opt) => opt === w.name || !warehouses.map((item) => item.name).includes(opt)
                    );
                    return (
                      <div key={w.id} className={styles.cardRow}>
                        <select
                          className={styles.cardSelect}
                          value={w.name}
                          onChange={(e) => handleWarehouseNameChange(w.id, e.target.value)}
                        >
                          {availableOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0"
                          className={styles.cardInput}
                          value={w.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleWarehouseQtyChange(w.id, val < 0 ? 0 : val);
                          }}
                        />
                        <button className={styles.rowDeleteBtn} onClick={() => deleteWarehouse(w.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    className={styles.addBtn}
                    onClick={addWarehouse}
                    disabled={isWarehouseLimitReached}
                  >
                    <Plus size={14} />
                    Thêm tồn kho
                  </button>
                </div>
              </div>

              {/* 2. Bảng giá */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Bảng giá</div>
                  <div className={styles.cardSub}>Thiết lập các mức giá cho từng nhóm khách hàng</div>
                </div>
                <div className={styles.cardBody}>
                  {priceTiers.map((p) => {
                    const availableOptions = priceTierOptions.filter(
                      (opt) => opt === p.name || !priceTiers.map((item) => item.name).includes(opt)
                    );
                    return (
                      <div key={p.id} className={styles.cardRow}>
                        <select
                          className={styles.cardSelect}
                          value={p.name}
                          onChange={(e) => handlePriceNameChange(p.id, e.target.value)}
                        >
                          {availableOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className={styles.cardInput}
                          value={p.price === 0 ? '' : p.price.toLocaleString('vi-VN')}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            handlePriceValChange(p.id, Number(rawValue));
                          }}
                        />
                        <button className={styles.rowDeleteBtn} onClick={() => deletePriceTier(p.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    className={styles.addBtn}
                    onClick={addPriceTier}
                    disabled={isPriceLimitReached}
                  >
                    <Plus size={14} />
                    Thêm bảng giá
                  </button>
                </div>
              </div>

              {/* 3. Thuộc tính */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Thuộc tính</div>
                  <div className={styles.cardSub}>Thêm đặc điểm như hương vị, dung tích, màu sắc</div>
                </div>
                <div className={styles.cardBody}>
                  {attributesList.map((a) => {
                    const availableOptions = attributeOptions.filter(
                      (opt) => opt === a.name || !attributesList.map((item) => item.name).includes(opt)
                    );
                    return (
                      <div key={a.id} className={styles.cardRow}>
                        <select
                          className={styles.cardSelect}
                          value={a.name}
                          onChange={(e) => handleAttrNameChange(a.id, e.target.value)}
                        >
                          {availableOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className={styles.cardInput}
                          value={a.value}
                          placeholder="Giá trị"
                          onChange={(e) => handleAttrValChange(a.id, e.target.value)}
                        />
                        <button className={styles.rowDeleteBtn} onClick={() => deleteAttribute(a.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    className={styles.addBtn}
                    onClick={addAttribute}
                    disabled={isAttrLimitReached}
                  >
                    <Plus size={14} />
                    Thêm thuộc tính
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
