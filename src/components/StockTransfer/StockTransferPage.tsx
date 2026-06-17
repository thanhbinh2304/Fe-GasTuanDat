'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Loader2, Package, AlertCircle, ChevronLeft, ChevronDown } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddTransferModal from './AddTransferModal';
import TransferDetailModal from './TransferDetailModal';
import styles from './StockTransferPage.module.css';
import { getTransfers, Transfer, TransferFilterParams, createTransfer, updateTransfer, deleteTransfer, getTransferById, TransferDetail } from '@/services/transferService';
import { getStocks, FilterItem } from '@/services/productFilterService';

const PAGE_SIZE = 15;

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedFromStock, setSelectedFromStock] = useState('all');
  const [selectedToStock, setSelectedToStock] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState('all');

  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stocks, setStocks] = useState<FilterItem[]>([]);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadStocks = useCallback(async () => {
    try {
      const stockResult = await getStocks();
      setStocks(stockResult);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    void loadStocks();
  }, [loadStocks]);

  const fetchTransfers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: TransferFilterParams = {
        keyword,
        startDate,
        endDate,
        fromStock: selectedFromStock,
        toStock: selectedToStock,
        creator: selectedCreator,
        page,
        pageSize: PAGE_SIZE,
      };
      const res = await getTransfers(params);
      setTransfers(res.data);
      setTotal(res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, startDate, endDate, selectedFromStock, selectedToStock, selectedCreator, page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchTransfers();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchTransfers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setKeyword(e.target.value);
    }, 400);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setPage(1);
  };

  const handleFromStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFromStock(e.target.value);
    setPage(1);
  };

  const handleToStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToStock(e.target.value);
    setPage(1);
  };

  const handleCreatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCreator(e.target.value);
    setPage(1);
  };

  const handleSaveTransfer = async (updatedTransfer: Transfer) => {
    try {
      if (updatedTransfer.transferId && typeof updatedTransfer.transferId === 'string') {
        await updateTransfer(updatedTransfer.transferId, updatedTransfer);
        setTransfers((prev) =>
          prev.map((t) => (t.transferId === updatedTransfer.transferId ? updatedTransfer : t))
        );
      }
      setSelectedTransfer(null);
      void fetchTransfers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTransfer = async (transferId: string) => {
    try {
      if (typeof transferId === 'string') {
        await deleteTransfer(transferId);
      }
      setTransfers((prev) => prev.filter((t) => t.transferId !== transferId));
      setTotal((t) => t - 1);
      setSelectedTransfer(null);
      void fetchTransfers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTransfer = async (newTransfer: Transfer) => {
    try {
      const created = await createTransfer(newTransfer);
      setTransfers((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setIsAddModalOpen(false);
      void fetchTransfers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />

      <div className={styles.body}>
        {/* ===== SIDEBAR ===== */}
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
              <span>Từ kho</span>
            </div>
            <select
              className={styles.sideSelect}
              value={selectedFromStock}
              onChange={handleFromStockChange}
            >
              <option value="all">Tất cả kho</option>
              {stocks.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.sideDivider} />

          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Đến kho</span>
            </div>
            <select
              className={styles.sideSelect}
              value={selectedToStock}
              onChange={handleToStockChange}
            >
              <option value="all">Tất cả kho</option>
              {stocks.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.sideDivider} />

          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Người tạo</span>
            </div>
            <div className={styles.sideSearchBox}>
              <Search size={14} className={styles.sideSearchIcon} />
              <input
                type="text"
                placeholder="Tìm người tạo"
                className={styles.sideSearchInput}
                value={selectedCreator === 'all' ? '' : selectedCreator}
                onChange={(e) => {
                  setSelectedCreator(e.target.value || 'all');
                  setPage(1);
                }}
              />
            </div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Theo mã điều chuyển"
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
            {isLoading ? (
              <div className={styles.stateBox}>
                <Loader2 size={28} className={styles.spinner} />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : error ? (
              <div className={styles.stateBox}>
                <AlertCircle size={28} className={styles.errorIcon} />
                <span>{error}</span>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.thead}>
                      <th className={styles.thCode}>Mã điều chuyển</th>
                      <th className={styles.thTime}>Thời gian</th>
                      <th className={styles.thBranch}>Từ kho</th>
                      <th className={styles.thBranch}>Đến kho</th>
                      <th className={styles.thCreator}>Người tạo</th>
                      <th className={styles.thNotes}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={styles.emptyRow}>
                          <Package size={32} className={styles.emptyIcon} />
                          <span>Không có phiếu điều chuyển nào</span>
                        </td>
                      </tr>
                    ) : (
                      transfers.map((t) => (
                        <tr key={t.transferId} className={styles.tr} onClick={() => setSelectedTransfer(t)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{t.transferCode}</span></td>
                          <td className={styles.tdTime}>
                            {t.transferDate
                              ? new Date(t.transferDate).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </td>
                          <td className={styles.tdBranch}>{t.fromStockName || '—'}</td>
                          <td className={styles.tdBranch}>{t.toStockName || '—'}</td>
                          <td className={styles.tdCreator}>{t.employeeName}</td>
                          <td className={styles.tdNotes}>{t.note || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className={styles.tableFooter}>
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pageBtn}
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft size={15} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className={styles.pageBtn}
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <ChevronDown size={15} style={{ transform: 'rotate(-90deg)' }} />
                      </button>
                    </div>
                  )}
                  <div className={styles.footerInfo}>
                    Hiển thị {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} / {total} phiếu
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedTransfer && (
        <TransferDetailModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          onSave={handleSaveTransfer}
          onDelete={handleDeleteTransfer}
        />
      )}

      {isAddModalOpen && (
        <AddTransferModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateTransfer}
        />
      )}
    </div>
  );
}
