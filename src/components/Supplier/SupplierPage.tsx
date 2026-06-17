'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Package, ChevronLeft } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddSupplierModal from './AddSupplierModal';
import SupplierDetailModal from './SupplierDetailModal';

import styles from './SupplierPage.module.css';
import { getSuppliers, Supplier } from '@/services/supplierService';
import { useToastConfirm } from '@/components/ToastConfirm/ToastConfirmContext';

export type { Supplier };

const PAGE_SIZE = 15;

export default function SupplierPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');


  const [selectedBook, setSelectedBook] = useState<Supplier | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);



  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToastConfirm();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers({ keyword, page, pageSize: PAGE_SIZE });
      setData(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showToast('Thao tác không thành công', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, keyword]);

  const displayData = data;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setKeyword(val);
      setPage(1);
    }, 500);
  };

  const handleUpdate = (updated: Supplier) => {
    setData(prev => prev.map(item => item.id === updated.id ? updated : item));
    setSelectedBook(null);
  };

  const handleDelete = (id: string | number) => {
    setData(prev => prev.filter(item => item.id !== String(id)));
    setTotal(t => t - 1);
    setSelectedBook(null);
  };

  const handleCreate = (newSupplier: Supplier) => {
    setData(prev => [newSupplier, ...prev]);
    setTotal(t => t + 1);
    setIsAddModalOpen(false);
  };



  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />
      <div className={styles.body}>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Theo mã, tên, SĐT nhà cung cấp..."
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
              <div className={styles.stateBox ?? 'stateBox'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px', color: '#888' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th className={styles.thCode}>Mã nhà cung cấp</th>
                      <th className={styles.thName}>Tên nhà cung cấp</th>
                      <th className={styles.thCode}>Số điện thoại</th>
                      <th className={styles.thNum}>Email</th>
                      <th className={styles.thNotes}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyRow}>
                          <Package size={32} className={styles.emptyIcon} />
                          <span>Không có dữ liệu nhà cung cấp</span>
                        </td>
                      </tr>
                    ) : (
                      displayData.map(item => (
                        <tr key={item.id} className={styles.tr} onClick={() => setSelectedBook(item)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{item.code}</span></td>
                          <td className={styles.tdName}>{item.supplierName}</td>
                          <td className={styles.tdCode}>{item.phone}</td>
                          <td className={styles.tdNum}>{item.email || '—'}</td>
                          <td className={styles.tdNotes}>{item.notes || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className={styles.tableFooter}>
                  <div className={styles.pagination ?? 'pagination'} style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className={styles.pageBtn ?? 'pageBtn'}
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`${styles.pageBtn ?? ''} ${page === p ? (styles.pageBtnActive ?? 'active') : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn ?? 'pageBtn'}
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                  </div>
                  <div className={styles.footerInfo}>
                    Hiển thị {(page - 1) * PAGE_SIZE + (data.length > 0 ? 1 : 0)} – {Math.min(page * PAGE_SIZE, total)} / {total} nhà cung cấp
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedBook && (
        <SupplierDetailModal
          supplier={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {isAddModalOpen && (
        <AddSupplierModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreate}
        />
      )}


    </div>
  );
}
