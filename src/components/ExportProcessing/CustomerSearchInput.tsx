'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { getCustomers, Customer } from '@/services/customerService';
import { getGasBooks } from '@/services/gasBookService';
import styles from '@/components/StockTransfer/ProductSearchInput.module.css';
import customerStyles from './CustomerSearchInput.module.css';

interface CustomerSearchInputProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  onDetailClick?: (customer: Customer) => void;
}

export default function CustomerSearchInput({ value, onChange, onDetailClick }: CustomerSearchInputProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
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
        const [cusRes, gasRes] = await Promise.all([
          getCustomers({ keyword, pageSize: 6 }),
          getGasBooks({ keyword, pageSize: 6 })
        ]);
        const combined = [...cusRes.data, ...gasRes.data].slice(0, 10);
        setResults(combined);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelect = (s: Customer) => {
    onChange(s);
    setKeyword('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setKeyword('');
  };

  if (value) {
    return (
      <div className={customerStyles.selectedBox}>
        <div 
          className={customerStyles.selectedInfo} 
          onClick={() => onDetailClick && onDetailClick(value)}
          style={{ cursor: onDetailClick ? 'pointer' : 'default' }}
        >
          <span className={customerStyles.selectedName}>{value.customerName}</span>
          <span className={customerStyles.selectedMeta}>{value.code} · {value.phone ? `SĐT: ${value.phone}` : 'Chưa có SĐT'} · Nợ: {new Intl.NumberFormat('vi-VN').format(value.debt || 0)}</span>
        </div>
        <X size={16} className={customerStyles.clearBtn} onClick={handleClear} />
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
          placeholder="Tìm khách hàng (F4)"
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
                <div className={styles.itemName}>{s.customerName}</div>
                <div className={styles.itemCode}>{s.code} · {s.phone}</div>
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
          <div className={styles.dropdownEmpty}>Không tìm thấy khách hàng</div>
        </div>
      )}
    </div>
  );
}
