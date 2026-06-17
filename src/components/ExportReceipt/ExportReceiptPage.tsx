'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Package, ChevronLeft, ChevronDown } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddExportReceiptModal from './AddExportReceiptModal';
import ExportReceiptDetailModal from './ExportReceiptDetailModal';
import styles from './ExportReceiptPage.module.css';
import { getExportReceipts, deleteExportReceipt, ExportReceipt, ExportReceiptFilterParams } from '@/services/exportReceiptService';
import { getCustomerGroups, CustomerGroup } from '@/services/exportOrderService';
import { getStocks, FilterItem } from '@/services/productFilterService';
import { useRouter } from 'next/navigation';

import CustomerSearchInput from '@/components/ExportProcessing/CustomerSearchInput';
import { Customer } from '@/services/customerService';

const PAGE_SIZE = 15;

export default function ExportReceiptPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ExportReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<ExportReceipt | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [warehouses, setWarehouses] = useState<FilterItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchOrders = async (params: ExportReceiptFilterParams) => {
    setLoading(true);
    try {
      const res = await getExportReceipts(params);
      setOrders(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStocks().then(setWarehouses).catch(console.error);
  }, []);

  useEffect(() => {
    fetchOrders({
      page,
      pageSize: PAGE_SIZE,
      keyword,
      startDate,
      endDate,
      customerId: selectedCustomer?.code.startsWith('KH') ? String(selectedCustomer.id) : undefined,
      gasBookId: selectedCustomer?.code.startsWith('SG') ? String(selectedCustomer.id) : undefined,
      stockId: selectedWarehouseId || undefined
    });
  }, [page, keyword, startDate, endDate, selectedCustomer, selectedWarehouseId]);

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

  const handleSaveOrder = (updated: ExportReceipt) => {
    setOrders((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedOrder(null);
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      await deleteExportReceipt(id);
      setOrders((prev) => prev.filter((t) => t.id !== id));
      setTotal((t) => t - 1);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to delete export receipt', error);
      throw error;
    }
  };

  const handleCreateOrder = (newOrder: ExportReceipt) => {
    setOrders((prev) => [newOrder, ...prev]);
    setTotal((t) => t + 1);
    setIsAddModalOpen(false);
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
                placeholder="Tìm theo mã phiếu xuất hàng..."
                className={styles.searchInput}
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.btnPrimary} onClick={() => window.open('/xu-ly-xuat-hang', '_blank')}>
                <Plus size={15} />
                Phiếu xuất hàng
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
                      <th className={styles.thCode}>Mã phiếu xuất hàng</th>
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
                          <span>Không có phiếu xuất hàng nào</span>
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
                    Hiển thị {(page - 1) * PAGE_SIZE + (orders.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} phiếu xuất hàng
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedOrder && (
        <ExportReceiptDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={handleSaveOrder}
          onDelete={handleDeleteOrder}
        />
      )}

      {isAddModalOpen && (
        <AddExportReceiptModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateOrder}
        />
      )}
    </div>
  );
}
