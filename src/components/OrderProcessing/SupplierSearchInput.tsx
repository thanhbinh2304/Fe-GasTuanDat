'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { getSuppliers, Supplier } from '@/services/supplierService';
import styles from '@/components/StockTransfer/ProductSearchInput.module.css';
import supplierStyles from './SupplierSearchInput.module.css';

interface SupplierSearchInputProps {
  value: Supplier | null;
  onChange: (supplier: Supplier | null) => void;
  onDetailClick?: (supplier: Supplier) => void;
}

export default function SupplierSearchInput({ value, onChange, onDetailClick }: SupplierSearchInputProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Supplier[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getSuppliers({ keyword, pageSize: 6 });
        setResults(res.data);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelect = (s: Supplier) => {
    onChange(s);
    setKeyword('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setKeyword('');
  };

  // If a supplier is already selected, show their info instead of the search box
  if (value) {
    return (
      <div className={supplierStyles.selectedBox}>
        <div 
          className={supplierStyles.selectedInfo}
          onClick={() => onDetailClick && onDetailClick(value)}
          style={{ cursor: onDetailClick ? 'pointer' : 'default' }}
        >
          <span className={supplierStyles.selectedName}>{value.code} - {value.supplierName}</span>
          <span className={supplierStyles.selectedMeta}>{value.phone ? `SĐT: ${value.phone}` : 'Chưa có SĐT'} - Nợ: {new Intl.NumberFormat('vi-VN').format(value.debt || 0)}</span>
        </div>
        <X size={16} className={supplierStyles.clearBtn} onClick={handleClear} />
      </div>
    );
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.inputWrapper}>
        <Search size={14} className={styles.icon} />
        <input
          type="text"
          className={styles.input}
          placeholder="Tìm nhà cung cấp (F4)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => keyword.trim() && setIsOpen(true)}
        />
        {isLoading && <Loader2 size={14} className={styles.spinner} />}
      </div>

      {isOpen && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map(s => (
            <div key={s.id} className={styles.dropdownItem} onClick={() => handleSelect(s)}>
              <div className={styles.itemMain}>
                <div className={styles.itemName}>{s.code} - {s.supplierName}</div>
                <div className={styles.itemCode}>{s.phone ? `SĐT: ${s.phone}` : 'Chưa có SĐT'}</div>
              </div>
              <div className={styles.itemStock} style={{ color: s.debt > 0 ? '#dc3545' : '#28a745' }}>
                {s.debt > 0 ? `Nợ: ${new Intl.NumberFormat('vi-VN').format(s.debt)}` : 'Không nợ'}
              </div>
            </div>
          ))}
        </div>
      )}
      {isOpen && results.length === 0 && !isLoading && keyword.trim() && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownEmpty}>Không tìm thấy nhà cung cấp</div>
        </div>
      )}
    </div>
  );
}
