'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Package, ChevronLeft, ChevronDown, GripVertical, Pencil } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddGasBookModal from './AddGasBookModal';
import GasBookDetailModal from './GasBookDetailModal';
import FilterItemModal, { FilterItemType, FilterItemMode } from './FilterItemModal';
import { getGasBooks, getCustomerGroups, GasBook, CustomerGroup } from '@/services/gasBookService';
import styles from './GasBookPage.module.css';

export default function GasBookPage() {
  const [data, setData] = useState<GasBook[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedBook, setSelectedBook] = useState<GasBook | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [filterModalConfig, setFilterModalConfig] = useState<{
    isOpen: boolean;
    type: FilterItemType;
    mode: FilterItemMode;
    initialData?: { code: string; name: string } | null;
  }>({
    isOpen: false,
    type: 'category',
    mode: 'create',
    initialData: null,
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groups = await getCustomerGroups();
        setCustomerGroups(groups);
      } catch (error) {
        console.error('Failed to fetch customer groups', error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGasBooks = async () => {
      setIsLoading(true);
      try {
        const res = await getGasBooks({ keyword: search, customerGroup: groupFilter });
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch gas books', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchGasBooks();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, groupFilter]);

  const handleUpdate = (updated: GasBook) => {
    setData(prev => prev.map(item => item.id === updated.id ? updated : item));
    setSelectedBook(null);
  };

  const handleDelete = (id: string | number) => {
    setData(prev => prev.filter(item => item.id !== id));
    setSelectedBook(null);
  };

  const handleCreate = (newBook: GasBook) => {
    setData([newBook, ...data]);
    setIsAddModalOpen(false);
  };

  const openFilterModal = (type: FilterItemType, mode: FilterItemMode, initialData: { code: string; name: string } | null = null) => {
    setFilterModalConfig({ isOpen: true, type, mode, initialData });
  };

  const closeFilterModal = () => {
    setFilterModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveFilterItem = async (data: { code: string; name: string }) => {
    if (filterModalConfig.type === 'category') {
      try {
        if (filterModalConfig.mode === 'create') {
          await import('@/services/customerService').then(m => m.createCustomerGroup(data.name));
        } else if (filterModalConfig.mode === 'edit' && filterModalConfig.initialData?.code) {
          await import('@/services/customerService').then(m => m.updateCustomerGroup(filterModalConfig.initialData!.code, data.name));
        }
        // Reload customer groups
        const groups = await getCustomerGroups();
        setCustomerGroups(groups);
      } catch (e) {
        console.error('Failed to create/update customer group', e);
      }
    }
  };

  const handleDeleteFilterItem = async () => {
    if (filterModalConfig.type === 'category' && filterModalConfig.initialData?.code) {
      try {
        await import('@/services/customerService').then(m => m.deleteCustomerGroup(filterModalConfig.initialData!.code));
        const groups = await getCustomerGroups();
        setCustomerGroups(groups);
      } catch (e) {
        console.error('Failed to delete customer group', e);
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Navbar />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Nhóm khách hàng</span>
              <button className={styles.sideLinkBtn} onClick={() => openFilterModal('category', 'create')}>Tạo mới</button>
            </div>
            <select 
              className={styles.sideSelect}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              {customerGroups.map(group => (
                <option key={group.id} value={group.name}>{group.name}</option>
              ))}
            </select>
            <ul className={styles.sideList}>
              {customerGroups.map(group => (
                <li key={group.id} className={styles.sideListItem}>
                  <GripVertical size={14} className={styles.gripIcon} />
                  <span>{group.name} </span>
                  <Pencil size={14} className={styles.editIcon} onClick={() => openFilterModal('category', 'edit', { code: group.id, name: group.name })} />
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Theo mã, tên sổ, SĐT khách hàng..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.thCode}>Mã sổ gas</th>
                  <th className={styles.thName}>Tên khách hàng</th>
                  <th className={styles.thCode}>Số điện thoại</th>
                  <th className={styles.thNum}>Dư nợ</th>
                  <th className={styles.thNotes}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>
                      <Loader2 size={32} className={`${styles.emptyIcon} animate-spin`} />
                      <span>Đang tải dữ liệu...</span>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>
                      <Package size={32} className={styles.emptyIcon} />
                      <span>Không có dữ liệu sổ gas</span>
                    </td>
                  </tr>
                ) : (
                  data.map(item => (
                    <tr key={item.id} className={styles.tr} onClick={() => setSelectedBook(item)}>
                      <td className={styles.tdCode}><span className={styles.codeLink}>{item.code}</span></td>
                      <td className={styles.tdName}>{item.customerName}</td>
                      <td className={styles.tdCode}>{item.phone}</td>
                      <td className={styles.tdNum} style={{ color: item.debt > 0 ? 'var(--danger-color)' : 'inherit' }}>
                        {new Intl.NumberFormat('vi-VN').format(item.debt)}
                      </td>
                      <td className={styles.tdNotes}>{item.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className={styles.tableFooter}>
              <div className={styles.footerInfo}>
                Hiển thị 1–{data.length} / {data.length} sổ gas
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedBook && (
        <GasBookDetailModal 
          gasBook={selectedBook} 
          onClose={() => setSelectedBook(null)} 
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {isAddModalOpen && (
        <AddGasBookModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreate}
        />
      )}

      <FilterItemModal
        isOpen={filterModalConfig.isOpen}
        onClose={closeFilterModal}
        onSave={handleSaveFilterItem}
        onDelete={handleDeleteFilterItem}
        type={filterModalConfig.type}
        mode={filterModalConfig.mode}
        initialData={filterModalConfig.initialData}
      />
    </div>
  );
}
