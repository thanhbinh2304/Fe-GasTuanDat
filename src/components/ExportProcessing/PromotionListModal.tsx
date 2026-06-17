'use client';
import React, { useState, useEffect } from 'react';
import { X, Search, Package, ChevronLeft, Loader2 } from 'lucide-react';
import { Promotion, PromotionFilterParams, getPromotions } from '@/services/promotionService';
import PromotionDetailModal from '@/components/Promotion/PromotionDetailModal';
import styles from './PromotionListModal.module.css';

interface PromotionListModalProps {
  onClose: () => void;
}

const PAGE_SIZE = 10;

export default function PromotionListModal({ onClose }: PromotionListModalProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

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
    fetchPromotions({ page, pageSize: PAGE_SIZE, keyword });
  }, [page, keyword]);

  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Danh sách chương trình khuyến mại</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm theo mã hoặc tên khuyến mại..."
                className={styles.searchInput}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
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
                <div className={styles.tableWrapper}>
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
                </div>

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
        </div>
      </div>

      {selectedPromotion && (
        <PromotionDetailModal
          promotion={selectedPromotion}
          onClose={() => setSelectedPromotion(null)}
          readOnly={true}
        />
      )}
    </div>
  );
}
