'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Package, ChevronLeft } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddPromotionModal from './AddPromotionModal';
import PromotionDetailModal from './PromotionDetailModal';
import styles from './PromotionPage.module.css';
import { getPromotions, Promotion, PromotionFilterParams } from '@/services/promotionService';

const PAGE_SIZE = 15;

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchPromotions = async (params: PromotionFilterParams) => {
    setLoading(true);
    try {
      const res = await getPromotions(params);
      setPromotions(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions({ page, pageSize: PAGE_SIZE, keyword, startDate, endDate });
  }, [page, keyword, startDate, endDate]);

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

  const handleSavePromotion = (updated: Promotion) => {
    setPromotions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedPromotion(null);
  };

  const handleDeletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((t) => t.id !== id));
    setTotal((t) => t - 1);
    setSelectedPromotion(null);
  };

  const handleCreatePromotion = (newPromo: Promotion) => {
    setPromotions((prev) => [newPromo, ...prev]);
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
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm theo mã khuyến mại, tên khuyến mại..."
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
                      <th className={styles.thCode}>Mã khuyến mại</th>
                      <th className={styles.thName}>Tên khuyến mại</th>
                      <th className={styles.thTime}>Ngày bắt đầu</th>
                      <th className={styles.thTime}>Ngày kết thúc</th>
                      <th className={styles.thNotes}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyRow}>
                          <Package size={32} className={styles.emptyIcon} />
                          <span>Không có khuyến mại nào</span>
                        </td>
                      </tr>
                    ) : (
                      promotions.map((t) => (
                        <tr key={t.id} className={styles.tr} onClick={() => setSelectedPromotion(t)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{t.code}</span></td>
                          <td className={styles.tdName}>{t.name}</td>
                          <td className={styles.tdTime}>{t.startDate}</td>
                          <td className={styles.tdTime}>{t.endDate}</td>
                          <td className={styles.tdNotes}>{t.notes || '—'}</td>
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
                    Hiển thị {(page - 1) * PAGE_SIZE + (promotions.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} khuyến mại
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedPromotion && (
        <PromotionDetailModal
          promotion={selectedPromotion}
          onClose={() => setSelectedPromotion(null)}
          onSave={handleSavePromotion}
          onDelete={handleDeletePromotion}
        />
      )}

      {isAddModalOpen && (
        <AddPromotionModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreatePromotion}
        />
      )}
    </div>
  );
}
