'use client';
import React, { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { Product } from '@/services/productService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';
import styles from './ProductDetailModal.module.css';

import { FilterItem } from '@/services/productFilterService';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  onDelete: (productId: number | string) => void;
  categories?: FilterItem[];
  stocks?: FilterItem[];
  priceBooks?: FilterItem[];
  attributes?: FilterItem[];
}


export default function ProductDetailModal({
  product,
  onClose,
  onSave,
  onDelete,
  categories = [],
  stocks = [],
  priceBooks = [],
  attributes = [],
}: ProductDetailModalProps) {
  const { showToast, showConfirm } = useToastConfirm();
  // Dynamic lists from props or fallback to defaults
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
  const [code, setCode] = useState(product.code);
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category || 'Bình gas');
  const [unit, setUnit] = useState(product.unit || '');
  const [costPrice, setCostPrice] = useState(product.costPrice);
  const [notes, setNotes] = useState(product.notes || '');

  // Right column states - loaded dynamically from backend lists if available
  const [warehouses, setWarehouses] = useState<Array<{ id: string | number; name: string; quantity: number }>>(() => {
    if (product.warehouses && product.warehouses.length > 0) {
      return product.warehouses.map((w, index) => ({
        id: index + 1,
        name: w.name,
        quantity: w.quantity,
      }));
    }
    return [];
  });

  const [priceTiers, setPriceTiers] = useState<Array<{ id: string | number; name: string; price: number }>>(() => {
    if (product.priceTiers && product.priceTiers.length > 0) {
      return product.priceTiers.map((p, index) => ({
        id: index + 1,
        name: p.priceListName,
        price: p.price,
      }));
    }
    return [];
  });

  const [attributesList, setAttributesList] = useState<Array<{ id: string | number; name: string; value: string }>>(() => {
    if (product.attributesList && product.attributesList.length > 0) {
      return product.attributesList.map((a, index) => ({
        id: index + 1,
        name: a.attributeName,
        value: a.value,
      }));
    }
    return [];
  });

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

  const handleUpdate = () => {
    if (!category || !name.trim() || costPrice === null || costPrice === undefined || costPrice < 0) {
      showToast('Thao tác không thành công', 'error');
      return;
    }

    try {
      const totalStock = warehouses.reduce((sum, w) => sum + w.quantity, 0);
      const newSalePrice = priceTiers[0]?.price ?? product.salePrice;

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

      const updatedProduct: Product = {
        ...product,
        code: code.trim(),
        name: name.trim(),
        category,
        categoryId: matchingCategory?.id,
        unit: unit.trim() || undefined,
        costPrice,
        notes: notes.trim() || undefined,
        salePrice: newSalePrice,
        stock: totalStock,
        warehouses: mappedWarehouses,
        priceTiers: mappedPriceTiers,
        attributesList: mappedAttributesList,
      };
      onSave(updatedProduct);
      showToast('Thao tác thành công', 'success');
    } catch (e) {
      showToast('Thao tác không thành công', 'error');
    }
  };

  const handleDeleteClick = () => {
    showConfirm(
      'Xóa hàng hóa',
      'Bạn có chắc chắn muốn xóa không ? Hành động này sẽ ảnh hưởng đến các dữ liệu liên quan',
      async () => {
        try {
          await Promise.resolve(onDelete(product.productId || product.id));
          showToast('Thao tác thành công', 'success');
        } catch (error) {
          showToast('Thao tác không thành công', 'error');
        }
      }
    );
  };

  const isWarehouseLimitReached = warehouses.length >= warehouseOptions.length;
  const isPriceLimitReached = priceTiers.length >= priceTierOptions.length;
  const isAttrLimitReached = attributesList.length >= attributeOptions.length;

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thông tin hàng hóa</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
            <div className={styles.infoGrid}>
              {/* Left Column */}
              <div className={styles.leftCol}>
                <div className={styles.row}>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Mã hàng hóa</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Nhóm hàng hóa <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                    <select
                      className={styles.select}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
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
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column */}
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
                            disabled
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
                            disabled
                          />
                        </div>
                      );
                    })}
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
          <button className={styles.deleteBtn} onClick={handleDeleteClick}>
            <Trash2 size={16} style={{ marginRight: '6px' }} />
            Xóa hàng hóa
          </button>
          <div className={styles.footerRight} style={{ marginLeft: 'auto' }}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Bỏ qua
            </button>
            <button className={styles.saveBtn} onClick={handleUpdate}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
