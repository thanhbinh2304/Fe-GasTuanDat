'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Package, ChevronLeft, ChevronDown } from 'lucide-react';
import Header from '@/components/Header/Header';
import Navbar from '@/components/Navbar/Navbar';
import AddPurchaseOrderModal from '../PurchaseOrder/AddPurchaseOrderModal';
import ImportReceiptDetailModal from './ImportReceiptDetailModal';
import styles from '../PurchaseOrder/PurchaseOrderPage.module.css';
import { getPurchaseOrders, PurchaseOrder, PurchaseOrderFilterParams } from '@/services/purchaseOrderService';
import { useRouter } from 'next/navigation';

import SupplierSearchInput from '@/components/OrderProcessing/SupplierSearchInput';
import { Supplier } from '@/services/supplierService';

const PAGE_SIZE = 15;

export default function ImportReceiptPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [stockId, setStockId] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const [stocks, setStocks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchOrders = async (params: PurchaseOrderFilterParams) => {
    setLoading(true);
    try {
      const res = await getPurchaseOrders(params);
      setOrders(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders({ page, pageSize: PAGE_SIZE, keyword, startDate, endDate, supplierId: selectedSupplier?.id ? String(selectedSupplier.id) : undefined, stockId, employeeId, orderType: 'Nhaphang' });
  }, [page, keyword, startDate, endDate, selectedSupplier, stockId, employeeId]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const { getStocks } = await import('@/services/productFilterService');
        const { getEmployees } = await import('@/services/employeeService');

        const [stockRes, empRes] = await Promise.all([
          getStocks(),
          getEmployees()
        ]);

        setStocks(stockRes || []);
        setEmployees(empRes.data || []);
      } catch (error) {
        console.error('Lỗi khi tải filter:', error);
      }
    };
    fetchFilters();
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

  const handleSaveOrder = (updated: PurchaseOrder) => {
    setOrders((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedOrder(null);
  };

  const handleDeleteOrder = async (id: string | number) => {
    try {
      await import('@/services/purchaseOrderService').then(m => m.deletePurchaseOrder(id.toString()));
      setOrders((prev) => prev.filter((t) => t.id !== id));
      setTotal((t) => t - 1);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
    }
  };

  const handleCreateOrder = (newOrder: PurchaseOrder) => {
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
              <span>Nhà cung cấp</span>
            </div>
            <SupplierSearchInput
              value={selectedSupplier}
              onChange={(s) => { setSelectedSupplier(s); setPage(1); }}
            />
          </div>

          <div className={styles.sideDivider} />

          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span>Kho</span>
            </div>
            <select
              className={styles.sideSelect}
              value={stockId}
              onChange={(e) => { setStockId(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả kho</option>
              {stocks.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
                placeholder="Tìm theo mã đặt hàng..."
                className={styles.searchInput}
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.btnPrimary} onClick={() => window.open('/xu-ly-nhap-hang', '_blank')}>
                <Plus size={15} />
                Phiếu nhập hàng
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
                      <th className={styles.thCode}>Mã phiếu nhập hàng</th>
                      <th className={styles.thTime}>Thời gian</th>
                      <th className={styles.thCode}>Mã nhà cung cấp</th>
                      <th className={styles.thName}>Tên nhà cung cấp</th>
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
                          <span>Không có phiếu nhập hàng nào</span>
                        </td>
                      </tr>
                    ) : (
                      orders.map((t) => (
                        <tr key={t.id} className={styles.tr} onClick={() => setSelectedOrder(t)}>
                          <td className={styles.tdCode}><span className={styles.codeLink}>{t.purchaseCode}</span></td>
                          <td className={styles.tdTime}>{t.createdAt}</td>
                          <td className={styles.tdCode}>{t.supplierCode}</td>
                          <td className={styles.tdName}>{t.supplierName}</td>
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
                    Hiển thị {(page - 1) * PAGE_SIZE + (orders.length > 0 ? 1 : 0)} - {Math.min(page * PAGE_SIZE, total)} trên tổng {total} phiếu nhập hàng
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedOrder && (
        <ImportReceiptDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={handleSaveOrder}
          onDelete={handleDeleteOrder}
        />
      )}

      {isAddModalOpen && (
        <AddPurchaseOrderModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleCreateOrder}
          stocks={stocks}
        />
      )}
    </div>
  );
}
