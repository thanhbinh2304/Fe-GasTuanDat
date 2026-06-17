'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { getProducts, Product, formatProductName } from '@/services/productService';
import styles from './ProductSearchInput.module.css';

interface ProductSearchInputProps {
  onSelect: (product: Product) => void;
  placeholder?: string;
  stockId?: string;
  allowZeroStock?: boolean;
  disabled?: boolean;
}

export default function ProductSearchInput({ onSelect, placeholder = "Tìm hàng hóa theo mã hoặc tên", stockId, allowZeroStock = false, disabled = false }: ProductSearchInputProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getProducts({ keyword, pageSize: 50 }); // Increased pageSize to ensure enough items after filtering
        // Calculate stock for the specific warehouse if stockId is provided
        const mappedData = res.data.map(p => {
          const formattedName = formatProductName(p);
          if (stockId && p.warehouses) {
            const w = p.warehouses.find(wh => String(wh.stockId) === String(stockId));
            return { ...p, name: formattedName, stock: w ? w.quantity : 0 };
          }
          return { ...p, name: formattedName };
        });
        setResults(mappedData);
        setIsOpen(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, stockId]);

  const handleSelect = (product: Product) => {
    onSelect(product);
    setKeyword('');
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.inputWrapper}>
        <Search size={14} className={styles.icon} />
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={keyword}
          disabled={disabled}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => !disabled && keyword.trim() && setIsOpen(true)}
          style={disabled ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
        />
        {isLoading && <Loader2 size={14} className={styles.spinner} />}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map(p => {
            const isOutOfStock = !allowZeroStock && p.stock <= 0;
            return (
              <div 
                key={p.id} 
                className={`${styles.dropdownItem} ${isOutOfStock ? styles.disabledItem : ''}`} 
                onClick={() => !isOutOfStock && handleSelect(p)}
                style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <div className={styles.itemMain}>
                  <div className={styles.itemName}>{(p as any).displayName || p.name}</div>
                  <div className={styles.itemCode}>{p.code}</div>
                </div>
                <div className={styles.itemStock} style={p.stock <= 0 ? { color: 'var(--danger-color)' } : {}}>Tồn: {p.stock}</div>
              </div>
            );
          })}
        </div>
      )}
      {isOpen && results.length === 0 && !isLoading && keyword.trim() && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownEmpty}>Không tìm thấy hàng hóa</div>
        </div>
      )}
    </div>
  );
}
