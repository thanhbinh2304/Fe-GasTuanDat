'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Package, ChevronLeft, ChevronDown } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddExportOrderModal from './AddExportOrderModal';
import ExportOrderDetailModal from './ExportOrderDetailModal';
import styles from './ExportOrderPage.module.css';
import { getExportOrders, createExportOrder, updateExportOrder, deleteExportOrder, getCustomerGroups, ExportOrder, ExportOrderFilterParams, CustomerGroup } from '@/services/exportOrderService';
import { getStocks, FilterItem } from '@/services/productFilterService';
import { useRouter } from 'next/navigation';

import CustomerSearchInput from '@/components/ExportProcessing/CustomerSearchInput';
import { Customer } from '@/services/customerService';

const PAGE_SIZE = 15;

export default function ExportOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ExportOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const getLocalDate = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(getLocalDate());
  const [endDate, setEndDate] = useState(getLocalDate());

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<ExportOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [warehouses, setWarehouses] = useState<FilterItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchOrders = async (params: ExportOrderFilterParams) => {
    setLoading(true);
    try {
      const res = await getExportOrders(params);
      setOrders(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders({
      page,
      pageSize: PAGE_SIZE,
      keyword,
      startDate,
      endDate,
      customerId: selectedCustomer?.code.startsWith('KH') ? String(selectedCustomer.id) : undefined,
      gasBookId: selectedCustomer?.code.startsWith('SG') ? String(selectedCustomer.id) : undefined,
      stockId: selectedWarehouseId || undefined,
      orderType: 'Dathang'
    });
  }, [page, keyword, startDate, endDate, selectedCustomer, selectedWarehouseId]);

  useEffect(() => {
    getStocks().then(setWarehouses).catch(console.error);
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

  const handleSaveOrder = async (updated: ExportOrder) => {
    try {
      const res = await updateExportOrder(updated.id, updated);
      setOrders((prev) => prev.map((t) => (t.id === res.id ? res : t)));
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update export order', error);
    }
  };

  const handleDeleteOrder = async (id: number | string) => {
    try {
      await deleteExportOrder(id);
      setOrders((prev) => prev.filter((t) => t.id !== id));
      setTotal((t) => t - 1);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to delete export order', error);
    }
  };

  const handleCreateOrder = async (newOrder: ExportOrder) => {
    try {
      const created = await createExportOrder(newOrder);
      setOrders((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create export order', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
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
              <span>Khách hàng</span>
            </div>
            <CustomerSearchInput
              value={selectedCustomer}
              onChange={(c) => { setSelectedCustomer(c); setPage(1); }}
            />
          </div>

          <div className={styles.sideDivider} />

          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Kho</span>
            </div>
            <select
              className={styles.sideSelect}
              value={selectedWarehouseId}
              onChange={(e) => { setSelectedWarehouseId(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả kho</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
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
                placeholder="Tìm theo mã đặt hàng xuất..."
                className={styles.searchInput}
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.btnPrimary} onClick={() => window.open('/xu-ly-xuat-hang', '_blank')}>
                <Plus size={15} />
                Đặt hàng xuất
              </button>
            </div>
          </div>

          <div className={styles.tableCard} style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className={styles.stateBox}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <table className={styles.table} style={{ minWidth: '1000px' }}>
                  <thead className={styles.thead}>
                    <tr>
                      <th className={styles.thCode}>Mã đặt hàng xuất</th>
                      <th className={styles.thTime}>Thời gian</th>
                      <th className={styles.thCode}>Mã khách hàng</th>
                      <th className={styles.thName}>Tên khách hàng</th>
                      <th className={styles.thNum}>Tổng tiền</th>
                      <th className={styles.thNum}>Giảm giá</th>
                      <th className={styles.thNum}>Tổng sau giảm giá</th>
                      <th className={styles.thNum}>Đã thanh toán</th>
                      <th className={styles.thNotes}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className={styles.emptyRow}>
                          <Package size={32} className={styles.emptyIcon} />
                          <span>Không có phiếu đặt hàng xuất nào</span>
                        </td>
                      </tr>
                    ) : (
                      orders.map((t) => (
                        <tr key={t.id} className={styles.tr} onClick={() => setSelectedOrder(t)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{t.code}</span></td>
                          <td className={styles.tdTime}>{t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : ''}</td>
                          <td className={styles.tdCode}>{t.customerCode}</td>
                          <td className={styles.tdName}>{t.customerName}</td>
                          <td className={styles.tdNum}>{formatCurrency(t.totalAmount)}</td>
                          <td className={styles.tdNum}>{formatCurrency(t.discount)}</td>
                          <td className={styles.tdNum} style={{ fontWeight: 600 }}>{formatCurrency(t.finalAmount)}</td>
                          <td className={styles.tdNum} style={{ color: 'var(--primary-color)' }}>{formatCurrency(t.paidAmount)}</td>
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
                    Hiển thị {(page - 1) * PAGE_SIZE + (orders.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} phiếu đặt hàng xuất
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedOrder && (
        <ExportOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={handleSaveOrder}
          onDelete={handleDeleteOrder}
        />
      )}

      {isAddModalOpen && (
        <AddExportOrderModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateOrder}
        />
      )}
    </div>
  );
}
