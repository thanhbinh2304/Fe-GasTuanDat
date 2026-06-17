'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { getEmployees, Employee } from '@/services/employeeService';
import styles from '@/components/StockTransfer/ProductSearchInput.module.css';
import customerStyles from './CustomerSearchInput.module.css';

interface EmployeeSearchInputProps {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
  onDetailClick?: (employee: Employee) => void;
}

export default function EmployeeSearchInput({ value, onChange, onDetailClick }: EmployeeSearchInputProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
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
        const res = await getEmployees({ keyword, pageSize: 6 });
        setResults(res.data);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelect = (s: Employee) => {
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
          <span className={customerStyles.selectedName}>{value.employeeName}</span>
          <span className={customerStyles.selectedMeta}>{value.code} · {value.phoneNumber}</span>
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
          placeholder="Tìm nhân viên..."
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
                <div className={styles.itemName}>{s.employeeName}</div>
                <div className={styles.itemCode}>{s.code} · {s.phoneNumber}</div>
              </div>
              <div className={styles.itemStock} style={{ color: '#006ce6' }}>
                {s.jobTitle}
              </div>
            </div>
          ))}
        </div>
      )}
      {isOpen && results.length === 0 && !isLoading && keyword.trim() && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownEmpty}>Không tìm thấy nhân viên</div>
        </div>
      )}
    </div>
  );
}
