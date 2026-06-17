'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Package, ChevronLeft, ChevronDown } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddCheckModal from './AddCheckModal';
import CheckDetailModal from './CheckDetailModal';
import styles from './StockCheckPage.module.css';
import { getChecks, Check, CheckFilterParams } from '@/services/checkService';
import { getStocks, FilterItem } from '@/services/productFilterService';
import { getEmployees, Employee } from '@/services/employeeService';

const PAGE_SIZE = 15;

export default function StockCheckPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stockId, setStockId] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const [stocks, setStocks] = useState<FilterItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchChecks = async (params: CheckFilterParams) => {
    setLoading(true);
    try {
      const res = await getChecks(params);
      setChecks(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecks({ page, pageSize: PAGE_SIZE, keyword, startDate, endDate, stock: stockId, employee: employeeId });
  }, [page, keyword, startDate, endDate, stockId, employeeId]);

  useEffect(() => {
    getStocks().then(setStocks);
    getEmployees({}).then(res => setEmployees(res.data));
  }, []);

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

  const handleSaveCheck = (updated: Check) => {
    setChecks((prev) => prev.map((t) => (t.stockTakeId === updated.stockTakeId ? updated : t)));
    setSelectedCheck(null);
  };

  const handleDeleteCheck = (id: string) => {
    setChecks((prev) => prev.filter((t) => t.stockTakeId !== id));
    setTotal((t) => t - 1);
    setSelectedCheck(null);
  };

  const handleCreateCheck = (newCheck: Check) => {
    setChecks((prev) => [newCheck, ...prev]);
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
              <span>Kho</span>
            </div>
            <select 
              className={styles.sideSelect}
              value={stockId}
              onChange={(e) => {
                setStockId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả kho</option>
              {stocks.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.sideDivider} />

          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Người tạo</span>
            </div>
            <select 
              className={styles.sideSelect}
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả người tạo</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.employeeName}</option>
              ))}
            </select>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm theo mã kiểm hàng..."
                className={styles.searchInput}
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.btnPrimary} onClick={() => setIsAddModalOpen(true)}>
                <Plus size={15} />
                Tạo mới
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
                      <th className={styles.thCode}>Mã kiểm hàng</th>
                      <th className={styles.thTime}>Thời gian</th>
                      <th className={styles.thBranch}>Kho</th>
                      <th className={styles.thCreator}>Người tạo</th>
                      <th className={styles.thNotes}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyRow}>
                          <Package size={32} className={styles.emptyIcon} />
                          <span>Không có phiếu kiểm nào</span>
                        </td>
                      </tr>
                    ) : (
                      checks.map((t) => (
                        <tr key={t.stockTakeId} className={styles.tr} onClick={() => setSelectedCheck(t)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{t.stockTakeCode}</span></td>
                          <td className={styles.tdTime}>{new Date(t.stockTakeDate).toLocaleString('vi-VN')}</td>
                          <td className={styles.tdBranch}>{t.stockName || '—'}</td>
                          <td className={styles.tdCreator}>{t.employeeName || '—'}</td>
                          <td className={styles.tdNotes}>{t.note || '—'}</td>
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
                    Hiển thị {(page - 1) * PAGE_SIZE + (checks.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} phiếu kiểm
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedCheck && (
        <CheckDetailModal
          check={selectedCheck}
          onClose={() => setSelectedCheck(null)}
          onSave={handleSaveCheck}
          onDelete={handleDeleteCheck}
        />
      )}

      {isAddModalOpen && (
        <AddCheckModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateCheck}
        />
      )}
    </div>
  );
}
