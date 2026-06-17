'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import DebtDetailModal from './DebtDetailModal';
import styles from './DebtReceiptPage.module.css';
import { getDebtReceipts, DebtReceipt, DebtFilterParams } from '@/services/debtService';

const PAGE_SIZE = 15;

export default function DebtReceiptPage() {
  const [debts, setDebts] = useState<DebtReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [dueStartDate, setDueStartDate] = useState('');
  const [dueEndDate, setDueEndDate] = useState('');

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedDebt, setSelectedDebt] = useState<DebtReceipt | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchDebts = async (params: DebtFilterParams) => {
    setLoading(true);
    try {
      const res = await getDebtReceipts(params);
      setDebts(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts({ page, pageSize: PAGE_SIZE, keyword, startDate, endDate, dueStartDate, dueEndDate });
  }, [page, keyword, startDate, endDate, dueStartDate, dueEndDate]);

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

  const handleDueStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueStartDate(e.target.value);
    setPage(1);
  };

  const handleDueEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueEndDate(e.target.value);
    setPage(1);
  };

  const handleSaveDebt = (updated: DebtReceipt) => {
    setDebts((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedDebt(null);
  };

  const handleDeleteDebt = (id: number) => {
    setDebts((prev) => prev.filter((t) => t.id !== id));
    setTotal((t) => t - 1);
    setSelectedDebt(null);
  };

  const handleCreateDebt = (newDebt: DebtReceipt) => {
    setDebts((prev) => [newDebt, ...prev]);
    setTotal((t) => t + 1);
    setIsAddModalOpen(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Ngày nợ</span>
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
              <span>Ngày hẹn nợ</span>
            </div>

            <div className={styles.dateFilterGroup}>
              <div className={styles.dateField}>
                <label>Từ ngày</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dueStartDate}
                  onChange={handleDueStartDateChange}
                />
              </div>
              <div className={styles.dateField}>
                <label>Đến ngày</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dueEndDate}
                  onChange={handleDueEndDateChange}
                />
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm theo mã phiếu, tên khách hàng..."
                className={styles.searchInput}
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.btnPrimary} onClick={() => setIsAddModalOpen(true)}>
                <Plus size={15} />
                Thêm mới
              </button>
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
                      <th>Mã phiếu nợ</th>
                      <th>Tên khách hàng</th>
                      <th>Ngày nợ</th>
                      <th>Ngày hẹn nợ</th>
                      <th>Trạng thái</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debts.length > 0 ? (
                      debts.map((d) => (
                        <tr key={d.id} className={styles.tr} onClick={() => setSelectedDebt(d)}>
                          <td className={styles.tdCode} style={{ color: 'var(--primary-color)' }}>{d.code}</td>
                          <td className={styles.tdName}>{d.customerName}</td>
                          <td>{new Date(d.debtDate).toLocaleDateString('vi-VN')}</td>
                          <td>{new Date(d.dueDate).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <span style={{
                              color: d.status === 'Chưa trả nợ' ? 'var(--danger-color)' : 'var(--success-color)',
                              fontWeight: 500
                            }}>
                              {d.status}
                            </span>
                          </td>
                          <td className={styles.tdNotes}>{d.notes}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className={styles.emptyRow}>
                          <FileText size={48} className={styles.emptyIcon} />
                          <p>Không tìm thấy phiếu nợ nào</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className={styles.tableFooter}>
                    <div className={styles.footerInfo}>
                      Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} trên tổng số {total} phiếu nợ
                    </div>
                    <div className={styles.pagination}>
                      <button
                        className={styles.pageBtn}
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className={styles.pageBtn}
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {selectedDebt && (
        <DebtDetailModal
          debt={selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onSave={handleSaveDebt}
          onDelete={handleDeleteDebt}
        />
      )}

      {isAddModalOpen && (
        <DebtDetailModal
          isAddMode
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateDebt}
        />
      )}
    </div>
  );
}
