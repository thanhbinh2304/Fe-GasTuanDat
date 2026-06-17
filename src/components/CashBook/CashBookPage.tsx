'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package, ChevronLeft, ChevronDown } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import CashBookDetailModal from './CashBookDetailModal';
import styles from './CashBookPage.module.css';
import { getCashBookEntries, CashBookEntry, CashBookFilterParams } from '@/services/cashBookService';

const PAGE_SIZE = 15;

export default function CashBookPage() {
  const [cashBooks, setCashBooks] = useState<CashBookEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedCashBook, setSelectedCashBook] = useState<CashBookEntry | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchCashBooks = async (params: CashBookFilterParams) => {
    setLoading(true);
    try {
      const res = await getCashBookEntries(params);
      setCashBooks(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching cashBooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashBooks({ page, pageSize: PAGE_SIZE, keyword, startDate, endDate, paymentMethod });
  }, [page, keyword, startDate, endDate, paymentMethod]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setKeyword(val);
      setPage(1);
    }, 500);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setPage(1);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
    setPage(1);
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Thời gian</span>
            </div>

            <div className={styles.dateFilterGroup}>
              <div className={styles.dateField}>
                <label>Từ ngày</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className={styles.dateField}>
                <label>Đến ngày</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.sideDivider} />

          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Hình thức</span>
            </div>
            <select className={styles.sideSelect} value={paymentMethod} onChange={handlePaymentMethodChange}>
              <option value="">Tất cả</option>
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm theo mã phiếu, người nộp/nhận..."
                className={styles.searchInput}
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className={styles.tableCard}>
            {loading ? (
              <div className={styles.stateBox}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th className={styles.thCode}>Mã phiếu</th>
                      <th className={styles.thTime}>Thời gian</th>
                      <th className={styles.thName}>Người nộp/nhận</th>
                      <th className={styles.thMethod}>Hình thức</th>
                      <th className={styles.thValue} style={{ textAlign: 'right' }}>Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashBooks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyRow}>
                          <Package size={32} className={styles.emptyIcon} />
                          <span>Không có sổ quỹ nào</span>
                        </td>
                      </tr>
                    ) : (
                      cashBooks.map((t) => (
                        <tr key={t.id} className={styles.tr} onClick={() => setSelectedCashBook(t)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{t.code}</span></td>
                          <td className={styles.tdTime}>{t.createdAt}</td>
                          <td className={styles.tdName}>{t.personName}</td>
                          <td className={styles.tdMethod}>{t.paymentMethod}</td>
                          <td className={styles.tdValue} style={{ textAlign: 'right' }}>
                            {new Intl.NumberFormat('vi-VN').format(t.value)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className={styles.tableFooter}>
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                  </div>
                  <div className={styles.footerInfo}>
                    Hiển thị {(page - 1) * PAGE_SIZE + (cashBooks.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} sổ quỹ
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedCashBook && (
        <CashBookDetailModal
          cashBook={selectedCashBook}
          onClose={() => setSelectedCashBook(null)}
        />
      )}
    </div>
  );
}
